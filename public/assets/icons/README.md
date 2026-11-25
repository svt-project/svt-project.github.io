# SVT icons

A picture above angle brackets: image and code in one recognizable identity. Application and file
icons use a monochrome filled silhouette; colored avatars use separate picture and code elements
without an outer frame. The landscape and mirrored `<>` pair remain clear from 16 through 64 logical pixels.
The file treatment uses a shallower picture beneath its clipped corner and exactly the same
bracket pair as the square mark. No dots, dashes, text or extra detail appear at larger sizes.

## Treatments and colors

- `svt-mark-{size}-{theme}.svg`: filled square project mark with transparent image/code cutouts.
- `svt-avatar-{size}-{theme}.svg`: an ink picture and jade brackets on a pale background, or pale picture and mint brackets on dark.
- `svt-document-{size}-{theme}.svg`: desktop file silhouette with paper behind its cutouts.
- `svt-file-ui-{size}-{theme}.svg`: filled file silhouette with transparent image/code cutouts.

All treatments have `light` and `dark` variants. Marks and filled UI files also have `black`,
`white`, and `tintable` variants. Tintable assets use `currentColor`; apply your application's
semantic color when using them inline. External image elements generally do not inherit the host's
CSS color, so use a fixed-color export there. `light` means designed for a light surface; `dark`
means designed for a dark surface.

Marks and filled UI SVGs each contain one compound path. Preserve `fill-rule="evenodd"`, the square view box,
and transparency when importing that path into a renderer. All masters are self-contained vectors
without fonts, scripts, raster images or external references.

Palette: deep ink `#173B45`, pale `#ECFAF6`, and white paper. Avatars add jade `#008F78` on
light surfaces and mint `#59E2BF` on dark surfaces. Application and file icons retain one foreground.
Shape identifies the picture and code independently of color; tint is never a conformance indicator.

## Choose by displayed size, then density

The SVG filename identifies its **optical size in logical pixels**, not just a raster dimension.
Dedicated drawings are supplied for **16, 20, 24, 32, 48 and 64 px**. Use the matching drawing at
these sizes. For other sizes between targets, choose the next smaller optical drawing and scale it
up; above 64 px, use the 64 px drawing. Retain the square viewport. The mark fills it; the file has inset sides and fills its height.
Hosts that need padding should supply it outside the icon, rather than shrinking only this identity.

Each fixed-color SVG has a corresponding `png/{svg-stem}/` folder with 1× and 2× renders. For a
16 px icon on a Retina display, use `png/svt-file-ui-16-light/32.png`: it preserves the 16 px design.
`png/svt-file-ui-32-light/32.png` is a different drawing for a 32 px logical footprint.

The 64 px folders also include 256, 512 and 1024 px exports. Tintable variants are SVG-only because
the consuming application supplies their color. Windows ICO files contain 16/20/24/32/48/64/128/256
px entries. Light and dark macOS ICNS files preserve separate 16@2× and 32@2× optical drawings.
These exports do not change operating-system file associations themselves.

## Avatars for circular crops

`svt-avatar-padded-96-{theme}.svg` supplies the 64 px colored avatar centered on an opaque 96 px canvas,
with 16 px of padding on each side. The entire motif fits inside an inscribed circle; upload the
square image and let the profile host apply its circular crop. Light and dark themes use the
same backgrounds as the square avatars. This is a profile-image treatment, not a small UI icon.

The matching `png/svt-avatar-padded-96-{theme}/` folders contain **96, 192, 256, 512 and 1024 px**
exports. Use the 512 or 1024 px PNG for profile uploads. Keep the padding when importing the SVG;
removing it defeats the crop protection. For compact square UI slots, use the optical mark or
unpadded avatar at its intended logical size instead.

## Requirements and source

[REQUIREMENTS.md](REQUIREMENTS.md) defines the required outputs, alignment and clearance invariants,
automated gates, and visual acceptance matrix. `geometry.json` records the native-size dimensions;
the repository's `eng/icon_artwork.py` builds the SVG masters from those values. Change that source
and regenerate the outputs together instead of hand-editing generated SVGs or PNGs.

These optional branding assets are independent of the SVT specification. They are not normative
specification assets or conformance badges. Embed an accepted copy rather than fetching live artwork
at runtime. The repository keeps one current set; Git history retains previous designs.

All artwork, geometry data and package documentation are CC0. See [LICENSE.md](LICENSE.md) and
[CC0-1.0.txt](CC0-1.0.txt). Attribution is not required; use does not imply project endorsement.
