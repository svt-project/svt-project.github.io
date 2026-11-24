"""Package committed artwork without requiring a renderer or network access."""
from pathlib import Path
import hashlib
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/icons/v1'
DOWNLOADS = ROOT / 'public/assets/downloads'


def archive_bytes(cc0_only=False):
    entries = {}
    for path in sorted(ASSETS.rglob('*')):
        if not path.is_file():
            continue
        name = path.relative_to(ASSETS).as_posix()
        if cc0_only and not (path.suffix in {'.svg', '.png', '.ico', '.icns'}
                             and 'svt-file-ui-' not in name or name == 'CC0-1.0.txt'):
            continue
        entries[name] = path.read_bytes()
    if cc0_only:
        entries['README.txt'] = (
            'SVT original artwork v1\n\n'
            'Bathos Pty Ltd dedicates this original artwork and this notice under CC0 1.0.\n'
            'No attribution is required. See CC0-1.0.txt for the full legal text.\n'
            'Includes marks, avatars and outlined document icons, with SVG/PNG/ICO/ICNS exports.\n'
            'Use small artwork at 16-32 px and regular artwork at 48 px and above.\n'
            'Light/dark identify the intended background. Tintable inline SVG uses currentColor.\n'
            'This archive contains no Phosphor-derived filled UI icons.\n'
            'CC0 does not affect trademark or patent rights. Use does not imply endorsement.\n'
        ).encode()
    entries['SHA256SUMS'] = ''.join(
        f'{hashlib.sha256(data).hexdigest()}  {name}\n'
        for name, data in sorted(entries.items())
    ).encode()
    import io
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo('svt-icons-v1/' + name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return buffer.getvalue()


if __name__ == '__main__':
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    for name, cc0 in [('svt-icons-cc0-v1.zip', True), ('svt-icons-complete-v1.zip', False)]:
        (DOWNLOADS / name).write_bytes(archive_bytes(cc0))
    (DOWNLOADS / 'SHA256SUMS').write_text(''.join(
        f'{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n'
        for path in sorted(DOWNLOADS.glob('*.zip'))
    ))
    print('Packaged CC0 and complete icon downloads.')
