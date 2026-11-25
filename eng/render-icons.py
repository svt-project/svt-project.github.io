"""Regenerate artwork offline with the pinned resvg renderer."""
import argparse
import struct
import subprocess
from icon_artwork import (ASSETS, GEOMETRY, ICO_SIZES, ICNS_ENTRIES, variants,
                          stem, svg, raster_sizes, png_path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--resvg', required=True, help='Path to resvg 0.47.0')
    args = parser.parse_args()
    version = subprocess.check_output([args.resvg, '--version'], text=True).strip()
    if version != GEOMETRY['renderer'].removeprefix('resvg '):
        raise SystemExit(f"Expected {GEOMETRY['renderer']}, got {version}")
    for family, size, theme in variants():
        source = ASSETS / 'svg' / f'{stem(family, size, theme)}.svg'
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text(svg(family, size, theme))
        if theme == 'tintable':
            continue
        for pixels in raster_sizes(size):
            output = png_path(family, size, theme, pixels)
            output.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run([args.resvg, '--width', str(pixels), '--height', str(pixels),
                            str(source), str(output)], check=True, capture_output=True)
    for theme in ('light', 'dark'):
        images = [(size, png_path('document', min(size, 64), theme, size).read_bytes()) for size in ICO_SIZES]
        offset = 6 + 16*len(images)
        directory = bytearray(struct.pack('<HHH', 0, 1, len(images)))
        for size, data in images:
            directory.extend(struct.pack('<BBBBHHII', size % 256, size % 256, 0, 0, 1, 32, len(data), offset))
            offset += len(data)
        (ASSETS / f'svt-document-{theme}.ico').write_bytes(directory + b''.join(data for _, data in images))
        chunks = []
        for code, master, pixels in ICNS_ENTRIES:
            data = png_path('document', master, theme, pixels).read_bytes()
            chunks.append(code.encode() + struct.pack('>I', len(data)+8) + data)
        body = b''.join(chunks)
        (ASSETS / f'svt-document-{theme}.icns').write_bytes(b'icns' + struct.pack('>I', len(body)+8) + body)
    print('Rendered SVG/PNG optical masters and ICO/ICNS containers.')


if __name__ == '__main__':
    main()
