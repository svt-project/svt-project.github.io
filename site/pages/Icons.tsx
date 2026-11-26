import { PageIntro } from '../PageIntro.tsx';
import { IconGallery, OpticalReview, AvatarReview } from './IconGallery.tsx';

export function IconsPage() {
  return (
    <main id="main" className="wrap">
      <article className="article" style={{ maxWidth: 'none' }}>
        <PageIntro eyebrow="Project icons" title="Icons">
          Project logos, avatars and file icons built around the same idea: a landscape picture
          above angle brackets. Application and file icons are monochrome; project avatars pair an
          ink picture with jade or mint brackets.
        </PageIntro>
        <IconGallery />
        <div className="actions">
          <a className="button" href="/assets/downloads/svt-icons.zip" download>
            Download the CC0 icon set
          </a>
        </div>
        <h2>Ready for your application</h2>
        <p>
          The download includes dedicated 16, 20, 24, 32, 48 and 64 px SVG drawings, 1×/2× PNG
          exports, light/dark variants and Windows ICO/macOS ICNS document icons. Marks and filled
          UI icons also include monochrome and tintable versions. Embed a downloaded snapshot in
          your application.
        </p>
        <p>
          Tintable SVGs use <code>currentColor</code>. Use them inline to inherit your interface
          color; choose fixed-color exports for external image elements. Preserve{' '}
          <code>fill-rule="evenodd"</code> when importing filled icons into a path renderer.
        </p>
        <section id="avatars" aria-labelledby="avatar-heading">
          <h2 id="avatar-heading">Avatars for circular crops</h2>
          <p>
            Use a padded two-color avatar for profile images. Its background leaves room for a
            circular crop while keeping the complete mark intact. Upload the square PNG and let the
            host crop it; the files themselves remain square.
          </p>
          <div className="avatar-previews">
            <AvatarReview tone="light" title="Light avatar" />
            <AvatarReview tone="dark" title="Dark avatar" />
          </div>
          <p>
            For small square UI slots, use the matching optical drawing below. Padded avatars are
            intended for profile images.
          </p>
        </section>
        <h2 id="optical-sizes">Designed at the size you use</h2>
        <p>
          A landscape picture and mirrored angle brackets combine image and code. Square and file
          treatments share the same brackets; a shallower picture fits below the file corner.
          Monochrome icons keep their filled silhouette and open cutouts; avatars use separate
          picture and colored code elements. The smallest avatars use a slightly shallower picture
          to keep those elements apart. Each row below uses the matching optical drawing at its
          actual displayed size, with a 2× export for high-density displays.
        </p>
        <p>
          Choose by logical size first: a 16 px icon at 2× uses the 16 px drawing rendered at 32
          physical pixels. It does not use the 32 px optical drawing. For intermediate sizes, scale
          up the next smaller drawing; above 64 px, use the 64 px master.
        </p>
        <OpticalReview tone="light" title="Light surface" />
        <OpticalReview tone="dark" title="Dark surface" />
        <p>
          Read the <a href="/assets/icons/REQUIREMENTS.md">output and acceptance requirements</a>{' '}
          for the complete inventory, alignment and separation checks, and visual-review criteria.
        </p>
        <h2>Use the logos freely</h2>
        <p>
          All SVT marks, avatars, desktop document icons and filled UI icons in this set are
          dedicated under{' '}
          <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a>. Copy,
          adapt and redistribute them, including commercially, without attribution. CC0 does not
          affect trademark or patent rights; use does not imply project endorsement or conformance
          certification.
        </p>
        <p>
          These original assets are optional project icons, independent of specification editions.
          Choose paper-backed desktop or transparent UI files to suit your application; every
          variant has the same CC0 terms.
        </p>
        <p>
          <a href="/assets/icons/LICENSE.md">Full license map</a> ·{' '}
          <a href="/assets/icons/README.md">Integration guide</a> ·{' '}
          <a href="/assets/downloads/SHA256SUMS">Download checksums</a> ·{' '}
          <a href="https://github.com/svt-project/svt-project.github.io/tree/master/public/assets/icons/svg">
            SVG sources
          </a>
        </p>
      </article>
    </main>
  );
}
