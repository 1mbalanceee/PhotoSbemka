import React from 'react';
import ReactDOM from 'react-dom/client';

// app.jsx — root app + Tweaks wiring + theming

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "collage",
  "type": "cormorant",
  "portfolio": "masonry",
  "accent": "#D4A574",
  "city": "Самара"
}/*EDITMODE-END*/;

const TYPE_PRESETS = {
  cormorant: {
    serif: "'Cormorant Garamond', 'PT Serif', Georgia, serif",
    sans:  "'Manrope', ui-sans-serif, system-ui, sans-serif",
    label: "Cormorant + Manrope",
  },
  tenor: {
    serif: "'Tenor Sans', 'Cormorant Garamond', Georgia, serif",
    sans:  "'Inter', ui-sans-serif, system-ui, sans-serif",
    label: "Tenor Sans + Inter",
  },
  fraunces: {
    serif: "'Fraunces', 'PT Serif', Georgia, serif",
    sans:  "'Manrope', ui-sans-serif, system-ui, sans-serif",
    label: "Fraunces + Manrope",
  },
};

function shade(hex, amt) {
  // amt -1..1 — darken / lighten
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const mix = (c) => Math.max(0, Math.min(255, amt < 0 ? c * (1 + amt) : c + (255 - c) * amt));
  const to = (c) => Math.round(mix(c)).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tp = TYPE_PRESETS[t.type] || TYPE_PRESETS.cormorant;

  const [view, setView] = React.useState('home'); // 'home', 'story', 'leads'
  const [activeStory, setActiveStory] = React.useState(null);

  // Sync state with URL query parameters for deep linking
  React.useEffect(() => {
    const handleUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      if (params.has('story')) {
        setView('story');
        setActiveStory(Number(params.get('story')));
      } else if (params.has('leads') || params.has('admin') || path.endsWith('/admin') || path === '/admin') {
        setView('leads');
      } else {
        setView('home');
        setActiveStory(null);
      }
    };
    handleUrl();
    window.addEventListener('popstate', handleUrl);
    
    // Global navigation function
    window.__navigate = (newView, arg = null) => {
      const url = new URL(window.location.href);
      url.searchParams.delete('story');
      url.searchParams.delete('leads');
      url.searchParams.delete('admin');
      
      if (newView === 'story') {
        url.searchParams.set('story', arg);
        // If exiting admin page, restore the base pathname
        url.pathname = url.pathname.replace(/\/admin\/?$/, '').replace(/index\.html$/, '');
        if (!url.pathname) url.pathname = '/';
      } else if (newView === 'leads') {
        // Change URL to /admin if possible, otherwise use search param
        if (window.history.pushState) {
          url.pathname = url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') + '/admin';
        } else {
          url.searchParams.set('leads', '');
        }
      } else if (newView === 'home') {
        // If returning home, restore the base pathname
        url.pathname = url.pathname.replace(/\/admin\/?$/, '').replace(/index\.html$/, '');
        if (!url.pathname) url.pathname = '/';
      }
      
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return () => window.removeEventListener('popstate', handleUrl);
  }, []);

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--accent-dark', shade(t.accent, -0.32));
    r.style.setProperty('--serif', tp.serif);
    r.style.setProperty('--sans', tp.sans);
    r.style.setProperty('--bg', '#F6F1E8');
    r.style.setProperty('--bg-warm', '#EFE6D5');
    r.style.setProperty('--ink', '#2A2520');
    r.style.setProperty('--ink-soft', '#5C5147');
    r.style.setProperty('--muted', '#8B7E70');
    document.body.style.fontFamily = tp.sans;
  }, [t.accent, t.type, tp]);

  return (
    <div>
      <style>{`
        .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
        @media (max-width: 880px) {
          .container { padding: 0 20px; }
          .nav-links { display: none !important; }
        }
        .nav-links a { white-space: nowrap; }
        h1, h2, h3 { font-family: var(--serif); }
        .regalia-title { overflow-wrap: break-word; word-break: normal; hyphens: auto; }
      `}</style>

      <Nav />

      {view === 'home' && (
        <>
          <Hero variant={t.hero} city={t.city} />
          <About />
          <Portfolio layout={t.portfolio} />
          <Process />
          <Trust />
          <Stories />
          <Contact />
        </>
      )}

      {view === 'story' && (
        <StoryPage id={activeStory} />
      )}

      {view === 'leads' && (
        <LeadsDashboard />
      )}

      <Footer />
      <BackToTop />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Главный экран" />
        <TweakRadio
          label="Hero-лейаут"
          value={t.hero}
          options={[
            { value: 'collage',  label: 'Коллаж' },
            { value: 'single',   label: 'Одно фото' },
            { value: 'slider',   label: 'Слайдер' },
          ]}
          onChange={(v) => setTweak('hero', v)}
        />
        <TweakText
          label="Город"
          value={t.city}
          onChange={(v) => setTweak('city', v)}
        />

        <TweakSection label="Типографика" />
        <TweakSelect
          label="Шрифтовая пара"
          value={t.type}
          options={Object.entries(TYPE_PRESETS).map(([k, v]) => ({ value: k, label: v.label }))}
          onChange={(v) => setTweak('type', v)}
        />

        <TweakSection label="Портфолио" />
        <TweakRadio
          label="Структура"
          value={t.portfolio}
          options={[
            { value: 'tabs',    label: 'Табы' },
            { value: 'masonry', label: 'Masonry' },
            { value: 'scroll',  label: 'Скролл' },
          ]}
          onChange={(v) => setTweak('portfolio', v)}
        />

        <TweakSection label="Палитра" />
        <TweakColor
          label="Акцент"
          value={t.accent}
          options={['#D4A574', '#E8C76A', '#C97B5C', '#8B7355']}
          onChange={(v) => setTweak('accent', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
