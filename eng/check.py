"""Validate the deployed tree, local links and distributable icon snapshots offline."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import importlib.util
import re
import struct
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

assets = PUBLIC / 'assets/icons/v1'
ns = '{http://www.w3.org/2000/svg}'
for path in assets.glob('svg/*.svg'):
    tree = ET.parse(path)
    for element in tree.iter():
        require(element.tag in {ns + tag for tag in ['svg', 'g', 'rect', 'path', 'title']}, f'{path}: unexpected SVG element')
        require(not any(k.startswith('on') or 'href' in k or 'url(' in v for k, v in element.attrib.items()), f'{path}: active or external SVG resource')
    if 'file-ui' in path.name:
        paths = tree.findall(ns + 'path')
        require(len(paths) == 1 and paths[0].get('fill-rule') == 'evenodd', f'{path}: lost fill rule')
for path in assets.glob('png/*/*.png'):
    data = path.read_bytes()
    size = int(path.stem)
    require(data[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', data[16:24]) == (size, size), f'{path}: PNG dimensions')
for path in assets.glob('*.ico'):
    data = path.read_bytes()
    require(struct.unpack('<HHH', data[:6]) == (0, 1, 7), f'{path}: ICO header')
    for i, size in enumerate([16, 24, 32, 48, 64, 128, 256]):
        w, h, _, _, planes, bits, length, offset = struct.unpack('<BBBBHHII', data[6+i*16:22+i*16])
        png = data[offset:offset+length]
        require((w or 256, h or 256, planes, bits) == (size, size, 1, 32), f'{path}: ICO entry')
        require(png[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', png[16:24]) == (size, size), f'{path}: ICO image')
for path in assets.glob('*.icns'):
    data = path.read_bytes()
    require(data[:4] == b'icns' and struct.unpack('>I', data[4:8])[0] == len(data), f'{path}: ICNS header')

spec = importlib.util.spec_from_file_location('package_icons', ROOT / 'eng/package-icons.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)
for name, cc0 in [('svt-icons-cc0-v1.zip', True), ('svt-icons-complete-v1.zip', False)]:
    path = PUBLIC / 'assets/downloads' / name
    require(path.read_bytes() == package.archive_bytes(cc0), f'{name}: stale archive; run eng/package-icons.py')
    with zipfile.ZipFile(path) as archive:
        require(archive.testzip() is None, f'{name}: corrupt ZIP')
        require(not cc0 or all('svt-file-ui-' not in n and 'Phosphor' not in n for n in archive.namelist()), 'CC0 archive includes third-party artwork')
        for line in archive.read('svt-icons-v1/SHA256SUMS').decode().splitlines():
            digest, filename = line.split('  ', 1)
            require(hashlib.sha256(archive.read('svt-icons-v1/' + filename)).hexdigest() == digest, f'{name}: bad asset digest')
for line in (PUBLIC / 'assets/downloads/SHA256SUMS').read_text().splitlines():
    digest, name = line.split('  ', 1)
    require(hashlib.sha256((PUBLIC / 'assets/downloads' / name).read_bytes()).hexdigest() == digest, 'Bad archive checksum')
require('https://svt-project.github.io/ns/svt' in (PUBLIC / 'ns/svt/index.html').read_text(), 'Namespace missing')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Passed: {len(pages)} pages, local HTML/Markdown links, SVG safety, PNG/ICO/ICNS structure, license separation and reproducible archives.')
