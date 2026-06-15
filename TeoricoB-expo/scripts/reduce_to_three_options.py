#!/usr/bin/env python3
"""Convierte TODAS las preguntas de 4 opciones (ABCD) a 3 (ABC), como el
examen real de la DGT.

Regla de eliminación: se quita el ÚLTIMO distractor (el índice más alto que
NO sea la respuesta correcta). Si la correcta es la última, se quita la
penúltima. Así:
  - El TEXTO de la respuesta correcta nunca cambia.
  - Quedan exactamente 3 opciones.
  - correctIndex se reajusta si el eliminado estaba antes que la correcta.

Edita src/data/questions.ts in-place. Cada pregunta está en una sola línea.
"""
import re
import sys
from pathlib import Path

QUESTIONS_FILE = Path(__file__).resolve().parents[1] / 'src' / 'data' / 'questions.ts'

OPTS_RE = re.compile(r"options:\s*\[(.*?)\]\s*,\s*correctIndex:\s*(\d+)")


def parse_options_array(opts_raw: str) -> list[str]:
    opts, cur, in_str, i = [], [], False, 0
    while i < len(opts_raw):
        c = opts_raw[i]
        if c == "\\" and i + 1 < len(opts_raw):
            cur.append(opts_raw[i + 1]); i += 2; continue
        if c == "'":
            if in_str:
                opts.append(''.join(cur)); cur = []
            in_str = not in_str
        elif in_str:
            cur.append(c)
        i += 1
    return opts


def emit_option(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def main() -> int:
    text = QUESTIONS_FILE.read_text(encoding='utf-8')
    lines = text.splitlines(keepends=True)

    changed = 0
    anomalies = []

    for li, line in enumerate(lines):
        if "id: '" not in line or "correctIndex:" not in line:
            continue
        m = OPTS_RE.search(line)
        if not m:
            continue
        opts = parse_options_array(m.group(1))
        ci = int(m.group(2))
        n = len(opts)
        qid_m = re.search(r"id:\s*'([^']+)'", line)
        qid = qid_m.group(1) if qid_m else f'line{li}'

        if n != 4:
            anomalies.append(f"[{qid}] tiene {n} opciones (esperaba 4) — se omite")
            continue
        if ci < 0 or ci >= n:
            anomalies.append(f"[{qid}] correctIndex {ci} fuera de rango — se omite")
            continue

        remove_idx = n - 1 if ci != n - 1 else n - 2
        correct_text = opts[ci]
        new_opts = [o for k, o in enumerate(opts) if k != remove_idx]
        new_ci = ci - 1 if remove_idx < ci else ci

        # Invariantes
        if len(new_opts) != 3:
            anomalies.append(f"[{qid}] resultado != 3 opciones — ABORTA"); return fail(anomalies)
        if new_opts[new_ci] != correct_text:
            anomalies.append(f"[{qid}] el texto correcto cambió — ABORTA"); return fail(anomalies)

        new_inner = ", ".join(emit_option(o) for o in new_opts)
        replacement = f"options: [{new_inner}], correctIndex: {new_ci}"
        lines[li] = line[:m.start()] + replacement + line[m.end():]
        changed += 1

    if anomalies:
        print("Anomalías (no abortantes):")
        for a in anomalies:
            print("  -", a)

    QUESTIONS_FILE.write_text(''.join(lines), encoding='utf-8')
    print(f"\nPreguntas convertidas a 3 opciones: {changed}")
    return 0


def fail(anomalies):
    print("ABORTADO sin escribir. Problemas:")
    for a in anomalies:
        print("  -", a)
    return 1


if __name__ == '__main__':
    sys.exit(main())
