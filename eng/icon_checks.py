"""Offline acceptance checks for icon geometry, raster legibility and desktop containers."""
import math
import struct
import zlib
from icon_artwork import (ASSETS, GEOMETRY, SIZES, ICO_SIZES, ICNS_ENTRIES,
                          variants, stem, svg, raster_sizes, png_path)


def bounds(points):
    xs, ys = zip(*points)
    return min(xs), min(ys), max(xs), max(ys)


def geometry_errors(layouts):
    errors = []
    if set(layouts) != {str(size) for size in SIZES}:
        errors.append('Optical masters must be exactly 16, 20, 24, 32, 48 and 64 px.')
    for size in SIZES:
        if str(size) not in layouts:
            continue
        layout = layouts[str(size)]
        fx, fy, fw, fh, _ = layout['frame']
        sx, sy, sw, sh, fold, _ = layout['sheet']
        if (fx, fy, fw, fh) != (0, 0, size, size) or sx+sw/2 != size/2 or sy != 0 or sh != size:
            errors.append(f'{size}: silhouettes must be centered and fill their logical height')
        bracket = layout['bracket']
        if len(bracket) != 6:
            errors.append(f'{size}: bracket must have six vertices')
            continue
        bx, by, br, bb = bounds(bracket)
        if size-2*br < 2:
            errors.append(f'{size}: bracket center bridge must be at least two pixels')
        p0, p1, p2, p3, p4, p5 = bracket
        if not (p0[0] == p2[0] and p3[0] == p5[0]
                and p0[1]+p2[1] == 2*p1[1] == 2*p4[1] == p3[1]+p5[1]
                and p0[1] < p5[1] < p1[1] < p3[1] < p2[1]
                and p1[0] < p4[0] < p3[0] and p1[0] < p0[0] < p3[0]):
            errors.append(f'{size}: bracket must retain symmetric arms and an open notch')
        if min(math.dist(p0, p5), math.dist(p2, p3), p4[0]-p1[0], p3[0]-p4[0]) < 1:
            errors.append(f'{size}: bracket arms or notch are too thin')
        # Measure perpendicular arm width, independent of cap shape or pixel alignment.
        expected_weight = size*math.sqrt(2)/16
        for start, end, inner in ((p0, p1, (p5, p4)), (p1, p2, (p4, p3))):
            dx, dy = end[0]-start[0], end[1]-start[1]
            length = math.hypot(dx, dy)
            if not length or any(not math.isclose(
                    abs(dx*(point[1]-start[1])-dy*(point[0]-start[0]))/length,
                    expected_weight, abs_tol=1e-6) for point in inner):
                errors.append(f'{size}: bracket arm weight must match the icon family')
                break
        if min(bx-sx, sx+sw-(size-bx), size-bb) < 1:
            errors.append(f'{size}: insufficient bracket silhouette clearance')
        for name in ('square', 'file'):
            image = layout[name]['image']
            if len(image) != 6:
                errors.append(f'{size} {name}: landscape must have six vertices')
                continue
            x, y, right, bottom = bounds(image)
            if (x+right)/2 != size/2:
                errors.append(f'{size} {name}: picture bounds must be centered')
            if right-x <= bottom-y or bottom-y < 4:
                errors.append(f'{size} {name}: picture must retain landscape proportions')
            if not (image[0] == [x, y] and image[1] == [right, y]
                    and image[2][0] == right and y < image[3][1] < bottom
                    and x < image[4][0] < image[3][0] < right
                    and image[4][1] == bottom and image[5] == [x, bottom]):
                errors.append(f'{size} {name}: landscape peak or horizon is missing')
            border = sx if name == 'file' else fx
            if min(x-border, y-(fold if name == 'file' else fy), by-bottom) < 1:
                errors.append(f'{size} {name}: insufficient picture, fold or code clearance')
            if size == 16 and any(v != int(v) for point in image+bracket for v in point):
                errors.append(f'{size} {name}: vertices must align to whole pixels')
    return errors


def read_png(data):
    """Decode the pinned renderer's noninterlaced 8-bit RGBA PNGs without dependencies."""
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('Invalid PNG signature')
    offset, chunks, compressed = 8, [], bytearray()
    width = height = 0
    while offset < len(data):
        length = struct.unpack_from('>I', data, offset)[0]
        kind = data[offset+4:offset+8]
        payload = data[offset+8:offset+8+length]
        crc = struct.unpack_from('>I', data, offset+8+length)[0]
        if zlib.crc32(kind+payload) != crc:
            raise ValueError('PNG CRC mismatch')
        chunks.append(kind)
        if kind == b'IHDR':
            width, height, bits, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', payload)
            if (bits, color, compression, filtering, interlace) != (8, 6, 0, 0, 0):
                raise ValueError('Expected noninterlaced RGBA8 PNG')
        if kind == b'IDAT':
            compressed.extend(payload)
        offset += length+12
    if not chunks or chunks[0] != b'IHDR' or chunks[-1] != b'IEND' or offset != len(data):
        raise ValueError('Incomplete PNG')
    raw = zlib.decompress(compressed)
    stride = width*4
    if len(raw) != (stride+1)*height:
        raise ValueError('PNG data length mismatch')
    rows, previous = [], bytearray(stride)
    for y in range(height):
        start = y*(stride+1)
        filtering = raw[start]
        row = bytearray(raw[start+1:start+1+stride])
        for i in range(stride):
            a, b, c = (row[i-4] if i >= 4 else 0), previous[i], (previous[i-4] if i >= 4 else 0)
            if filtering == 0:
                break
            if filtering == 1:
                predict = a
            elif filtering == 2:
                predict = b
            elif filtering == 3:
                predict = (a+b)//2
            elif filtering == 4:
                p = a+b-c
                distances = abs(p-a), abs(p-b), abs(p-c)
                predict = (a, b, c)[distances.index(min(distances))]
            else:
                raise ValueError('Unknown PNG filter')
            row[i] = (row[i]+predict) & 255
        rows.append(bytes(row))
        previous = row
    return width, height, rows


def pixel_errors(rows, size, family, density):
    if family == 'avatar-padded':
        # At 1x/2x the unscaled central mark must retain every optical feature.
        inset, end = int(16*density), int(80*density)
        return pixel_errors([row[inset*4:end*4] for row in rows[inset:end]], 64, 'avatar', density)
    layout = GEOMETRY['layouts'][str(size)]
    image = layout['square' if family in ('mark', 'avatar') else 'file']['image']
    x, y, right, bottom = bounds(image)
    bx, by, br, bb = bounds(layout['bracket'])
    errors = []

    def pixel(px, py):
        column, row = math.floor(px*density), math.floor(py*density)
        return rows[row][column*4:column*4+4]

    ink = pixel(size/2, 0.5)
    background = pixel(x+0.5, y+0.5)
    if ink == background:
        errors.append('Picture cutout is missing')
    if family in ('mark', 'file-ui') and background[3] != 0:
        errors.append('Picture cutout must be transparent')
    peak_x, peak_y = image[3]
    if pixel(peak_x, (peak_y+bottom)/2) != ink:
        errors.append('Landscape mountain does not survive rasterization')
    # Sample interiors, not diagonal edge coverage: antialiasing is renderer dependent.
    regions = [('Bracket center bridge', br, by, size-br, bb),
               ('Image/code separator', x, bottom, right, by)]
    for name, left, top, end, last in regions:
        samples = [rows[row][col*4:col*4+4]
                   for row in range(math.ceil(top*density), math.floor(last*density))
                   for col in range(math.ceil(left*density), math.floor(end*density))]
        if not samples or any(sample != ink for sample in samples):
            errors.append(f'{name} does not survive rasterization')
    # The left sky is a broad empty rectangle; this also catches a lost landscape opening.
    for row in range(math.ceil(y*density), math.floor(bottom*density)):
        if rows[row][int(x*density)*4:int(x*density)*4+4] != background:
            errors.append('Picture sky does not remain open')
            break
    mid = layout['bracket'][1][1]
    for name, left, end in [('Left', bx, br), ('Right', size-br, size-bx)]:
        row = math.floor(mid*density)
        if not any(rows[row][col*4:col*4+4] == background
                   for col in range(math.ceil(left*density), math.floor(end*density))):
            errors.append(f'{name} bracket cutout is missing')
    # Inner notches must remain ink, rather than degenerating into triangular holes.
    for px in (br-0.5, size-br+0.5):
        if pixel(px, mid) != ink:
            errors.append('Bracket notch does not remain open')
    return sorted(set(errors))


def avatar_crop_errors(rows, theme):
    """An inscribed circular crop may remove background, but no foreground pixels."""
    size = len(rows)
    background = bytes.fromhex('ECFAF6FF' if theme == 'light' else '173B45FF')
    radius = size/2
    for y, row in enumerate(rows):
        if row[3::4] != bytes([255])*size:
            return ['Padded avatar canvas must be opaque']
        extent = math.sqrt(radius**2 - (y+0.5-radius)**2)
        left = max(0, math.ceil(radius-extent-0.5))
        right = min(size, math.floor(radius+extent-0.5)+1)
        if row[:left*4] != background*left or row[right*4:] != background*(size-right):
            return ['Circular crop would remove avatar artwork']
    return []


def check_assets():
    errors = geometry_errors(GEOMETRY['layouts'])
    expected_svg, expected_png = set(), set()
    for family, size, theme in variants():
        name = stem(family, size, theme)
        source = ASSETS / 'svg' / f'{name}.svg'
        expected_svg.add(source)
        if not source.is_file() or source.read_text() != svg(family, size, theme):
            errors.append(f'{name}: missing or stale SVG master; regenerate artwork')
        if theme == 'tintable':
            continue
        for pixels in raster_sizes(size):
            output = png_path(family, size, theme, pixels)
            expected_png.add(output)
            if not output.is_file():
                errors.append(f'{name}/{pixels}: required PNG missing')
                continue
            try:
                width, height, rows = read_png(output.read_bytes())
                if (width, height) != (pixels, pixels):
                    errors.append(f'{name}/{pixels}: wrong PNG dimensions')
                else:
                    if pixels in (size, size*2):
                        errors.extend(f'{name}/{pixels}: {error}' for error in pixel_errors(rows, size, family, pixels/size))
                    if family == 'avatar-padded':
                        errors.extend(f'{name}/{pixels}: {error}' for error in avatar_crop_errors(rows, theme))
            except (ValueError, IndexError, struct.error, zlib.error) as error:
                errors.append(f'{name}/{pixels}: {error}')
    if set((ASSETS / 'svg').glob('*.svg')) != expected_svg:
        errors.append('SVG inventory differs from required family/theme/optical-size matrix')
    if set((ASSETS / 'png').glob('*/*.png')) != expected_png:
        errors.append('PNG inventory differs from required 1x/2x/export matrix')
    expected_files = expected_svg | expected_png | {ASSETS / name for name in (
        'README.md', 'REQUIREMENTS.md', 'LICENSE.md', 'CC0-1.0.txt', 'geometry.json',
        'svt-document-light.ico', 'svt-document-dark.ico',
        'svt-document-light.icns', 'svt-document-dark.icns')}
    if {p for p in ASSETS.rglob('*') if p.is_file()} != expected_files:
        errors.append('Icon bundle must contain exactly the current assets and documentation')
    for theme in ('light', 'dark'):
        try:
            data = (ASSETS / f'svt-document-{theme}.ico').read_bytes()
            if struct.unpack('<HHH', data[:6]) != (0, 1, len(ICO_SIZES)):
                errors.append(f'{theme}: ICO header')
            for i, size in enumerate(ICO_SIZES):
                w, h, palette, reserved, planes, bits, length, offset = struct.unpack_from('<BBBBHHII', data, 6+i*16)
                expected = png_path('document', min(size, 64), theme, size).read_bytes()
                if ((w or 256, h or 256, palette, reserved, planes, bits) != (size, size, 0, 0, 1, 32)
                        or data[offset:offset+length] != expected):
                    errors.append(f'{theme}: ICO {size} must contain the correct optical export')
            data = (ASSETS / f'svt-document-{theme}.icns').read_bytes()
            if data[:4] != b'icns' or struct.unpack('>I', data[4:8])[0] != len(data):
                errors.append(f'{theme}: ICNS header')
            offset = 8
            for code, master, pixels in ICNS_ENTRIES:
                length = struct.unpack_from('>I', data, offset+4)[0]
                expected = png_path('document', master, theme, pixels).read_bytes()
                if data[offset:offset+4] != code.encode() or data[offset+8:offset+length] != expected:
                    errors.append(f'{theme}: ICNS {code} must retain the {master} px optical master')
                offset += length
            if offset != len(data):
                errors.append(f'{theme}: unexpected ICNS data')
        except (OSError, struct.error) as error:
            errors.append(f'{theme}: invalid desktop container: {error}')
    return errors


if __name__ == '__main__':
    failures = check_assets()
    if failures:
        raise SystemExit('\n'.join(failures))
    print('Passed: icon output matrix, centered geometry, raster separation at 1x/2x, ICO and Retina ICNS.')
