"""Portable static-site verifier shipped with lessons-site/qa/.

Checks HTML structure, unique IDs, local file/fragment links, image attributes
and PNG dimensions, answer-leak separation, and the three source-table PDFs.
Does not claim to reproduce full ephem/audit scripts from private evidence/
or human/game acceptance.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib
import json
import struct

QA_DIR = Path(__file__).resolve().parent
SITE = QA_DIR.parent

PINNED_TABLES = {
    'source-tables/[1] Nautical Almanac SH5 1939-1945.pdf':
        '0faa33d1afc3835a4cca72c8c7b21750e611ad5e11a339adffe14c6f50068f48',
    'source-tables/[2] F-Tafel.pdf':
        '8065b67fd4d5b7f92f576c4d5ad05560bfcaebd732193eacd2a181b611678361',
    "source-tables/Fulst's Nautische Tafeln.pdf":
        '9b2f97fd8119263e30ef9a091872a4ffdddd4c0362601d4184770314c9456613',
}

WITHHELD_ANSWERS = [
    '19°04,3′', '7°02,3′', '13°56,0′', '20°55,6′',
    '39°28,57′', '32°50,0′', '39°42,09′', '39°42,53′',
    '4 NM E и 4 NM S от O', '9°06,8′ E', '150,7°', '210,6°',
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_size(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    assert header[:8] == b'\x89PNG\r\n\x1a\n', f'Not a PNG: {path}'
    return struct.unpack('>II', header[16:24])


class ParsedPage(HTMLParser):
    def __init__(self, text: str) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.links: list[str] = []
        self.images: list[dict[str, str]] = []
        self.external_assets: list[str] = []
        self.has_ru = False
        self.has_viewport = False
        self.feed(text)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k: (v or '') for k, v in attrs}
        if tag == 'html' and data.get('lang') == 'ru':
            self.has_ru = True
        if tag == 'meta' and data.get('name') == 'viewport' and 'width=device-width' in data.get('content', ''):
            self.has_viewport = True
        if data.get('id'):
            self.ids.append(data['id'])
        if tag == 'a' and data.get('href'):
            self.links.append(data['href'])
        if tag == 'img':
            self.images.append(data)
            if data.get('src'):
                self.links.append(data['src'])
        if tag in {'img', 'script', 'link'}:
            target = data.get('src') or data.get('href') or ''
            if target.startswith(('http://', 'https://', '//')):
                self.external_assets.append(target)


def main() -> dict[str, object]:
    checks: list[str] = []

    def check(name: str, condition: bool) -> None:
        assert condition, name
        checks.append(name)
        print('PASS:', name)

    html_Paths = sorted(SITE.glob('*.html')) + ([QA_DIR / 'index.html'] if (QA_DIR / 'index.html').exists() else [])
    pages = {path.resolve(): ParsedPage(path.read_text(encoding='utf-8')) for path in html_Paths}
    check('all root HTML pages and QA page present with lang=ru and viewport',
          len(html_Paths) >= 12 and all(p.has_ru and p.has_viewport for p in pages.values()))
    check('unique HTML IDs within every page and no external asset dependencies',
          all(len(p.ids) == len(set(p.ids)) and not p.external_assets for p in pages.values()))

    broken: list[tuple[str, str]] = []
    for path, parsed in pages.items():
        for href in parsed.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if not target.exists():
                broken.append((path.name, href))
            elif target in pages and url.fragment and url.fragment not in pages[target].ids:
                broken.append((path.name, href))
    check('all local file links and cross-page HTML fragments resolve', not broken)

    bad_images: list[str] = []
    for path, parsed in pages.items():
        for img in parsed.images:
            img_path = (path.parent / unquote(urlsplit(img.get('src', '')).path)).resolve()
            if not img_path.is_file() or not img.get('alt', '').strip():
                bad_images.append(f'{path.name}:{img.get("src")}')
                continue
            if img_path.suffix.lower() == '.png':
                w, h = png_size(img_path)
                if str(w) != img.get('width') or str(h) != img.get('height'):
                    bad_images.append(f'{path.name}:{img.get("src")} size mismatch')
    check('all HTML images exist, have alt text and matching PNG dimensions', not bad_images)

    learner_pages = ['BASICS.html', 'TRAINING.html', 'START.html', 'WORKSHEET.html',
                     'STARTER-WORKSHEET.html', 'FIELD.html', 'GUIDE.html']
    learner_text = '\n'.join((SITE / name).read_text(encoding='utf-8') for name in learner_pages)
    answers_text = (SITE / 'ANSWERS.html').read_text(encoding='utf-8')
    check('independent task answers appear only on ANSWERS.html',
          not any(term in learner_text for term in WITHHELD_ANSWERS) and
          all(term in answers_text for term in WITHHELD_ANSWERS))

    table_ok = all((SITE / rel).is_file() and sha256(SITE / rel) == digest
                   for rel, digest in PINNED_TABLES.items())
    check('three source-table PDFs present and match pinned SHA-256', table_ok)

    print(f'PORTABLE SITE CHECKS: {len(checks)} PASS / 0 FAIL (static structure & hashes only)')
    return {'passed': len(checks), 'failed': 0, 'checks': checks}


if __name__ == '__main__':
    main()
