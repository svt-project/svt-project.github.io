"""Validate the deployed tree, local links and distributable icon bundle offline."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import importlib.util
import unittest
from icon_checks import check_assets
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
errors = []


def require(condition, message):
    if not condition:
        errors.append(message)


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.headings = [], set(), 0
        self.path = path
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            require(attrs['id'] not in self.ids, f'{self.path}: duplicate id')
            self.ids.add(attrs['id'])
        for attribute in ['href', 'src']:
            if attribute in attrs:
                self.links.append(attrs[attribute])
        if tag == 'img':
            require('alt' in attrs, f'{self.path}: image needs alt')
            self.links.extend(candidate.strip().split()[0] for candidate in attrs.get('srcset', '').split(',') if candidate.strip())
        if tag == 'h1':
            self.headings += 1
        require(tag != 'script', f'{self.path}: initial site must work without scripts')


pages = {path: Page(path) for path in PUBLIC.rglob('*.html')}


def check_link(source, link, site=False):
    parsed = urlsplit(link)
    if parsed.scheme or parsed.netloc:
        return
    target = (PUBLIC / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/')
              else source.parent / unquote(parsed.path)) if parsed.path else source
    target = target.resolve()
    if target.is_dir():
        target /= 'index.html'
    require(target.is_relative_to(ROOT), f'{source}: link escapes repository: {link}')
    require(target.is_file(), f'{source.relative_to(ROOT)}: broken link {link}')
    if site:
        require(target.is_relative_to(PUBLIC), f'{source}: undeployed link {link}')
    if parsed.fragment and target in pages:
        require(unquote(parsed.fragment) in pages[target].ids, f'{source}: missing anchor {link}')


for path, page in pages.items():
    require(page.headings == 1, f'{path}: expected one h1')
    for link in page.links:
        check_link(path, link, True)
for path in ROOT.rglob('*.md'):
    if any(part in {'.git', '.local'} for part in path.parts):
        continue
    content = path.read_text()
    require(not any(line.rstrip() != line for line in content.splitlines()), f'{path}: trailing whitespace')
    for link in re.findall(r'\]\(([^)]+)\)', content):
        check_link(path, link)

assets = PUBLIC / 'assets/icons'
ns = '{http://www.w3.org/2000/svg}'
errors.extend(check_assets())
for path in assets.glob('svg/*.svg'):
    tree = ET.parse(path)
    for element in tree.iter():
        require(element.tag in {ns + tag for tag in ['svg', 'g', 'path', 'title']}, f'{path}: unexpected SVG element')
        require(not any(k.startswith('on') or 'href' in k or 'url(' in v for k, v in element.attrib.items()),
                f'{path}: active or external SVG resource')
    if 'file-ui' in path.name:
        paths = tree.findall(ns + 'path')
        require(len(paths) == 1 and paths[0].get('fill-rule') == 'evenodd', f'{path}: lost fill rule')

spec = importlib.util.spec_from_file_location('package_icons', ROOT / 'eng/package-icons.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)
path = package.DOWNLOADS / package.ARCHIVE_NAME
require(path.read_bytes() == package.archive_bytes(), 'Stale icon archive; run eng/package-icons.py')
with zipfile.ZipFile(path) as archive:
    require(archive.testzip() is None, 'Corrupt ZIP')
    require(package.ARCHIVE_ROOT + 'CC0-1.0.txt' in archive.namelist(), 'CC0 dedication missing')
    for line in archive.read(package.ARCHIVE_ROOT + 'SHA256SUMS').decode().splitlines():
        digest, filename = line.split('  ', 1)
        require(hashlib.sha256(archive.read(package.ARCHIVE_ROOT + filename)).hexdigest() == digest, 'Bad asset digest')
require({p.name for p in package.DOWNLOADS.iterdir()} == {package.ARCHIVE_NAME, 'SHA256SUMS'},
        'Downloads must contain exactly one current bundle and its checksum')
checksum = f'{hashlib.sha256(path.read_bytes()).hexdigest()}  {package.ARCHIVE_NAME}\n'
require((package.DOWNLOADS / 'SHA256SUMS').read_text() == checksum, 'Bad archive checksum')
result = unittest.TextTestRunner().run(unittest.defaultTestLoader.discover(str(ROOT / 'eng'), pattern='test_*.py'))
require(result.wasSuccessful(), 'Icon acceptance regression tests failed')
require('https://svt-project.github.io/ns/svt' in (PUBLIC / 'ns/svt/index.html').read_text(), 'Namespace missing')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Passed: {len(pages)} pages, links, optical/raster acceptance, circle-safe avatars, desktop containers and one reproducible CC0 bundle.')
