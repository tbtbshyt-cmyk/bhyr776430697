#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
توليد رمز QR لصفحة محلات أبو بشار وتحديثه داخل index.html وملف assets/qr.svg.

الاستخدام:
  python3 tools/make_qr.py                       # يستخدم الرابط الرسمي الموجود في index.html
  python3 tools/make_qr.py --url https://example.com/

يتطلب: pip install segno
"""
import argparse
import re
import sys
from pathlib import Path

try:
    import segno
except ImportError:
    sys.exit("يرجى تثبيت مكتبة segno أولًا:  pip install segno")

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
QR_FILE = ROOT / "assets" / "qr.svg"


def qr_svg(url: str, border: int = 2) -> str:
    q = segno.make(url, error="m")
    m = q.matrix
    parts = []
    for y, row in enumerate(m):
        x = 0
        while x < len(row):
            if row[x]:
                s = x
                while x < len(row) and row[x]:
                    x += 1
                parts.append(f"M{s + border} {y + border}h{x - s}v1h-{x - s}z")
            else:
                x += 1
    n = len(m) + 2 * border
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
        f'shape-rendering="crispEdges" role="img" aria-label="رمز QR">'
        f'<path d="{"".join(parts)}"/></svg>'
    )


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--url", default=None, help="رابط الصفحة (افتراضيًا: canonical من index.html)")
    args = p.parse_args()

    src = INDEX.read_text(encoding="utf-8")
    url = args.url
    if not url:
        m = re.search(r'<link rel="canonical" href="([^"]+)"', src)
        if not m:
            sys.exit("لم يتم العثور على canonical في index.html — مرر --url يدويًا")
        url = m.group(1)

    svg = qr_svg(url)
    QR_FILE.write_text(svg, encoding="utf-8")

    begin, end = "<!-- QR:BEGIN -->", "<!-- QR:END -->"
    if begin in src and end in src:
        i = src.index(begin) + len(begin)
        j = src.index(end)
        src = src[:i] + "\n      " + svg + "\n      " + src[j:]
        INDEX.write_text(src, encoding="utf-8")

    print(f"تم تحديث رمز QR للرابط: {url} ✓")


if __name__ == "__main__":
    main()
