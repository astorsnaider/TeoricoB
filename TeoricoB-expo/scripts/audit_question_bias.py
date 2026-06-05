#!/usr/bin/env python3
"""Audita el banco de preguntas para detectar sesgo de longitud
   ('la opción correcta tiende a ser la más larga')."""
import re
import sys
from collections import defaultdict
from pathlib import Path

QUESTIONS_FILE = Path(__file__).resolve().parents[1] / 'src' / 'data' / 'questions.ts'


def parse_options_array(opts_raw: str) -> list[str]:
    """Parsea ['a', 'b\\'c', 'd'] respetando apóstrofes escapados."""
    opts = []
    i = 0
    cur = []
    in_str = False
    while i < len(opts_raw):
        c = opts_raw[i]
        if c == "\\" and i + 1 < len(opts_raw):
            cur.append(opts_raw[i + 1])
            i += 2
            continue
        if c == "'":
            if in_str:
                opts.append(''.join(cur))
                cur = []
            in_str = not in_str
        elif in_str:
            cur.append(c)
        i += 1
    return opts


def main() -> int:
    text = QUESTIONS_FILE.read_text(encoding='utf-8')
    questions = []
    for line in text.splitlines():
        if "id: '" not in line or "correctIndex:" not in line:
            continue
        m_id = re.search(r"id:\s*'([^']+)'", line)
        m_ci = re.search(r"correctIndex:\s*(\d+)", line)
        m_cat = re.search(r"category:\s*'([^']+)'", line)
        m_opts = re.search(r"options:\s*\[(.*?)\]\s*,\s*correctIndex", line)
        if not (m_id and m_ci and m_opts):
            continue
        opts = parse_options_array(m_opts.group(1))
        if len(opts) < 2:
            continue
        questions.append({
            'id': m_id.group(1),
            'category': m_cat.group(1) if m_cat else '(sin categoria)',
            'options': opts,
            'correctIndex': int(m_ci.group(1)),
        })

    n = len(questions)
    print(f'Total preguntas extraídas: {n}')
    print()

    correct_is_longest = 0
    correct_is_top2 = 0
    length_diffs = []
    critical = []
    by_cat: dict[str, dict] = defaultdict(lambda: {'total': 0, 'longest': 0, 'sum_diff': 0.0})

    for q in questions:
        lens = [len(o) for o in q['options']]
        sorted_by_len = sorted(range(len(lens)), key=lambda i: -lens[i])
        pos = sorted_by_len.index(q['correctIndex'])
        is_longest = pos == 0
        if is_longest:
            correct_is_longest += 1
        if pos <= 1:
            correct_is_top2 += 1
        correct_len = lens[q['correctIndex']]
        others = [l for i, l in enumerate(lens) if i != q['correctIndex']]
        others_avg = sum(others) / max(1, len(others))
        diff_pct = (correct_len - others_avg) / max(1, others_avg) * 100
        length_diffs.append(diff_pct)
        if is_longest and diff_pct > 40:
            critical.append((q, diff_pct))
        by_cat[q['category']]['total'] += 1
        if is_longest:
            by_cat[q['category']]['longest'] += 1
        by_cat[q['category']]['sum_diff'] += diff_pct

    print(f'Correcta = opción MÁS LARGA:        {correct_is_longest:3d}/{n}  ({100 * correct_is_longest / n:5.1f}%)')
    print(f'Correcta en TOP 2 por longitud:      {correct_is_top2:3d}/{n}  ({100 * correct_is_top2 / n:5.1f}%)')
    print(f'Sesgo medio (correcta vs distractoras): {sum(length_diffs) / n:+.1f}%')
    print(f'CRÍTICAS (correcta más larga Y >40% más larga que media): {len(critical)}/{n} ({100 * len(critical) / n:.1f}%)')
    print()
    print('--- Por categoría (ordenado de peor a mejor) ---')
    for cat, s in sorted(by_cat.items(), key=lambda kv: -kv[1]['longest'] / max(1, kv[1]['total'])):
        pct = 100 * s['longest'] / max(1, s['total'])
        avg = s['sum_diff'] / max(1, s['total'])
        bar = '█' * int(pct / 5)
        print(f'  {cat:18s}  longest:{s["longest"]:3d}/{s["total"]:3d}  ({pct:5.1f}%)  sesgo medio:{avg:+5.0f}%  {bar}')

    print()
    print('--- 8 ejemplos del top de sesgo ---')
    for q, diff in sorted(critical, key=lambda x: -x[1])[:8]:
        lens = [len(o) for o in q['options']]
        print(f'  [{q["id"]}] ({q["category"]}) longitudes={lens}  correcta=#{q["correctIndex"]}  (+{diff:.0f}%)')
        for i, o in enumerate(q['options']):
            mark = '✓' if i == q['correctIndex'] else ' '
            print(f'    {mark} ({len(o):3d}) {o[:90]}{"…" if len(o) > 90 else ""}')
        print()

    return 0


if __name__ == '__main__':
    sys.exit(main())
