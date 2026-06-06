#!/usr/bin/env python3
"""Audita el banco de preguntas para detectar SESGOS DE FORMA que
delatan la opción correcta sin necesidad de entender la materia.

Cubre:
- Sesgo de longitud (la correcta tiende a ser la más larga)
- Sesgo de paréntesis (paréntesis solo en la correcta)
- Sesgo de punto y coma (estructura ; solo en la correcta)
- Sesgo de calificadores ("salvo", "excepto", "siempre que" solo en correcta)
- Sesgo de listas (correcta enumera más elementos)
"""
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


def parse_questions() -> list[dict]:
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
    return questions


CALIFIERS = ['salvo', 'excepto', 'siempre que', 'incluso si', 'aunque ']


def detect_giveaways(q: dict) -> list[str]:
    """Devuelve los marcadores de forma que delatan la correcta."""
    correct = q['options'][q['correctIndex']]
    others = [o for i, o in enumerate(q['options']) if i != q['correctIndex']]
    flags = []

    # 1. Paréntesis solo en correcta
    if '(' in correct and not any('(' in o for o in others):
        flags.append('PAREN_solo_correcta')

    # 2. Punto y coma solo en correcta
    if ';' in correct and not any(';' in o for o in others):
        flags.append('SEMI_solo_correcta')

    # 3. Calificadores cautelosos solo en correcta
    cl = correct.lower()
    for cal in CALIFIERS:
        if cal in cl and not any(cal in o.lower() for o in others):
            flags.append(f'CALIF_{cal.strip()}_solo_correcta')
            break

    # 4. Longitud: correcta es la más larga Y >30% más larga que la media
    lens = [len(o) for o in q['options']]
    correct_len = lens[q['correctIndex']]
    others_avg = sum(lens[i] for i in range(len(lens)) if i != q['correctIndex']) / max(1, len(lens) - 1)
    if correct_len == max(lens) and correct_len > others_avg * 1.30:
        flags.append(f'LONG_+{(correct_len/others_avg-1)*100:.0f}%')

    # 5. Longitud: correcta es la más corta Y <70% de la media (el reverso)
    if correct_len == min(lens) and correct_len < others_avg * 0.70:
        flags.append(f'CORTA_-{(1-correct_len/others_avg)*100:.0f}%')

    # 6. Lista de coma/y: correcta tiene más comas que las distractoras
    correct_commas = correct.count(',')
    avg_commas = sum(o.count(',') for o in others) / max(1, len(others))
    if correct_commas >= 3 and correct_commas > avg_commas + 1.5:
        flags.append(f'LISTA_{correct_commas}_comas')

    return flags


def main() -> int:
    questions = parse_questions()
    n = len(questions)

    # Análisis por categoría
    cat_totals = defaultdict(int)
    cat_flagged = defaultdict(int)
    cat_giveaways = defaultdict(lambda: defaultdict(int))
    flagged_qs = []

    for q in questions:
        cat_totals[q['category']] += 1
        flags = detect_giveaways(q)
        if flags:
            cat_flagged[q['category']] += 1
            for f in flags:
                # Agrupar por tipo (sin valores numéricos)
                key = re.sub(r'[\d+\-%]', '', f)
                cat_giveaways[q['category']][key] += 1
            flagged_qs.append((q, flags))

    print(f'Total preguntas: {n}')
    print(f'Preguntas con al menos UN marcador delatador: {len(flagged_qs)} ({100*len(flagged_qs)/n:.1f}%)')
    print()
    print('--- Por categoría (ordenado de peor a mejor) ---')
    for cat in sorted(cat_totals, key=lambda c: -cat_flagged[c] / max(1, cat_totals[c])):
        flagged = cat_flagged[cat]
        total = cat_totals[cat]
        pct = 100 * flagged / total
        bar = '#' * int(pct / 5)
        print(f'  {cat:18s} {flagged:3d}/{total:3d}  ({pct:5.1f}%) {bar}')
        # detalle de tipos
        if cat_giveaways[cat]:
            details = ', '.join(f'{k}:{v}' for k, v in sorted(cat_giveaways[cat].items(), key=lambda kv: -kv[1])[:3])
            print(f'                       top: {details}')

    print()
    print('--- 15 preguntas con MÁS marcadores ---')
    flagged_qs.sort(key=lambda x: -len(x[1]))
    for q, flags in flagged_qs[:15]:
        print(f'  [{q["id"]}] ({q["category"]}) {len(flags)} flags: {", ".join(flags)}')

    return 0


if __name__ == '__main__':
    sys.exit(main())
