# SVT project website

Static project pages for [Scalable Vector Templates](https://svt-project.github.io/).

- `public/index.html`: introduction and links to the specification, JavaScript and .NET implementations.
- `public/ns/svt/index.html`: reference page for the stable XML metadata namespace.
- `public/icons/index.html`: logos and integrator file icons.
- `public/assets/icons/`: optical SVG masters, raster exports and desktop icon containers.

The specification remains self-contained in [svt-spec](https://github.com/svt-project/svt-spec).
This site links it without copying its authoritative text or fetching it during deployment.
The [JavaScript implementation](https://github.com/svt-project/svt-js) is available on npm as
[`@svt-project/svt-js`](https://www.npmjs.com/package/@svt-project/svt-js).
The [coordinator](https://github.com/svt-project/.github/issues/5) tracks authoring guide work.

## Development and deployment

Edit the React components as TSX in `site/`. `site/Layout.tsx` owns the shared project banner,
navigation and footer. Every page uses the same menu for a given build. The cookbook
preview adds the guide to that menu. Page content lives in `site/pages/` and `cookbook/`.

Use Node 24.2 or later to regenerate the three public HTML files after component edits.
The generated pages in `public/` serve directly from GitHub Pages and work with JavaScript disabled.
The public build type-checks the page sources independently of the cookbook.

```sh
npm ci
npm run build:pages
python3 eng/check.py
python3 -m http.server 8000 --directory public
```

GitHub Actions validates pull requests and publishes `public/` to GitHub Pages after pushes to
`master`. Pages uses the GitHub Actions source and the `github-pages` environment. The namespace
URL without a trailing slash may redirect to the HTML directory; its XML identity remains exactly
`https://svt-project.github.io/ns/svt`.

## Local authoring guide

The exercises in `cookbook/` use the published `@svt-project/svt-js@1.0.0-rc.2` package.
From the site checkout, install the locked dependencies and start the preview.

```sh
npm ci
npm run build:cookbook
npm run preview:cookbook
```

`npm run typecheck` checks the entire TypeScript site, including the cookbook
components, Node build scripts, and dedicated Worker. Both build commands run their type checks
before generating output.

Open [the local guide](http://127.0.0.1:8788/cookbook/). Rebuild after editing a recipe or
updating the package. The build writes the preview to ignored `.local/site/`, inspects
every template, embeds its default artwork for standalone downloads, and bundles the guide’s
browser Worker. The readable excerpts and preview come from the same recipe. With JavaScript
disabled, the descriptions, authored artwork, navigation, excerpts, and downloads still work.

Lezer highlights the excerpts during the build. Each exercise loads the shared CodeMirror XML editor
when you select **Edit full template**. Edits run through SVT in the
Worker and last until the page is refreshed. Excerpts select whole XML elements by tag,
attribute, or child element, so wrapping an opening tag across lines preserves the example.

Install the test browser once and run the cookbook checks.

```sh
npx playwright install chromium --only-shell
npm run test:cookbook
```

The checks build a fresh preview, verify XML formatting and highlighting, and launch a
temporary local server for Chromium to exercise bindings, recovery, editors, and mobile navigation.

The image controls use 3× PNG exports of the SVG masters in `cookbook/artwork/`.
The PNGs give the outer SVG frame a raster image with a fixed aspect ratio for crop and fade exercises.

The fit-or-crop and ticket examples exercise repeated image and text keys from the
SVT 1.0.0 specification. Each uses one form field to update multiple targets.
These exercises test authoring and browser behavior. Font metrics and glyph coverage depend on
installed fonts. Before deploying the guide, pin the published 1.0 package and lockfile, build
the guide in Pages CI, and upload the built site tree.

## Artwork and licenses

All SVT marks, avatars, desktop document icons and filled UI icons are dedicated under CC0 1.0,
with no attribution requirement. See the [asset dedication](public/assets/icons/LICENSE.md) and
[integration guidance](public/assets/icons/README.md).

The motif is a landscape picture above angle brackets. Application and file icons use a monochrome
filled silhouette; avatars use an ink picture and jade/mint brackets without an outer frame. Dedicated optical drawings
cover 16, 20, 24, 32, 48 and 64 logical pixels. See the
[output and acceptance requirements](public/assets/icons/REQUIREMENTS.md) for the complete matrix
and the distinction between optical size and raster density. The icons page displays actual-size
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
Bathos Pty Ltd is the founding maintainer. Original artwork provenance is retained in the package even
though CC0 does not require credit when using the logos.
