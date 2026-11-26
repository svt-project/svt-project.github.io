export function PreviewImage({
  src,
  alt,
  error,
  retry,
}: {
  src: string;
  alt: string;
  error: string;
  retry: (() => void) | undefined;
}) {
  return (
    <div className="preview-image" data-invalid={error ? true : undefined}>
      <img className="specimen" src={src} alt={alt} />
      <div className="preview-notice">
        <p className="status" role="status">
          {error}
        </p>
        {retry && (
          <button type="button" onClick={retry}>
            Retry preview
          </button>
        )}
      </div>
    </div>
  );
}
