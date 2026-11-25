type Tone = 'light' | 'dark';
type Family = (typeof families)[number];

const families = [
  {
    id: 'mark',
    label: 'Mark',
    title: 'Project marks',
    alt: 'Landscape picture and angle-bracket cutouts in a filled square',
    note: 'Transparent project logos.',
  },
  {
    id: 'avatar',
    label: 'Avatar',
    title: 'Project avatars',
    alt: 'Ink picture and jade code brackets on a pale square background',
    note: 'Two-color square and circle-safe profiles.',
  },
  {
    id: 'document',
    label: 'Document',
    title: 'Desktop documents',
    alt: 'Paper-backed document with picture and angle brackets',
    note: 'Paper-backed file icons.',
  },
  {
    id: 'file-ui',
    label: 'Filled file',
    title: 'Filled UI icons',
    alt: 'Filled document with transparent picture and angle-bracket cutouts',
    note: 'Transparent template cutouts.',
  },
];
const icons = '/assets/icons';

function IconTile({ family }: { family: Family }) {
  return (
    <section className="tile">
      <img
        src={`${icons}/svg/svt-${family.id}-64-light.svg`}
        alt={family.alt}
        width="100"
        height="100"
      />
      <h2>{family.title}</h2>
      <p>
        {family.note}
        <br />
        CC0 · no attribution required.
      </p>
    </section>
  );
}

export function IconGallery() {
  return (
    <div className="gallery">
      {families.map((family) => (
        <IconTile key={family.id} family={family} />
      ))}
    </div>
  );
}

function IconSample({
  directory,
  size,
  alt,
  caption,
  circular,
}: {
  directory: string;
  size: number;
  alt: string;
  caption: string;
  circular?: boolean;
}) {
  return (
    <figure>
      <img
        className={circular ? 'circular' : undefined}
        width={size}
        height={size}
        alt={alt}
        src={`${directory}/${size}.png`}
        srcSet={`${directory}/${size * 2}.png 2x`}
        loading="lazy"
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function OpticalRow({ family, tone }: { family: Family; tone: Tone }) {
  return (
    <div className="optical-row">
      <h4>{family.label}</h4>
      <div className="size-samples">
        {[16, 20, 24, 32, 48, 64].map((size) => (
          <IconSample
            key={size}
            size={size}
            directory={`${icons}/png/svt-${family.id}-${size}-${tone}`}
            alt={`${family.label}, ${size} px optical drawing`}
            caption={size + ' px'}
          />
        ))}
      </div>
    </div>
  );
}

export function OpticalReview({ tone, title }: { tone: Tone; title: string }) {
  return (
    <section className={'icon-review ' + tone} aria-label={`Optical sizes on a ${tone} surface`}>
      <h3>{title}</h3>
      {families.map((family) => (
        <OpticalRow key={family.id} family={family} tone={tone} />
      ))}
    </section>
  );
}

export function AvatarReview({ tone, title }: { tone: Tone; title: string }) {
  const name = 'svt-avatar-padded-96-' + tone;
  const directory = icons + '/png/' + name;
  return (
    <div className={'icon-review ' + tone}>
      <h3>{title}</h3>
      <div className="avatar-pair">
        <IconSample
          size={96}
          directory={directory}
          alt={`Padded ${tone} SVT avatar, square upload`}
          caption="Square upload"
        />
        <IconSample
          size={96}
          directory={directory}
          alt={`Padded ${tone} SVT avatar, circular crop`}
          caption="Circular crop"
          circular
        />
      </div>
      <p className="avatar-downloads">
        <a href={icons + '/svg/' + name + '.svg'} download>
          SVG
        </a>{' '}
        ·{' '}
        <a href={directory + '/512.png'} download>
          512 px PNG
        </a>{' '}
        ·{' '}
        <a href={directory + '/1024.png'} download>
          1024 px PNG
        </a>
      </p>
    </div>
  );
}
