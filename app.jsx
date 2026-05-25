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
        .nav-links a { white-space: nowrap; }
        h1, h2, h3 { font-family: var(--serif); }
        .regalia-title { overflow-wrap: break-word; word-break: normal; hyphens: auto; }

        @media (max-width: 880px) {
          .container { padding: 0 20px; }
          .nav-links { display: none !important; }

          /* General section padding reduction for premium mobile breathing room */
          section {
            padding: 48px 0 !important;
          }
          
          /* Headers response scales */
          h1 {
            font-size: clamp(34px, 8.5vw, 56px) !important;
            line-height: 1.05 !important;
            letter-spacing: -0.015em !important;
          }
          h2 {
            font-size: clamp(32px, 8vw, 44px) !important;
            line-height: 1.1 !important;
          }
          h3 {
            font-size: clamp(22px, 5vw, 28px) !important;
          }

          /* Hero Collage Grid */
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
            padding: 16px 0 40px !important;
          }
          /* Stack the collage images correctly and cleanly below the text */
          .hero-grid > div:last-child {
            margin-top: 16px !important;
            padding-right: 0 !important;
          }

          /* Hero Single fullscreen aspect ratio override for overlays */
          .hero-single-wrapper {
            border-radius: 8px !important;
          }
          .hero-single-wrapper > div {
            aspect-ratio: 3/4 !important; /* Elegant vertical ratio on mobile */
          }
          .hero-single-wrapper > div > div:last-child {
            padding: 24px !important; /* Soft compact padding for text */
          }

          /* Hero Slider Grid */
          .hero-slider-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
            padding: 16px 0 40px !important;
          }

          /* About Grid */
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .about-grid > div:first-child {
            max-width: 320px;
            margin: 0 auto;
          }
          .regalia-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            background: transparent !important;
            border: none !important;
            margin-top: 32px !important;
          }
          .regalia-grid > div {
            background: var(--bg-warm) !important;
            border: 1px solid rgba(42,37,32,.08) !important;
            border-radius: 8px !important;
            padding: 16px 20px !important;
          }

          /* Process Grid */
          .process-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            margin-top: 36px !important;
          }
          /* Hide horizontal connector lines */
          .process-connector {
            display: none !important;
          }

          /* Trust Grid */
          .trust-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .trust-grid > div:last-child {
            border: none !important;
            background: transparent !important;
            gap: 12px !important;
          }
          .trust-card {
            border: 1px solid rgba(42,37,32,.08) !important;
            border-radius: 8px !important;
            padding: 20px 24px !important;
          }

          /* Stories Grid */
          .stories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }

          /* Contact Grid */
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .contact-grid > div:first-child h2 {
            font-size: clamp(34px, 8.5vw, 48px) !important;
          }
        }

        @media (max-width: 768px) {
          /* Portfolio Grids */
          .portfolio-tabs-grid, .portfolio-scroll-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .portfolio-tabs-grid .portfolio-item, .portfolio-scroll-grid .portfolio-item {
            grid-column: span 1 !important;
          }
          /* Let certain portfolio items span full row for rhythmic layout */
          .portfolio-tabs-grid .portfolio-item.span-7, 
          .portfolio-tabs-grid .portfolio-item.span-5,
          .portfolio-scroll-grid .portfolio-item.span-7, 
          .portfolio-scroll-grid .portfolio-item.span-5,
          .portfolio-scroll-grid .portfolio-item.span-8 {
            grid-column: span 2 !important;
          }

          /* Portfolio Masonry Grid */
          .portfolio-masonry-grid {
            column-count: 2 !important;
            column-gap: 12px !important;
          }

          /* Leads stats grid */
          .leads-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
        }

        @media (max-width: 600px) {
          /* Stories 1-column */
          .stories-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .nav-title {
            font-size: 16px !important;
          }
          .hamburger-btn {
            width: 36px !important;
            height: 36px !important;
          }
          
          /* Portfolio Grids 1-column on mobile phones */
          .portfolio-tabs-grid, .portfolio-scroll-grid {
            grid-template-columns: 1fr !important;
          }
          .portfolio-tabs-grid .portfolio-item, .portfolio-scroll-grid .portfolio-item {
            grid-column: span 1 !important;
          }

          .portfolio-masonry-grid {
            column-count: 1 !important;
          }

          /* Leads stats grid 1-column */
          .leads-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
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
