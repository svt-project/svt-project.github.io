# SVT project website

Static project pages for [Scalable Vector Templates](https://svt-project.github.io/).

- `public/index.html`: introduction and links to the specification, JavaScript and .NET implementations.
- `public/ns/svt/index.html`: reference page for the stable XML metadata namespace.
- `public/resources/index.html`: logos and integrator file icons.
- `public/assets/icons/`: optical SVG masters, raster exports and desktop icon containers.

The specification remains self-contained in [svt-spec](https://github.com/svt-project/svt-spec).
This site links it without copying its authoritative text or fetching it during deployment.
The JavaScript implementation lives in [svt-js](https://github.com/svt-project/svt-js), with npm
identity `@svt-project/svt-js` (publication pending). Include the scope in all installation and import
examples. Cookbook and playground work remain follow-ups in the
[coordinator](https://github.com/svt-project/.github/issues).

## Development and deployment

No framework, JavaScript runtime, package installation or remote content fetch is required.
Python 3 is used only for validation, packaging and local preview:

```sh
python3 eng/check.py
python3 -m http.server 8000 --directory public
```

GitHub Actions validates pull requests and publishes `public/` to GitHub Pages after pushes to
`master`. Pages uses the GitHub Actions source and the `github-pages` environment. The namespace
URL without a trailing slash may redirect to the HTML directory; its XML identity remains exactly
`https://svt-project.github.io/ns/svt`.

## Artwork and licenses

All SVT marks, avatars, desktop document icons and filled UI icons are dedicated under CC0 1.0,
with no attribution requirement. See the [asset dedication](public/assets/icons/LICENSE.md) and
[integration guidance](public/assets/icons/README.md).

The motif is a landscape picture above angle brackets. Application and file icons use a monochrome
filled silhouette; avatars use an ink picture and jade/mint brackets without an outer frame. Dedicated optical drawings
cover 16, 20, 24, 32, 48 and 64 logical pixels. See the
[output and acceptance requirements](public/assets/icons/REQUIREMENTS.md) for the complete matrix
and the distinction between optical size and raster density. The resources page displays actual-size
1×/2× samples in all four optical treatments on light and dark backgrounds. Padded profile avatars
retain the 64 px colored avatar on a 96 px canvas for circular crops, with PNG exports through 1024 px.

`public/assets/icons/geometry.json` and `eng/icon_artwork.py` own the original geometry. SVG/PNG
outputs are committed distribution assets. Regeneration uses Python 3 and **resvg 0.47.0**, supplied
explicitly by the developer; no renderer is downloaded or run during the site build:

```sh
python3 eng/render-icons.py --resvg resvg
python3 eng/package-icons.py
python3 eng/check.py
```

The normal check runs offline. It verifies source-to-SVG consistency, the full inventory, alignment
and clearances, decoded PNG cutouts, notches and solid separators at 1×/2×, avatar color/separation checks, circular-crop safety, exact desktop-container payloads,
regression tests, and deterministic archives. It also checks all site/package links. Inspect the
visual acceptance matrix before accepting artwork: automatic checks cannot establish recognition.
Repeat regeneration and packaging to confirm there is no further diff.

The package script creates one deterministic `svt-icons.zip` download with checksums. The
repository maintains a single current artwork set in `public/assets/icons/`; Git history retains
previous designs. Integrators should embed an accepted copy rather than fetch live artwork at runtime.

Site code and prose are [MIT-licensed](LICENSE), except where the asset-specific licenses apply.
Bathos is the founding maintainer. Original artwork provenance is retained in the package even
though CC0 does not require credit when using the logos.
