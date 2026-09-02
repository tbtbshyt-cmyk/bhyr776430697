#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
استخراج قائمة الروابط الحالية من index.html إلى:
  - tools/links.json  (قائمة منظمة سهلة التعديل والقراءة)
  - tools/links.md    (جدول واضح للمراجعة السريعة)

الاستخدام:  python3 tools/build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

CARD_RE = re.compile(
    r'<a class="card([^"]*)" href="([^"]+)"[^>]*>.*?'
    r'<span class="card__title">(.*?)</span>\s*'
    r'<span class="card__desc">(.*?)</span>',
    re.S,
)


def clean(s: str) -> str:
    s = re.sub(r"<em[^>]*>(.*?)</em>", r" [\1]", s)
    s = re.sub(r"<span[^>]*>(.*?)</span>", r" (\1)", s)
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


def main():
    src = INDEX.read_text(encoding="utf-8")
    i = src.index("<!-- LINKS:BEGIN -->")
    j = src.index("<!-- LINKS:END -->")
    block = src[i:j]

    links = []
    for classes, href, title, desc in CARD_RE.findall(block):
        platform = ""
        m = re.search(r"card--([a-z0-9-]+)", classes)
        if m:
            platform = m.group(1)
        links.append({
            "platform": platform,
            "title": clean(title),
            "desc": clean(desc),
            "url": html.unescape(href),
            "featured": "featured" in classes,
        })

    out = ROOT / "tools" / "links.json"
    out.write_text(json.dumps(links, ensure_ascii=False, indent=2), encoding="utf-8")

    md = ["# روابط محلات أبو بشار للملابس والأحذية", "",
          "| المنصة | العنوان | الوصف | الرابط |",
          "|---|---|---|---|"]
    for l in links:
        md.append(f"| {l['platform']} | {l['title']} | {l['desc']} | {l['url']} |")
    (ROOT / "tools" / "links.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    print(f"تم استخراج {len(links)} رابطًا → tools/links.json و tools/links.md ✓")


if __name__ == "__main__":
    main()
