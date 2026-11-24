"""Package committed CC0 artwork without a renderer or network access."""
from pathlib import Path
import hashlib
import io
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/icons/v2'
DOWNLOADS = ROOT / 'public/assets/downloads'
ARCHIVE_NAME = 'svt-icons-v2.zip'
ARCHIVE_ROOT = 'svt-icons-v2/'


def archive_bytes():
    entries = {path.relative_to(ASSETS).as_posix(): path.read_bytes()
               for path in sorted(ASSETS.rglob('*')) if path.is_file()}
    entries['SHA256SUMS'] = ''.join(
        f'{hashlib.sha256(data).hexdigest()}  {name}\n'
        for name, data in sorted(entries.items())
    ).encode()
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo(ARCHIVE_ROOT + name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return buffer.getvalue()


if __name__ == '__main__':
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    data = archive_bytes()
    (DOWNLOADS / ARCHIVE_NAME).write_bytes(data)
    (DOWNLOADS / 'SHA256SUMS').write_text(f'{hashlib.sha256(data).hexdigest()}  {ARCHIVE_NAME}\n')
    print('Packaged CC0 icon download.')
