// Photo placeholders — striped warm-tone SVGs with monospace captions describing
// what should go there. Variants by aspect + warmth so each slot looks distinct.

const PH_TONES = [
  ['#E9D9BD', '#D9C39B'], // sand
  ['#D9C5A6', '#C2A77F'], // wheat
  ['#E4CFB0', '#CDB48D'], // honey
  ['#EBE0CC', '#D7C5A8'], // cream
  ['#C9B493', '#B79C76'], // toast
  ['#F0E4CE', '#DCC8A4'], // butter
];

function Placeholder({ caption, idx = 0, ratio = '4/5', rounded = 0, style, children, scribble = true, frame = false }) {
  const [a, b] = PH_TONES[idx % PH_TONES.length];
  const pat = `pat-${idx}`;
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: ratio,
        width: '100%',
        borderRadius: rounded,
        overflow: 'hidden',
        background: a,
        boxShadow: frame ? '0 1px 0 rgba(0,0,0,.04), 0 24px 48px -28px rgba(60,40,20,.35)' : 'none',
        ...style,
      }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <defs>
          <pattern id={pat} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <rect width="22" height="22" fill={a} />
            <rect width="2" height="22" fill={b} opacity="0.55" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pat})`} />
      </svg>
      {scribble && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            right: 12,
            bottom: 12,
            border: '1px dashed rgba(80,55,30,.35)',
            borderRadius: Math.max(0, rounded - 8),
            pointerEvents: 'none',
          }}
        />
      )}
      {caption && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '10px 14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10.5,
            letterSpacing: '.04em',
            color: 'rgba(50,30,15,.7)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span>{caption}</span>
          <span style={{ opacity: 0.6 }}>{ratio}</span>
        </div>
      )}
      {children}
    </div>
  );
}

Object.assign(window, { Placeholder, PH_TONES });
