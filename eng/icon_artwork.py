"""Build original SVG geometry and enumerate its required distributable outputs."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/icons'
GEOMETRY = json.loads((ASSETS / 'geometry.json').read_text())
SIZES = (16, 20, 24, 32, 48, 64)
THEMES = {
    'mark': ('light', 'dark', 'black', 'white', 'tintable'),
    'avatar': ('light', 'dark'),
    'avatar-padded': ('light', 'dark'),
    'document': ('light', 'dark'),
    'file-ui': ('light', 'dark', 'black', 'white', 'tintable'),
}
ICO_SIZES = (16, 20, 24, 32, 48, 64, 128, 256)
# Preserve optical masters for Retina entries instead of substituting their pixel size.
ICNS_ENTRIES = (('icp4', 16, 16), ('ic11', 16, 32), ('icp5', 32, 32),
                ('ic12', 32, 64), ('icp6', 64, 64), ('ic07', 64, 128),
                ('ic08', 64, 256), ('ic13', 64, 256), ('ic09', 64, 512),
                ('ic14', 64, 512), ('ic10', 64, 1024))


def rect(x, y, w, h):
    return f'M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z'


def rounded(x, y, w, h, r):
    return (f'M{x+r:g} {y:g}H{x+w-r:g}Q{x+w:g} {y:g} {x+w:g} {y+r:g}'
            f'V{y+h-r:g}Q{x+w:g} {y+h:g} {x+w-r:g} {y+h:g}'
            f'H{x+r:g}Q{x:g} {y+h:g} {x:g} {y+h-r:g}V{y+r:g}Q{x:g} {y:g} {x+r:g} {y:g}Z')


def sheet(x, y, w, h, fold, r):
    return (f'M{x+r:g} {y:g}H{x+w-fold:g}L{x+w:g} {y+fold:g}V{y+h-r:g}'
            f'Q{x+w:g} {y+h:g} {x+w-r:g} {y+h:g}H{x+r:g}'
            f'Q{x:g} {y+h:g} {x:g} {y+h-r:g}V{y+r:g}Q{x:g} {y:g} {x+r:g} {y:g}Z')


def polygon(points):
    return 'M' + 'L'.join(f'{x:g} {y:g}' for x, y in points) + 'Z'


def motif(layout, size, family):
    image = polygon(layout['square' if family in ('mark', 'avatar') else 'file']['image'])
    left = layout['bracket']
    return image + polygon(left) + polygon([(size-x, y) for x, y in left])


def path(data, fill):
    return f'<path fill="{fill}" fill-rule="evenodd" d="{data}"/>'


def svg(family, size, theme):
    padded = family == 'avatar-padded'
    drawing_size = 64 if padded else size
    drawing_family = 'avatar' if padded else family
    layout = GEOMETRY['layouts'][str(drawing_size)]
    ink, paper = {
        'light': ('#173B45', '#FFFFFF'),
        'dark': ('#ECFAF6', '#173B45'),
        'black': ('#000000', '#FFFFFF'),
        'white': ('#FFFFFF', '#000000'),
        'tintable': ('currentColor', 'none'),
    }[theme]
    outer = rounded(*layout['frame']) if drawing_family in ('mark', 'avatar') else sheet(*layout['sheet'])
    body = path(outer + motif(layout, drawing_size, drawing_family), ink)
    if drawing_family == 'avatar':
        background = '#ECFAF6' if theme == 'light' else '#173B45'
        accent = '#008F78' if theme == 'light' else '#59E2BF'
        picture = rounded(*layout['avatar']['frame']) + polygon(layout['avatar']['image'])
        brackets = polygon(layout['bracket']) + polygon([(drawing_size-x, y) for x, y in layout['bracket']])
        body = path(picture, ink) + path(brackets, accent)
        if padded:
            # Preserve the 64 px avatar inside the 96 px canvas's inscribed circle.
            body = path(rect(0, 0, size, size), background) + f'<g transform="translate(16 16)">{body}</g>'
        else:
            body = path(outer, background) + body
    elif family == 'document':
        # Desktop documents retain paper behind the cutouts; UI files remain transparent.
        body = path(outer, paper) + body
    title = f'SVT {family} template icon, {size} px, {theme}'
    # A direct label avoids ID collisions when several SVGs are embedded inline.
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
            f'width="{size}" height="{size}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')


def variants():
    for family, themes in THEMES.items():
        for size in ((96,) if family == 'avatar-padded' else SIZES):
            for theme in themes:
                yield family, size, theme


def stem(family, size, theme):
    return f'svt-{family}-{size}-{theme}'


def raster_sizes(size):
    if size == 96:
        return (96, 192, 256, 512, 1024)
    return (64, 128, 256, 512, 1024) if size == 64 else (size, size*2)


def png_path(family, master, theme, pixels):
    return ASSETS / 'png' / stem(family, master, theme) / f'{pixels}.png'
