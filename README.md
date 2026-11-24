# SVT project website

Static project pages for [Scalable Vector Templates](https://svt-project.github.io/).

- `public/index.html`: introduction and links to the specification and .NET implementation.
- `public/ns/svt/index.html`: reference page for the stable XML metadata namespace.
- `public/resources/index.html`: logos and integrator file icons.
- `public/assets/icons/v2/`: editable SVG masters, raster exports and desktop icon containers.

The specification remains self-contained in [svt-spec](https://github.com/svt-project/svt-spec).
This site links it without copying its authoritative text or fetching it during deployment.
Cookbook, playground and the independent TypeScript implementation remain follow-ups in the
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

All SVT marks, avatars, outlined document icons and filled UI icons are dedicated under CC0 1.0,
with no attribution requirement. See the [asset dedication](public/assets/icons/v2/LICENSE.md) and
[integration guidance](public/assets/icons/v2/README.md).

SVG masters are editable source. Raster exports preserve the same geometry; for example, use resvg
with `--width 256 --height 256 input.svg output.png`. Small masters cover 16–32 px. Desktop containers
combine those small exports with the regular artwork. Validate exports before packaging:

```sh
python3 eng/package-icons.py
python3 eng/check.py
```

The script creates deterministic downloads with checksums. Once published, retain a snapshot unchanged;
use a new asset folder and download version for revisions. The current set is `v2`. Asset numbering is independent of the
specification and implementation releases. Integrators should embed a downloaded snapshot.

Site code and prose are [MIT-licensed](LICENSE), except where the asset-specific licenses apply.
Bathos is the founding maintainer. Original artwork provenance is retained in the package even
though CC0 does not require credit when using the logos.
