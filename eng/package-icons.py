"""Package committed CC0 artwork without a renderer or network access."""
from pathlib import Path
import hashlib
import io
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/icons'
DOWNLOADS = ROOT / 'public/assets/downloads'
ARCHIVE_NAME = 'svt-icons.zip'
ARCHIVE_ROOT = 'svt-icons/'


def archive_bytes(assets=ASSETS, archive_root=ARCHIVE_ROOT):
    entries = {path.relative_to(assets).as_posix(): path.read_bytes()
               for path in sorted(assets.rglob('*')) if path.is_file()}
    entries['SHA256SUMS'] = ''.join(
        f'{hashlib.sha256(data).hexdigest()}  {name}\n'
        for name, data in sorted(entries.items())
    ).encode()
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo(archive_root + name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return buffer.getvalue()


if __name__ == '__main__':
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    data = archive_bytes()
    (DOWNLOADS / ARCHIVE_NAME).write_bytes(data)
    (DOWNLOADS / 'SHA256SUMS').write_text(''.join(
        f'{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n'
        for path in sorted(DOWNLOADS.glob('*.zip'))))
    print('Packaged CC0 icon download.')
