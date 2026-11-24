# SVT icons v2

A rounded frame holds a dashed placeholder on the left and a solid replacement on the right.

- `svt-mark-*`: transparent project logo.
- `svt-avatar-*`: project avatar with an intentional background.
- `svt-document-*`: outlined paper file icon with a colored replacement column.
- `svt-file-ui-*`: original filled file icon with transparent replacement-column cutouts.
- `*-small-*`: simplified artwork for 16–32 px; use regular artwork at 48 px and above.
- `light` and `dark`: variants for light and dark surfaces; `black` and `white`: monochrome.
- `tintable`: inline SVG using `currentColor`. External image elements generally do not inherit
  the host's CSS color; choose a fixed-color export there.

Each SVG uses a square canvas. File silhouettes are portrait-shaped with a folded upper-right
corner. Filled UI icons use a single compound path: preserve `fill-rule="evenodd"` in path renderers.
Use the surrounding application's semantic tint where appropriate. SVG masters have no fonts,
scripts, embedded raster images or remote resources.

The PNG folder names match SVG masters; filenames specify pixel dimensions. ICO files include
16/24/32/48/64/128/256 px representations. ICNS includes Retina representations through 1024 px.
Small artwork reduces dash detail; use larger artwork when every dash needs to be visible.

Palette: deep ink `#173B45`, jade `#008F78`, pale `#ECFAF6` and mint `#59E2BF`.

These are optional branding and integration assets, independently versioned from the specification.
Embed an accepted download rather than fetching live artwork at runtime. They are not normative
specification assets or conformance badges. The specification contains its own explanatory material
and canonical reference assets and has no dependency on this package or website.

All artwork and documentation in this package are CC0 with no attribution required.
Read [LICENSE.md](LICENSE.md) for the dedication and full legal text.
