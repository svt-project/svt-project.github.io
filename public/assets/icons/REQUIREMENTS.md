# Icon output and acceptance requirements

These requirements apply to the branding package, independently of specification conformance.
The identity combines a landscape picture and angle brackets. Application and file icons use a
monochrome filled silhouette; avatars use separate picture and colored bracket elements. Both cues
must survive at actual UI sizes, in monochrome as well as color. Square and file treatments share
one image-and-code identity; the icon is not a conformance or readiness badge.

## Required outputs

| Treatment | Themes | SVG optical sizes |
| --- | --- | --- |
| Mark | light, dark, black, white, tintable | 16, 20, 24, 32, 48, 64 |
| Avatar | light, dark | 16, 20, 24, 32, 48, 64 |
| Paper-backed document | light, dark | 16, 20, 24, 32, 48, 64 |
| Filled UI file | light, dark, black, white, tintable | 16, 20, 24, 32, 48, 64 |
| Padded profile avatar | light, dark | 96 px canvas containing the 64 px avatar |

All dimensions are square logical pixels. The complete inventory is **86 SVG masters**: 84 optical
drawings and two padded avatars. The optical drawings supply 180 PNGs: 1×/2× for each fixed-color
master, plus 256/512/1024 px exports from the 64 px masters. Each padded avatar supplies
96/192/256/512/1024 px PNGs, for **190 PNG files** in total. Missing masters, missing exports and
unexpected inventory entries fail validation. Tintable PNGs are deliberately absent.

Each light/dark paper-backed document treatment requires a Windows ICO containing eight entries:
16, 20, 24, 32, 48, 64, 128 and 256 px. Its macOS ICNS must contain `icp4`, `ic11`, `icp5`, `ic12`,
`icp6`, `ic07`, `ic08`, `ic13`, `ic09`, `ic14` and `ic10`. The `ic11` entry must embed the 16 px
master at 32 physical pixels, and `ic12` the 32 px master at 64 physical pixels. Large entries use
the 64 px master. Both container types must embed the corresponding PNG bytes without resampling.

## Geometry and raster invariants

- Padded profile avatars center the 64 px colored avatar on an opaque 96 px canvas with 16 px
  padding. Every foreground pixel must survive an inscribed circular crop at every raster size.
  Their 96/192 px renders must also preserve the central avatar’s 64 px optical features at 1×/2×.

- Square marks fill the logical viewport; files fill its height with centered inset sides and a
  clipped corner. These filled bounds balance with other filled entity icons. Add host padding
  outside the viewport when needed, consistently with neighboring icons.
- Each picture is a centered landscape region with one recognizable peak. The square uses a taller
  picture; the file fits a shallower picture below the clipped corner, with at least one logical
  pixel of clearance. Do not add a tiny fold crease.
- A six-vertex left angle bracket defines the right bracket by reflection about the centerline.
  Square and file use the same pair at each optical size. Arms and inner notches must remain open;
  minimum arm-end and notch dimensions are one logical pixel. The center bridge is at least two
  logical pixels. The image/code separator and bottom/side clearances are at least one pixel.
- Bracket arms have a consistent perpendicular width of `size × √2 / 16` (about 8.84% of the
  logical icon size). Pixel alignment may adjust the end caps, but must not introduce heavier
  intermediate sizes. The 24 px drawing uses half-pixel inner vertices; its 48 px counterpart
  doubles those coordinates.
- At 16 px, every image and bracket vertex is on a whole logical pixel. The 20 px drawing is
  independently adjusted. Larger optical drawings retain the same motif, without adding detail.
- Every monochrome 1×/2× raster must preserve the open picture, both bracket cutouts, the ink in each inner
  notch, the solid center bridge, and a solid row between image and code. Test feature interiors,
  rather than requiring identical antialiased diagonal-edge pixels: mirrored vector geometry can
  produce different edge coverage in different renderers. Inspect those edges visually at native
  size and on the consuming platform.
- Marks and filled UI files each contain one even-odd compound path with transparent cutouts.
  Desktop documents add paper behind their cutouts. Avatars have a background, an ink picture
  element with its own border, and jade (light) or mint (dark) brackets, with no outer frame. No font, raster,
  script, event handler or external resource is allowed inside an SVG master.

- Avatar picture borders are at least one logical pixel thick, with at least one pixel of
  background between picture and code. At 16/20 px the sky is one pixel shallower to preserve that
  gap. At 1×/2×, the picture border and mountain retain the ink color, both brackets retain their
  accent, and the sky, center gap and bracket notches remain open background.

| Logical size | Square picture bounds | File picture bounds | Bracket center bridge |
| --- | --- | --- | --- |
| 16 | 12 × 6 | 10 × 4 | 2 |
| 20 | 16 × 8 | 14 × 5 | 2 |
| 24 | 18 × 9 | 16 × 6 | 3 |
| 32 | 24 × 12 | 20 × 8 | 4 |
| 48 | 36 × 18 | 32 × 12 | 6 |
| 64 | 48 × 24 | 40 × 16 | 8 |

`geometry.json` records silhouette bounds, the landscape polygon and one bracket polygon at each
size. Change these source values and regenerate all outputs together.

## Automated acceptance

`python3 eng/check.py` runs without a renderer or network. It validates the complete output matrix,
source-to-SVG consistency, geometry constraints, decoded PNG pixels at 1×/2×, padded-avatar crop safety, PNG checksums and
structure, exact ICO/ICNS entries, licenses, site links, deterministic ZIP contents and download
checksums. It also runs regression tests that deliberately misalign geometry, close a notch, remove
clearance or damage pixels to verify that these failures are detected.

The repository contains one current artwork set and one download. Older designs remain in Git
history rather than numbered asset folders or additional ZIPs.

Regeneration requires **resvg 0.47.0** and Python 3. Normal site builds consume committed artwork;
they do not download a renderer. Run the commands in the repository README, regenerate the archive,
and confirm that a second run makes no further changes. SVG and PNG bytes are reviewed together.

## Visual acceptance

Automation establishes alignment and separation; it does not establish recognition or visual balance.
Before accepting artwork, review the four optical treatments at **16, 20, 24, 32, 48 and 64 logical pixels**:

- Inspect at actual size first, then enlarge pixels to diagnose lost gaps. Do not judge only a large
  vector preview. Compare against neighboring file/image icons in a consuming application.
- Review both 1× and 2× density. At 125% and 150% display scaling, confirm that antialiasing does not
  close the bracket notches or obscure the image/code separation. Test fractional placement too.
- Review light and dark surfaces, monochrome, the host's semantic tint, and its muted/disabled
  treatment. Shape must remain the identifying cue; color must not imply validity or readiness.
- Confirm that the picture and code feel balanced as a group, and that the clipped file corner
  leaves sufficient room for the picture. A mathematically centered but visibly unbalanced result needs
  another design pass, not weaker checks.
- Confirm that square and document treatments read as the same image-and-code identity, distinct
  from an ordinary image or a generic code symbol.

Review padded avatars as square and circular images on light and dark surfaces. The mark must
remain intact, with a visible background margin around it.

The icons page shows actual-size 1×/2× samples for integrators. Detailed review sheets and
screenshots belong in ignored local evidence, not in the downloadable package.
