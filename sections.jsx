// sections.jsx — page sections for Nadezhda Konovalova portfolio.
// All components share global window scope.

import React, { useState, useEffect, useRef, useMemo } from 'react';

// Russian locative (prepositional) case for city names.
// Handles the common patterns; defaults to appending -е otherwise.
function cityPrep(c) {
  if (!c) return c;
  if (/[иы]$/.test(c)) return c;          // Сочи, Набережные Челны
  if (/[ая]$/i.test(c)) return c.slice(0, -1) + 'е';  // Самара → Самаре, Москва → Москве
  if (/ь$/.test(c)) return c.slice(0, -1) + 'и';       // Казань → Казани
  if (/о$/.test(c)) return c.slice(0, -1) + 'е';       // Иваново → Иванове
  return c + 'е';                                       // СПб-style fallback
}

/* ────────────────────────────────────────────────────────────
   Shared bits
   ──────────────────────────────────────────────────────────── */

function SectionLabel({ num, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 14,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
      color: 'var(--muted)', marginBottom: 28,
    }}>
      <span style={{ color: 'var(--accent)' }}>§ {num}</span>
      <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: .25 }} />
      <span>{children}</span>
    </div>
  );
}

function SerifH({ children, size = 64, italic = false, style }) {
  return (
    <h2 style={{
      fontFamily: 'var(--serif)',
      fontWeight: 400,
      fontStyle: italic ? 'italic' : 'normal',
      fontSize: size,
      lineHeight: 1.04,
      letterSpacing: '-0.012em',
      margin: 0,
      color: 'var(--ink)',
      textWrap: 'balance',
      ...style,
    }}>{children}</h2>
  );
}

function PillButton({ children, primary, onClick, href }) {
  const Tag = href ? 'a' : 'button';
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '14px 22px',
    borderRadius: 999,
    fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
    letterSpacing: '.01em',
    cursor: 'pointer', border: '1px solid transparent',
    textDecoration: 'none',
    transition: 'transform .18s ease, background .18s ease, color .18s ease',
  };
  const styles = primary
    ? { ...base, background: 'var(--accent)', color: '#1A140C' }
    : { ...base, background: 'transparent', color: 'var(--ink)', borderColor: 'rgba(42,37,32,.22)' };
  return (
    <Tag
      href={href}
      onClick={onClick}
      style={styles}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
      <span aria-hidden style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>→</span>
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────
   Nav
   ──────────────────────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const links = [
    ['Обо мне', '#about'],
    ['Направления', '#work'],
    ['Процесс', '#process'],
    ['Истории', '#stories'],
    ['Контакты', '#contact'],
  ];

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLinkClick = (e, targetHash) => {
    if (window.location.search.includes('story') || window.location.search.includes('leads') || window.location.search.includes('admin')) {
      e.preventDefault();
      window.__navigate('home');
      setTimeout(() => {
        const el = document.querySelector(targetHash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      padding: scrolled ? '14px 0' : '22px 0',
      background: scrolled ? 'rgba(246,241,232,.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(42,37,32,.08)' : '1px solid transparent',
      transition: 'all .25s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <a 
          href="#top" 
          onClick={(e) => {
            if (window.location.search.includes('story') || window.location.search.includes('leads') || window.location.search.includes('admin')) {
              e.preventDefault();
              window.__navigate('home');
            }
          }}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 60 }}
        >
          <span aria-hidden style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#1A140C', fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic',
            fontWeight: 600,
          }}>N</span>
          <span style={{
            fontFamily: 'var(--serif)', fontSize: 19, letterSpacing: '.01em', color: 'var(--ink)',
            fontWeight: 500,
          }}>
            Надежда Коновалова
          </span>
        </a>
        <nav style={{ display: 'flex', gap: 32 }} className="nav-links">
          {links.map(([l, h]) => (
            <a key={h} href={h} 
            onClick={(e) => handleLinkClick(e, h)}
            style={{
              fontSize: 14, letterSpacing: '.02em',
              color: 'var(--ink)', textDecoration: 'none', opacity: .78,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.78'}
            >{l}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="#contact" 
          onClick={(e) => handleLinkClick(e, '#contact')}
          className="nav-cta" 
          style={{
            fontSize: 13, padding: '9px 18px', borderRadius: 999,
            background: 'var(--ink)', color: 'var(--bg)', textDecoration: 'none',
            letterSpacing: '.01em', transition: 'all .2s ease',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(42,37,32,.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >Обсудить идею</a>

          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle mobile menu"
            style={{
              background: 'transparent', border: 0, padding: 8, cursor: 'pointer',
              display: 'none', flexDirection: 'column', gap: 5, zIndex: 60, position: 'relative',
              justifyContent: 'center', alignItems: 'center', width: 40, height: 40,
            }}
            className="hamburger-btn"
          >
            <span style={{
              width: 22, height: 2, background: 'var(--ink)', transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }} />
            <span style={{
              width: 22, height: 2, background: 'var(--ink)', transition: 'all 0.3s ease',
              opacity: menuOpen ? 0 : 1
            }} />
            <span style={{
              width: 22, height: 2, background: 'var(--ink)', transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
            }} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .nav-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .nav-cta { display: none !important; }
        }
      `}</style>

      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 55,
          background: 'rgba(246, 241, 232, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: 36, animation: 'fadeIn 0.25s ease-out',
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {links.map(([l, h], idx) => (
            <a 
              key={h} href={h} 
              onClick={() => {
                setMenuOpen(false);
                if (window.location.search.includes('story') || window.location.search.includes('leads') || window.location.search.includes('admin')) {
                  window.__navigate('home');
                  setTimeout(() => {
                    const el = document.querySelector(h);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }
              }}
              style={{
                fontFamily: 'var(--serif)', fontSize: 32, fontStyle: 'italic',
                color: 'var(--ink)', textDecoration: 'none', opacity: 0.9,
                animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
              }}
            >
              {l}
            </a>
          ))}
          <a 
            href="#contact" 
            onClick={() => {
              setMenuOpen(false);
              if (window.location.search.includes('story') || window.location.search.includes('leads') || window.location.search.includes('admin')) {
                window.__navigate('home');
                setTimeout(() => {
                  const el = document.querySelector('#contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }
            }}
            style={{
              marginTop: 24, fontSize: 16, padding: '14px 28px', borderRadius: 999,
              background: 'var(--ink)', color: 'var(--bg)', textDecoration: 'none',
              letterSpacing: '.02em', fontWeight: 500, fontFamily: 'var(--sans)',
              animation: 'slideIn 0.3s ease-out 0.3s both',
            }}
          >
            Обсудить идею →
          </a>
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
   Hero — 3 variants
   ──────────────────────────────────────────────────────────── */

function HeroCollage({ city }) {
  return (
    <section id="top" style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11.5, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            Фотограф · {city} · 10 лет в кадре
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 400,
            fontSize: 'clamp(48px, 6.4vw, 92px)', lineHeight: .98,
            letterSpacing: '-0.018em', margin: 0, color: 'var(--ink)', textWrap: 'balance',
          }}>
            Живые фотографии<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--accent-dark)' }}>без скучного позирования</em><br/>
            в {cityPrep(city)}.
          </h1>
          <p style={{
            maxWidth: 480, marginTop: 28, fontSize: 17, lineHeight: 1.55,
            color: 'var(--ink-soft)',
          }}>
            Снимаю семейные истории, репортажи и деловой имидж.
            Комфорт в кадре, понятный процесс и&nbsp;готовые фотографии за&nbsp;7&nbsp;дней.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <PillButton primary href="#contact">Обсудить вашу идею</PillButton>
            <PillButton href="#work">Посмотреть работы</PillButton>
          </div>
          <div style={{
            marginTop: 56, display: 'flex', gap: 32, flexWrap: 'wrap',
            paddingTop: 28, borderTop: '1px solid rgba(42,37,32,.1)',
          }}>
            {[
              ['10 лет', 'на съёмках'],
              ['600+', 'семей и проектов'],
              ['7 дней', 'до готовых фото'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink)' }}>{k}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'relative',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto',
          gap: 14, alignContent: 'start',
        }}>
          <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3', marginTop: 40 }}>
            <Placeholder caption="hero · семья в свету" idx={0} ratio="3/4" rounded={6} frame />
          </div>
          <div>
            <Placeholder caption="портрет · студия" idx={2} ratio="4/5" rounded={6} frame />
          </div>
          <div style={{ marginTop: -28 }}>
            <Placeholder caption="репортаж · школа" idx={4} ratio="1/1" rounded={6} frame />
          </div>
          <div style={{
            position: 'absolute', right: -8, top: -16,
            background: 'var(--ink)', color: 'var(--bg)',
            padding: '8px 14px', borderRadius: 999,
            fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}>
            Свободны 3 даты · июнь
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSingle({ city }) {
  return (
    <section id="top" style={{ padding: '24px 0 80px' }}>
      <div className="container">
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
          <Placeholder caption="hero · полнокадровый снимок · ребёнок в окне, тёплый свет" idx={0} ratio="16/9" rounded={12} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(20,15,8,.05) 0%, rgba(20,15,8,.55) 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 'clamp(28px, 5vw, 64px)',
            color: '#FBF7EF',
          }}>
            <div style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11.5, letterSpacing: '.18em', textTransform: 'uppercase',
              opacity: .9, marginBottom: 20,
            }}>
              Фотограф · {city} · с 2015
            </div>
            <h1 style={{
              fontFamily: 'var(--serif)', fontWeight: 400,
              fontSize: 'clamp(44px, 6.4vw, 96px)', lineHeight: .98,
              letterSpacing: '-0.018em', margin: 0, textWrap: 'balance', maxWidth: '14ch',
            }}>
              Живые фотографии <em style={{ color: 'var(--accent)' }}>без скучного позирования</em> в&nbsp;{cityPrep(city)}.
            </h1>
            <p style={{
              maxWidth: 520, marginTop: 22, fontSize: 17, lineHeight: 1.55, opacity: .92,
            }}>
              Семейные истории, репортажи и&nbsp;деловой имидж.
              Готовые фото за&nbsp;7&nbsp;дней.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <PillButton primary href="#contact">Обсудить вашу идею</PillButton>
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 36, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
          color: 'var(--muted)', fontSize: 13,
        }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)' }}>10 лет</span> в кадре
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: .4 }} />
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)' }}>600+</span> проектов
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: .4 }} />
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)' }}>7 дней</span> до результата
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            ↓ прокрутите ниже
          </span>
        </div>
      </div>
    </section>
  );
}

function HeroSlider({ city }) {
  const slides = [
    { caption: 'Семья · домашняя съёмка', tone: 0 },
    { caption: 'Деловой портрет · студия', tone: 2 },
    { caption: 'Репортаж · школьный праздник', tone: 4 },
    { caption: 'Камерная свадьба · ЗАГС', tone: 5 },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <section id="top" style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11.5, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            Фотограф · {city}
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 400,
            fontSize: 'clamp(46px, 6vw, 86px)', lineHeight: .98,
            letterSpacing: '-0.018em', margin: 0, color: 'var(--ink)', textWrap: 'balance',
          }}>
            Живые фотографии <em style={{ color: 'var(--accent-dark)' }}>без скучного позирования</em> в {cityPrep(city)}.
          </h1>
          <p style={{ maxWidth: 460, marginTop: 24, fontSize: 17, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
            10 лет опыта. Семьи, дети, портрет, репортаж, камерные свадьбы.
            Готовые фото за&nbsp;7&nbsp;дней.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <PillButton primary href="#contact">Обсудить вашу идею</PillButton>
            <PillButton href="#work">Посмотреть работы</PillButton>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 10, overflow: 'hidden' }}>
            {slides.map((s, idx) => (
              <div key={idx} style={{
                position: 'absolute', inset: 0,
                opacity: idx === i ? 1 : 0,
                transition: 'opacity .9s ease',
              }}>
                <Placeholder caption={s.caption} idx={s.tone} ratio="4/5" rounded={10} />
              </div>
            ))}
            <div style={{
              position: 'absolute', left: 16, right: 16, bottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {slides.map((_, idx) => (
                <button key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Слайд ${idx + 1}`}
                  style={{
                    flex: 1, height: 3,
                    border: 0, padding: 0, borderRadius: 2, cursor: 'pointer',
                    background: idx === i ? 'rgba(255,250,240,.95)' : 'rgba(255,250,240,.32)',
                    transition: 'background .25s ease',
                  }}
                />
              ))}
              <span style={{
                marginLeft: 12, color: '#FBF7EF',
                fontFamily: 'ui-monospace, monospace', fontSize: 11.5, letterSpacing: '.1em',
              }}>
                {String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero({ variant, city }) {
  if (variant === 'single') return <HeroSingle city={city} />;
  if (variant === 'slider') return <HeroSlider city={city} />;
  return <HeroCollage city={city} />;
}

/* ────────────────────────────────────────────────────────────
   About + Philosophy
   ──────────────────────────────────────────────────────────── */

function About() {
  return (
    <section id="about" style={{ padding: '80px 0 100px' }}>
      <div className="container">
        <SectionLabel num="01">Обо&nbsp;мне · Философия</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 64, alignItems: 'start' }}>
          <div>
            <Placeholder caption="портрет автора · мягкий свет" idx={1} ratio="4/5" rounded={6} frame />
            <div style={{ marginTop: 24, paddingLeft: 4 }}>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)' }}>
                Надежда Коновалова
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                фотограф · Самара · с 2015 года
              </div>
            </div>
          </div>

          <div>
            <SerifH size={56}>
              За&nbsp;десять лет — <em style={{ fontStyle: 'italic' }}>сотни съёмок</em>: от&nbsp;шумных школьных классов до&nbsp;камерных свадеб.
            </SerifH>
            <div style={{
              marginTop: 32, fontSize: 17.5, lineHeight: 1.65,
              color: 'var(--ink-soft)', maxWidth: 560,
            }}>
              <p style={{ margin: '0 0 18px' }}>
                Мой главный навык — умение слушать. Мы обсудим ваши пожелания,
                я&nbsp;предложу лучшие локации и&nbsp;световые решения.
              </p>
              <p style={{ margin: 0 }}>
                На&nbsp;моих съёмках люди не&nbsp;застывают в&nbsp;неудобных позах —
                они <em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>живут в&nbsp;кадре</em> через
                игру, разговор и&nbsp;настоящие эмоции.
              </p>
            </div>

            <div style={{
              marginTop: 44, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
              background: 'rgba(42,37,32,.12)',
              border: '1px solid rgba(42,37,32,.12)',
              borderRadius: 4, overflow: 'hidden',
            }}>
              {[
                ['Школа Сахарова', 'композиция и свет'],
                ['Mastering Portrait', 'портретный курс'],
                ['Wedding Lab', 'документальная свадьба'],
              ].map(([t, s]) => (
                <div key={t} style={{ background: 'var(--bg)', padding: '18px 18px 20px', minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'ui-monospace, monospace', fontSize: 10.5, letterSpacing: '.12em',
                    textTransform: 'uppercase', color: 'var(--accent-dark)', marginBottom: 8,
                  }}>★ регалия</div>
                  <div className="regalia-title" style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.2 }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Portfolio — 4 categories, 3 layouts
   ──────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    id: 'family', label: 'Дети и семья',
    blurb: 'Съёмка в игре, живые эмоции. Дома, на природе, в студии.',
    items: [
      { c: 'утренний завтрак · семья из 4-х', tone: 0, ratio: '4/5' },
      { c: 'дочь и папа · парк горького', tone: 3, ratio: '1/1' },
      { c: 'братья на даче', tone: 2, ratio: '3/4' },
      { c: 'малыш в окне · домашний свет', tone: 5, ratio: '4/5' },
      { c: 'игра в саду', tone: 4, ratio: '16/10' },
      { c: 'портрет мамы с младенцем', tone: 1, ratio: '4/5' },
    ],
  },
  {
    id: 'portrait', label: 'Портрет и бизнес',
    blurb: 'Мужской и женский портрет. Контент для соцсетей, лендингов и медиа.',
    items: [
      { c: 'предприниматель · кофейня', tone: 2, ratio: '3/4' },
      { c: 'имиджевая съёмка · салон', tone: 1, ratio: '4/5' },
      { c: 'портрет эксперта · кабинет', tone: 5, ratio: '1/1' },
      { c: 'женский портрет · окно', tone: 0, ratio: '4/5' },
      { c: 'команда стартапа', tone: 3, ratio: '16/10' },
    ],
  },
  {
    id: 'reportage', label: 'Репортаж',
    blurb: 'Праздники, события, школьные выпускные, корпоративы, садики.',
    items: [
      { c: 'школьный выпускной · 11 класс', tone: 4, ratio: '3/2' },
      { c: 'детский сад · выпускной', tone: 0, ratio: '4/5' },
      { c: 'корпоратив IT-компании', tone: 2, ratio: '1/1' },
      { c: 'юбилей · банкетный зал', tone: 5, ratio: '4/5' },
      { c: 'конференция предпринимателей', tone: 1, ratio: '3/2' },
    ],
  },
  {
    id: 'wedding', label: 'Камерные свадьбы',
    blurb: 'ЗАГС и прогулка по вашим пожеланиям. Камерно, без суеты.',
    items: [
      { c: 'утро невесты', tone: 1, ratio: '4/5' },
      { c: 'выездная роспись · набережная', tone: 0, ratio: '3/2' },
      { c: 'прогулка вдвоём · волга', tone: 3, ratio: '4/5' },
      { c: 'первый танец', tone: 5, ratio: '1/1' },
    ],
  },
];

function Lightbox({ item, onClose, onPrev, onNext }) {
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (diff > 50) {
      onNext();
    } else if (diff < -50) {
      onPrev();
    }
  };

  if (!item) return null;

  return (
    <div 
      onClick={onClose} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(20,15,8,.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'lightboxFadeIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lightboxZoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .lightbox-arrow:hover {
          background: rgba(251,247,239,.18) !important;
          border-color: rgba(251,247,239,.4) !important;
          transform: translateY(-50%) scale(1.05) !important;
        }
        .lightbox-close:hover {
          background: rgba(251,247,239,.15) !important;
          border-color: rgba(251,247,239,.5) !important;
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .lightbox-arrow { display: none !important; }
        }
      `}</style>

      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }} 
        className="lightbox-arrow"
        style={lightboxBtn('left')}
        aria-label="Previous image"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 'min(85vw, 920px)', width: '100%',
          animation: 'lightboxZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Placeholder caption={item.c} idx={item.tone} ratio={item.ratio} rounded={8} frame />
        <div style={{
          color: '#FBF7EF', marginTop: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontFamily: 'ui-monospace, monospace', fontSize: 11.5, letterSpacing: '.1em',
          opacity: 0.9, flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ textTransform: 'uppercase', color: 'var(--accent)' }}>{item.c}</span>
          <span style={{ opacity: .65 }}>{item.ratio} · raw → retouch · swipe to browse</span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }} 
        className="lightbox-arrow"
        style={lightboxBtn('right')}
        aria-label="Next image"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>

      <button 
        onClick={onClose} 
        className="lightbox-close"
        style={{
          position: 'absolute', top: 24, right: 24,
          background: 'rgba(251,247,239,.05)', border: '1px solid rgba(251,247,239,.2)',
          color: '#FBF7EF', width: 44, height: 44, borderRadius: '50%',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s ease',
        }}
        aria-label="Close lightbox"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
function lightboxBtn(side) {
  return {
    position: 'absolute', [side]: 24, top: '50%', transform: 'translateY(-50%)',
    width: 48, height: 48, borderRadius: '50%',
    background: 'rgba(251,247,239,.08)', border: '1px solid rgba(251,247,239,.18)',
    color: '#FBF7EF', cursor: 'pointer', fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s ease',
  };
}

function PortfolioTabs() {
  const [tab, setTab] = useState(0);
  const cat = CATEGORIES[tab];
  const [lbIdx, setLbIdx] = useState(null);
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {CATEGORIES.map((c, i) => (
          <button key={c.id} onClick={() => setTab(i)} style={{
            padding: '10px 18px', borderRadius: 999,
            border: '1px solid ' + (i === tab ? 'transparent' : 'rgba(42,37,32,.18)'),
            background: i === tab ? 'var(--ink)' : 'transparent',
            color: i === tab ? 'var(--bg)' : 'var(--ink)',
            cursor: 'pointer', fontSize: 13.5, letterSpacing: '.01em',
            transition: 'all .18s ease',
          }}>
            {c.label}
            <span style={{ marginLeft: 8, opacity: .55, fontSize: 11 }}>{c.items.length}</span>
          </button>
        ))}
      </div>
      <p style={{ maxWidth: 540, fontSize: 16, lineHeight: 1.55, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
        {cat.blurb}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 14,
      }}>
        {cat.items.map((it, idx) => {
          const span = idx % 5 === 0 ? 7 : idx % 5 === 1 ? 5 : idx % 5 === 2 ? 4 : idx % 5 === 3 ? 4 : 4;
          return (
            <div key={idx} style={{ gridColumn: `span ${span}`, cursor: 'zoom-in' }}
                 onClick={() => setLbIdx(idx)}>
              <Placeholder caption={it.c} idx={it.tone} ratio={it.ratio} rounded={4} />
            </div>
          );
        })}
      </div>
      {lbIdx !== null && (
        <Lightbox
          item={cat.items[lbIdx]}
          onClose={() => setLbIdx(null)}
          onPrev={() => setLbIdx((x) => (x - 1 + cat.items.length) % cat.items.length)}
          onNext={() => setLbIdx((x) => (x + 1) % cat.items.length)}
        />
      )}
    </>
  );
}

function PortfolioMasonry() {
  const [filter, setFilter] = useState('all');
  const [lbIdx, setLbIdx] = useState(null);
  const all = useMemo(() => CATEGORIES.flatMap((c, ci) => c.items.map((it, ii) => ({ ...it, _cat: c.id, _label: c.label, _key: `${ci}-${ii}` }))), []);
  const items = filter === 'all' ? all : all.filter((x) => x._cat === filter);
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28, alignItems: 'center' }}>
        <span style={{
          fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '.16em',
          textTransform: 'uppercase', color: 'var(--muted)', marginRight: 12,
        }}>Фильтр</span>
        {[{ id: 'all', label: 'Все' }, ...CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)} style={{
            padding: '8px 14px', borderRadius: 6,
            border: '1px solid ' + (c.id === filter ? 'var(--accent)' : 'rgba(42,37,32,.14)'),
            background: c.id === filter ? 'rgba(212,165,116,.12)' : 'transparent',
            color: 'var(--ink)', cursor: 'pointer', fontSize: 13,
          }}>{c.label}</button>
        ))}
      </div>
      <div style={{ columnCount: 3, columnGap: 14 }}>
        {items.map((it, idx) => (
          <div key={it._key} style={{ breakInside: 'avoid', marginBottom: 14, cursor: 'zoom-in' }}
               onClick={() => setLbIdx(idx)}>
            <Placeholder caption={it.c} idx={it.tone} ratio={it.ratio} rounded={4} />
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)', letterSpacing: '.04em' }}>
              {it._label}
            </div>
          </div>
        ))}
      </div>
      {lbIdx !== null && (
        <Lightbox
          item={items[lbIdx]}
          onClose={() => setLbIdx(null)}
          onPrev={() => setLbIdx((x) => (x - 1 + items.length) % items.length)}
          onNext={() => setLbIdx((x) => (x + 1) % items.length)}
        />
      )}
    </>
  );
}

function PortfolioScroll() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
      {CATEGORIES.map((c, ci) => (
        <div key={c.id} id={`work-${c.id}`}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            gap: 24, flexWrap: 'wrap', marginBottom: 24,
            paddingBottom: 18, borderBottom: '1px solid rgba(42,37,32,.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
              <span style={{
                fontFamily: 'ui-monospace, monospace', fontSize: 12,
                color: 'var(--accent-dark)', letterSpacing: '.1em',
              }}>0{ci + 1} /</span>
              <SerifH size={42}>{c.label}</SerifH>
            </div>
            <div style={{ maxWidth: 360, fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
              {c.blurb}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 12,
          }}>
            {c.items.map((it, idx) => {
              const layouts = [
                [7, 5], [5, 7], [4, 4, 4], [6, 6], [4, 8],
              ];
              const row = layouts[idx % layouts.length];
              const span = row[idx % row.length];
              return (
                <div key={idx} style={{ gridColumn: `span ${span}` }}>
                  <Placeholder caption={it.c} idx={it.tone} ratio={it.ratio} rounded={4} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Portfolio({ layout }) {
  return (
    <section id="work" style={{ padding: '40px 0 100px' }}>
      <div className="container">
        <SectionLabel num="02">Направления съёмок</SectionLabel>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 32, marginBottom: 40, flexWrap: 'wrap',
        }}>
          <SerifH size={64}>
            Четыре направления — <em>один подход</em>.
          </SerifH>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'rgba(212,165,116,.12)',
            padding: '10px 16px', borderRadius: 999,
            border: '1px solid rgba(212,165,116,.3)',
          }}>
            <span style={{ fontSize: 18, fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--accent-dark)' }}>спец-проект</span>
            <span style={{ width: 1, height: 18, background: 'rgba(42,37,32,.2)' }} />
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.__navigate('story', 0); }}
              style={{ fontSize: 13, color: 'var(--ink)', textDecoration: 'underline', textDecorationColor: 'var(--accent)' }}
            >
              Русские костюмы → сказка
            </a>
          </div>
        </div>
        {layout === 'masonry' && <PortfolioMasonry />}
        {layout === 'scroll' && <PortfolioScroll />}
        {(layout === 'tabs' || !layout) && <PortfolioTabs />}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Process · 3 шага
   ──────────────────────────────────────────────────────────── */

function Process() {
  const steps = [
    {
      n: '01', t: 'Обсуждение',
      d: 'Слушаю ваши идеи, подбираем концепцию и локацию. Если нужно — подключаем проверенного визажиста и стилиста.',
      tag: 'до съёмки', dur: '20–40 мин',
    },
    {
      n: '02', t: 'Съёмка',
      d: 'Всё проходит в комфортной игровой или дружеской обстановке. Я полностью контролирую свет и помогаю расслабиться.',
      tag: 'на месте', dur: '1–3 часа',
    },
    {
      n: '03', t: 'Результат',
      d: 'Сама отбираю, редактирую и ретуширую кадры. Готовые фото — строго в течение 7 дней после съёмки.',
      tag: 'после съёмки', dur: '7 дней',
    },
  ];
  return (
    <section id="process" style={{
      padding: '100px 0 120px',
      background: 'var(--bg-warm)',
      borderTop: '1px solid rgba(42,37,32,.08)',
      borderBottom: '1px solid rgba(42,37,32,.08)',
    }}>
      <div className="container">
        <SectionLabel num="03">Как проходит съёмка</SectionLabel>
        <SerifH size={64}>
          Без сюрпризов. <em>Шаг за&nbsp;шагом — до&nbsp;готовых фото.</em>
        </SerifH>
        <p style={{ maxWidth: 540, fontSize: 17, lineHeight: 1.55, color: 'var(--ink-soft)', marginTop: 24 }}>
          Понятный процесс — половина успеха съёмки. Вы знаете, что и когда происходит, и&nbsp;когда получите файлы.
        </p>

        <div style={{
          marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
          position: 'relative',
        }}>
          <div aria-hidden style={{
            position: 'absolute', left: '8.33%', right: '8.33%', top: 28, height: 1,
            background: 'repeating-linear-gradient(90deg, var(--accent) 0 6px, transparent 6px 12px)',
            opacity: .65,
          }} />
          {steps.map((s, i) => (
            <article key={s.n} style={{ position: 'relative' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--bg)', border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--accent-dark)',
                position: 'relative', zIndex: 2,
              }}>{s.n}</div>
              <div style={{
                marginTop: 24, fontFamily: 'ui-monospace, monospace',
                fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'var(--muted)', display: 'flex', gap: 12,
              }}>
                <span>{s.tag}</span>
                <span style={{ color: 'var(--accent-dark)' }}>· {s.dur}</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400,
                margin: '8px 0 12px', color: 'var(--ink)',
              }}>{s.t}</h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 }}>
                {s.d}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Trust block
   ──────────────────────────────────────────────────────────── */

function Trust() {
  const items = [
    {
      k: 'Оплата после съёмки',
      v: 'Вы платите за результат. Никаких предоплат «вслепую» — сначала съёмка, потом деньги.',
      icon: '✓',
    },
    {
      k: 'Официальный чек',
      v: 'Работа через самозанятость. Чек оформляется через приложение «Мой налог», подходит для оплаты с компании.',
      icon: '✦',
    },
    {
      k: 'Договорённость на берегу',
      v: 'Фиксируем условия устно или письменно: что снимаем, где, сколько и в каком виде получаете.',
      icon: '§',
    },
  ];
  return (
    <section style={{ padding: '100px 0' }}>
      <div className="container">
        <SectionLabel num="04">Условия и гарантии</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start' }}>
          <SerifH size={56}>
            Прозрачно. <em>Никаких неожиданностей.</em>
          </SerifH>
          <div style={{ display: 'grid', gap: 1, background: 'rgba(42,37,32,.12)', border: '1px solid rgba(42,37,32,.12)' }}>
            {items.map((it) => (
              <div key={it.k} style={{
                background: 'var(--bg)',
                padding: '28px 32px',
                display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24, alignItems: 'baseline',
              }}>
                <span style={{
                  fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--accent-dark)', fontStyle: 'italic',
                }}>{it.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)' }}>{it.k}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-soft)', marginTop: 8 }}>{it.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Stories / cases
   ──────────────────────────────────────────────────────────── */

function Stories() {
  const cards = [
    {
      tag: 'спец-проект', date: '03 · 2026',
      t: 'Как мы создавали сказку: тематическая съёмка в русских костюмах',
      teaser: 'Подбирали локацию вдоль Волги, шили сарафан под цвет утреннего света, ловили туман на рассвете.',
      tone: 4, ratio: '4/5', read: '6 мин',
    },
    {
      tag: 'семья', date: '01 · 2026',
      t: 'Домашняя съёмка с двойняшками: что делать, если дети не сидят на месте',
      teaser: 'Маленький план, много игры и одно правило — не торопить. Что получилось — внутри.',
      tone: 0, ratio: '4/5', read: '4 мин',
    },
    {
      tag: 'бизнес', date: '11 · 2025',
      t: 'Деловой портрет для эксперта: как снять «человеческое лицо» бренда',
      teaser: 'Снимали серию для лендинга и соцсетей. Один день, три локации, шесть образов.',
      tone: 2, ratio: '4/5', read: '5 мин',
    },
  ];
  return (
    <section id="stories" style={{ padding: '60px 0 120px' }}>
      <div className="container">
        <SectionLabel num="05">Истории съёмок</SectionLabel>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap', marginBottom: 48,
        }}>
          <SerifH size={64}>
            Мини-истории <em>из&nbsp;недавних съёмок</em>.
          </SerifH>
          <a href="#" onClick={(e) => { e.preventDefault(); window.__navigate('story', 0); }} style={{
            fontSize: 13.5, color: 'var(--ink)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            borderBottom: '1px solid var(--accent)', paddingBottom: 4,
          }}>Все истории →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="stories-grid">
          <style>{`
            @media (max-width: 880px) {
              .stories-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
            }
          `}</style>
          {cards.map((c, i) => (
            <article key={i} style={{ cursor: 'pointer' }}
              onClick={() => window.__navigate('story', i)}
              onMouseEnter={(e) => { e.currentTarget.querySelector('.ph').style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.querySelector('.ph').style.transform = 'scale(1)'; }}>
              <div style={{ overflow: 'hidden', borderRadius: 4 }}>
                <div className="ph" style={{ transition: 'transform .5s ease' }}>
                  <Placeholder caption={c.t.toLowerCase()} idx={c.tone} ratio={c.ratio} rounded={4} />
                </div>
              </div>
              <div style={{
                marginTop: 18, display: 'flex', justifyContent: 'space-between',
                fontFamily: 'ui-monospace, monospace', fontSize: 11,
                letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)',
              }}>
                <span style={{ color: 'var(--accent-dark)' }}>· {c.tag}</span>
                <span>{c.date} · {c.read}</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, lineHeight: 1.18,
                margin: '10px 0 10px', color: 'var(--ink)', textWrap: 'balance',
              }}>{c.t}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>{c.teaser}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Contact + Footer
   ──────────────────────────────────────────────────────────── */

function Contact() {
  const [form, setForm] = useState({ name: '', contact: '', kind: 'family', when: '', msg: '' });
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const errors = {
    name: !form.name.trim() ? 'Как вас зовут?' : null,
    contact: !form.contact.trim() ? 'Куда написать ответ?' : null,
  };
  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, contact: true });
    if (errors.name || errors.contact) return;
    
    setSending(true);
    
    const newLead = {
      name: form.name,
      contact: form.contact,
      kind: form.kind,
      when: form.when,
      msg: form.msg,
      date: new Date().toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    })
    .then(r => {
      if (!r.ok) throw new Error('API Error');
      return r.json();
    })
    .then(() => {
      setSending(false);
      setSent(true);
    })
    .catch(err => {
      console.error('Server offline, saving lead locally:', err);
      const existingLeads = JSON.parse(localStorage.getItem('nk_leads') || '[]');
      localStorage.setItem('nk_leads', JSON.stringify([newLead, ...existingLeads]));
      setSending(false);
      setSent(true);
    });
  };
  return (
    <section id="contact" style={{
      padding: '120px 0 80px',
      background: 'var(--accent)',
      color: 'var(--ink)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 85% 15%, rgba(255,250,240,.35), transparent 55%), radial-gradient(circle at 10% 90%, rgba(42,37,32,.08), transparent 55%)',
      }} />
      <div className="container" style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80, alignItems: 'start' }}>
          <div>
            <div style={{
              fontFamily: 'ui-monospace, monospace', fontSize: 11.5,
              letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'var(--accent-dark)', marginBottom: 28,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink)', boxShadow: '0 0 0 4px rgba(42,37,32,.12)' }} />
              § 06 — Контакты
            </div>
            <h2 style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(48px, 5.6vw, 80px)', fontWeight: 400,
              lineHeight: 1.02, letterSpacing: '-0.018em', margin: 0, textWrap: 'balance', color: 'var(--ink)',
            }}>
              Расскажите, что снимаем — <em style={{ fontStyle: 'italic', color: 'var(--accent-dark)' }}>я отвечу за день</em>.
            </h2>
            <p style={{ marginTop: 24, maxWidth: 460, fontSize: 17, lineHeight: 1.55, color: 'rgba(42,37,32,.78)' }}>
              Заполните короткую форму или напишите в&nbsp;удобный мессенджер.
              На&nbsp;связи каждый будний день с&nbsp;10:00 до&nbsp;20:00.
            </p>

            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Telegram', '@nadyakonovalova', 'tg'],
                ['ВКонтакте', 'vk.com/nadya.photo', 'vk'],
                ['Почта', 'hello@nadyakonovalova.ru', '@'],
                ['Телефон', '+7 (846) 000-00-00', '☎'],
              ].map(([k, v, ic]) => (
                <a key={k} href="#" style={{
                  display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'var(--ink)',
                  padding: '14px 18px',
                  background: 'rgba(255,250,240,.4)',
                  border: '1px solid rgba(42,37,32,.14)',
                  borderRadius: 8, transition: 'all .18s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,250,240,.7)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,250,240,.4)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--ink)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                  }}>{ic}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent-dark)', fontFamily: 'ui-monospace, monospace' }}>{k}</div>
                    <div style={{ fontSize: 15.5, marginTop: 2, color: 'var(--ink)' }}>{v}</div>
                  </div>
                  <span style={{ color: 'var(--accent-dark)' }}>→</span>
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={submit} style={{
            background: 'var(--bg)',
            border: '1px solid rgba(42,37,32,.1)',
            borderRadius: 12, padding: 36, position: 'relative',
            boxShadow: '0 24px 60px -28px rgba(60,40,20,.4)',
          }}>
            {sent ? (
              <div style={{ padding: '40px 0 20px', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'var(--ink)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>✓</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, margin: 0, color: 'var(--ink)' }}>Заявка отправлена</h3>
                <p style={{ marginTop: 12, color: 'var(--ink-soft)', fontSize: 15 }}>
                  Свяжусь с&nbsp;вами в&nbsp;течение дня — обсудим детали и&nbsp;даты.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: 11,
                  letterSpacing: '.16em', textTransform: 'uppercase',
                  color: 'var(--accent-dark)', marginBottom: 22,
                }}>Форма заявки</div>

                <Field label="Как к вам обращаться" error={touched.name && errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Например, Мария"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Телеграм, телефон или почта" error={touched.contact && errors.contact}>
                  <input
                    value={form.contact}
                    onChange={(e) => update('contact', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, contact: true }))}
                    placeholder="@username · +7 · email"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Что снимаем">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORIES.map((c) => (
                      <button type="button" key={c.id}
                        onClick={() => update('kind', c.id)}
                        style={{
                          padding: '9px 14px', borderRadius: 6,
                          border: '1px solid ' + (form.kind === c.id ? 'var(--accent-dark)' : 'rgba(42,37,32,.18)'),
                          background: form.kind === c.id ? 'rgba(212,165,116,.22)' : 'transparent',
                          color: 'var(--ink)', cursor: 'pointer', fontSize: 13,
                          fontFamily: 'var(--sans)',
                        }}>{c.label}</button>
                    ))}
                  </div>
                </Field>

                <Field label="Когда планируете">
                  <input
                    value={form.when}
                    onChange={(e) => update('when', e.target.value)}
                    placeholder="Конкретная дата или «в течение месяца»"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Идея, пожелания, вопросы">
                  <textarea
                    rows={4}
                    value={form.msg}
                    onChange={(e) => update('msg', e.target.value)}
                    placeholder="Расскажите немного — это поможет подготовиться"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
                  />
                </Field>

                <button type="submit" disabled={sending} style={{
                  marginTop: 8, width: '100%', padding: '16px 24px',
                  background: 'var(--ink)', color: 'var(--bg)',
                  border: 0, borderRadius: 999, cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize: 15, fontWeight: 500, letterSpacing: '.01em',
                  fontFamily: 'var(--sans)',
                  transition: 'transform .18s ease, background .18s ease',
                  opacity: sending ? 0.8 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={(e) => { if (!sending) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { if (!sending) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {sending ? (
                    <>
                      <span className="spinner" style={{
                        width: 16, height: 16, border: '2px solid var(--bg)',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.6s linear infinite',
                      }} />
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <span>Отправить заявку →</span>
                  )}
                </button>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <div style={{
                  marginTop: 14, textAlign: 'center', fontSize: 12,
                  color: 'var(--muted)',
                  fontFamily: 'ui-monospace, monospace', letterSpacing: '.06em',
                }}>оплата после съёмки · официальный чек · самозанятость</div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 6,
  background: '#FBF7EF',
  border: '1px solid rgba(42,37,32,.18)',
  color: 'var(--ink)',
  fontFamily: 'var(--sans)', fontSize: 14.5, outline: 'none',
};

function Field({ label, children, error }) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase',
        color: 'var(--muted)', marginBottom: 8, fontFamily: 'ui-monospace, monospace',
      }}>
        <span>{label}</span>
        {error && <span style={{ color: '#B14A2D', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--sans)' }}>{error}</span>}
      </div>
      {children}
    </label>
  );
}

function Footer() {
  return (
    <footer style={{
      background: 'var(--ink)', color: 'rgba(251,247,239,.65)',
      padding: '40px 0 32px', borderTop: '1px solid rgba(251,247,239,.1)',
    }}>
      <div className="container" style={{
        display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        fontSize: 12.5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span aria-hidden style={{
            width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#1A140C', fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic',
          }}>N</span>
          <span>© 2026 Надежда Коновалова · Фотограф в Самаре</span>
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
          <span>Самозанятость · ИНН 63ХХХХХХХХХХ</span>
          <button 
            onClick={() => window.__navigate('leads')}
            style={{ background: 'transparent', border: 0, padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
          >
            Панель заявок
          </button>
          <a href="#" style={{ color: 'inherit' }}>Политика обработки данных</a>
          <a href="#" style={{ color: 'inherit' }}>Оферта</a>
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const f = () => setVisible(window.scrollY > 400);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const scroll = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (!visible) return null;
  return (
    <button 
      onClick={scroll}
      aria-label="Scroll to top"
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 45,
        width: 48, height: 48, borderRadius: '50%',
        background: 'var(--ink)', color: 'var(--bg)',
        border: '1px solid rgba(251,247,239,.1)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px -6px rgba(42,37,32,.25)',
        transition: 'all .25s ease',
        animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'var(--accent-dark)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--ink)'; }}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    </button>
  );
}

function StoryPage({ id }) {
  const storyData = [
    {
      title: 'Как мы создавали сказку: тематическая съёмка в русских костюмах',
      tag: 'спец-проект',
      date: '03 · 2026',
      read: '6 мин',
      tone: 4,
      teaser: 'Подбирали локацию вдоль Волги, шили сарафан под цвет утреннего света, ловили туман на рассвете.',
      content: (
        <>
          <p>Эта история началась с одной простой мысли — показать классическую русскую красоту без лишней лубочности и сувенирных штампов. Нам хотелось поймать ощущение чистой, дышащей сказки, созвучной с утренними пейзажами Волги.</p>
          <blockquote>
            «Главной задачей было поймать тот самый миг на рассвете, когда туман только поднимается над водой, а первые лучи солнца окрашивают воздух в тёплое золото...»
          </blockquote>
          <h3>Подготовка и костюм</h3>
          <p>Вместо аренды дешёвых карнавальных нарядов мы решили сшить сарафан с нуля. Ткань — плотный домотканый лён приглушенного брусничного цвета. Никаких кричащих красок: только природные текстуры, которые гармонично смотрятся в кадре и отражают мягкий рассветный свет.</p>
          <div style={{ margin: '32px 0' }}>
            <Placeholder caption="подготовка · детали кроя сарафана" idx={2} ratio="16/10" rounded={6} />
          </div>
          <h3>Локация и погода</h3>
          <p>Снимали на рассвете на Самарской Луке. Выезд из города был в 3:30 утра. Когда мы приехали на место, над рекой лежал густой молочный туман. Нам оставалось только дождаться солнца. В течение получаса свет менялся каждую минуту — от глубокого синего до нежно-розового.</p>
          <h3>Результат</h3>
          <p>Эта съёмка стала для всей команды настоящим погружением в тишину. В кадре нет натянутых улыбок или сложного позирования — только естественные движения, прикосновение ветра и чистая эмоция момента.</p>
        </>
      )
    },
    {
      title: 'Домашняя съёмка с двойняшками: что делать, если дети не сидят на месте',
      tag: 'семья',
      date: '01 · 2026',
      read: '4 мин',
      tone: 0,
      teaser: 'Маленький план, много игры и одно правило — не торопить. Что получилось — внутри.',
      content: (
        <>
          <p>Многие родители откладывают фотосессию, потому что боятся «непослушного» поведения детей. Особенно когда это активные двойняшки, готовые разнести комнату за пять минут. Но секрет идеальной съёмки прост — не нужно заставлять их позировать.</p>
          <blockquote>
            «Если дети бегают и прыгают — мы не останавливаем их. Мы прыгаем вместе с ними. Фотография — это жизнь, а не застывшие позы.»
          </blockquote>
          <h3>Забудьте про позирование</h3>
          <p>Мы построили съёмку как череду простых и понятных игр. Сначала мы строили шалаш из пледов, затем устроили шуточную битву подушками, а в конце — пекли печенье на кухне, щедро рассыпая муку. В такие моменты дети полностью забывают про камеру.</p>
          <div style={{ margin: '32px 0' }}>
            <Placeholder caption="игра · мука и улыбки на кухне" idx={0} ratio="16/10" rounded={6} />
          </div>
          <h3>Световые карманы в доме</h3>
          <p>Вам не нужны профессиональные студийные вспышки. Всё, что мы использовали — это мягкий естественный свет от большого окна. Домашняя обстановка даёт детям чувство безопасности, что позволяет им раскрыться на 100%.</p>
          <h3>Памятка родителям</h3>
          <p>Главный совет — выспитесь перед съёмкой и не переживайте за беспорядок в процессе. Всё, что просыпано — уберётся, а вот настоящие, искренние улыбки ваших детей останутся на снимках навсегда.</p>
        </>
      )
    },
    {
      title: 'Деловой портрет для эксперта: как снять «человеческое лицо» бренда',
      tag: 'бизнес',
      date: '11 · 2025',
      read: '5 мин',
      tone: 2,
      teaser: 'Снимали серию для лендинга и соцсетей. Один день, три локации, шесть образов.',
      content: (
        <>
          <p>Время скучных студийных портретов на сером фоне безвозвратно ушло. Сегодня эксперту нужен живой контент, который транслирует не только статус, но и его характер, образ жизни и профессиональные ценности.</p>
          <blockquote>
            «Современный эксперт продает не просто услугу. Он продает ценности, стиль жизни и доверие.»
          </blockquote>
          <h3>Три локации, шесть образов</h3>
          <p>Для этой съёмки мы подобрали три разноплановые локации в Самаре: лаконичную современную кофейню для неформальных кадров с ноутбуком, строгий кабинет для классического портрета и прогулочный маршрут по старой части города для динамичных уличных кадров.</p>
          <div style={{ margin: '32px 0' }}>
            <Placeholder caption="бизнес-портрет · динамика в городе" idx={5} ratio="16/10" rounded={6} />
          </div>
          <h3>Атмосфера на съёмке</h3>
          <p>Мы много общались, пили кофе и обсуждали проект клиента. Это помогло снять зажимы перед камерой. Когда человек увлечен рассказом о любимом деле, его лицо озаряется настоящим профессиональным драйвом — именно эти моменты я и ловлю.</p>
          <h3>Результат</h3>
          <p>В итоге клиент получил разноплановую галерею из 50 готовых снимков, которых хватит для наполнения сайта, соцсетей и публикаций в СМИ на полгода вперед.</p>
        </>
      )
    }
  ];

  const s = storyData[id] || storyData[0];

  return (
    <article style={{ padding: '40px 0 100px', background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <button 
          onClick={() => window.__navigate('home')}
          style={{
            background: 'transparent', border: 0, padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
            marginBottom: 32, fontFamily: 'var(--sans)',
            textTransform: 'uppercase', letterSpacing: '.06em',
          }}
        >
          ← Назад к историям
        </button>

        <div style={{
          fontFamily: 'ui-monospace, monospace', fontSize: 11,
          letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent-dark)',
          marginBottom: 16,
        }}>
          {s.tag} · {s.date} · {s.read}
        </div>

        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 400, lineHeight: 1.08, color: 'var(--ink)',
          margin: '0 0 24px', textWrap: 'balance',
        }}>
          {s.title}
        </h1>

        <p style={{
          fontSize: 19, lineHeight: 1.6, color: 'var(--ink)',
          fontStyle: 'italic', borderLeft: '3px solid var(--accent)',
          paddingLeft: 20, margin: '0 0 40px', opacity: 0.9,
        }}>
          {s.teaser}
        </p>

        <div style={{
          fontSize: 16.5, lineHeight: 1.7, color: 'var(--ink-soft)',
        }} className="story-content">
          <style>{`
            .story-content p { margin: 0 0 24px; }
            .story-content h3 {
              font-family: var(--serif); font-size: 32px; font-weight: 400;
              margin: 48px 0 20px; color: var(--ink);
            }
            .story-content blockquote {
              font-family: var(--serif); font-style: italic; font-size: 22px;
              color: var(--accent-dark); line-height: 1.45;
              border: 0; padding: 28px 36px; margin: 40px 0;
              background: var(--bg-warm); border-radius: 6px;
              text-align: center;
            }
          `}</style>
          {s.content}
        </div>

        <div style={{
          marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(42,37,32,.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button 
            onClick={() => window.__navigate('home')}
            style={{
              padding: '12px 24px', borderRadius: 999,
              background: 'var(--ink)', color: 'var(--bg)', border: 0,
              fontFamily: 'var(--sans)', fontSize: 13.5, cursor: 'pointer',
              fontWeight: 500, transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </article>
  );
}

function formatContactLink(str) {
  if (!str) return 'Не указано';
  const clean = str.trim();

  // Telegram handle check
  if (clean.startsWith('@')) {
    const name = clean.slice(1);
    return <a href={`https://t.me/${name}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dark)', textDecoration: 'underline', fontWeight: 600 }}>{clean} (Telegram)</a>;
  }
  if (clean.toLowerCase().includes('t.me/')) {
    const parts = clean.split('t.me/');
    const name = parts[1].split('/')[0].split(' ')[0];
    return <a href={`https://t.me/${name}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dark)', textDecoration: 'underline', fontWeight: 600 }}>{clean} (Telegram)</a>;
  }
  if (clean.toLowerCase().startsWith('tg:') || clean.toLowerCase().startsWith('telegram:')) {
    const name = clean.replace(/^(tg:|telegram:)\s*/i, '').replace('@', '').trim();
    return <a href={`https://t.me/${name}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dark)', textDecoration: 'underline', fontWeight: 600 }}>{clean} (Telegram)</a>;
  }

  // VK handle check
  if (clean.toLowerCase().includes('vk.com/')) {
    const parts = clean.split('vk.com/');
    const name = parts[1].split('/')[0].split(' ')[0];
    return <a href={`https://vk.com/${name}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dark)', textDecoration: 'underline', fontWeight: 600 }}>{clean} (ВКонтакте)</a>;
  }
  if (clean.toLowerCase().startsWith('vk:') || clean.toLowerCase().startsWith('вконтакте:')) {
    const name = clean.replace(/^(vk:|вконтакте:)\s*/i, '').replace('@', '').trim();
    return <a href={`https://vk.com/${name}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dark)', textDecoration: 'underline', fontWeight: 600 }}>{clean} (ВКонтакте)</a>;
  }

  // Phone number
  if (/^\+?[0-9\s\-()]{7,20}$/.test(clean)) {
    const dial = clean.replace(/[\s\-()]/g, '');
    return <a href={`tel:${dial}`} style={{ color: 'var(--ink)', textDecoration: 'underline', fontWeight: 600 }}>{clean}</a>;
  }

  return <strong style={{ color: 'var(--ink)', wordBreak: 'break-all' }}>{clean}</strong>;
}

function LeadsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('nk_admin_logged') === 'true'
  );
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username.toLowerCase() === 'nadya' && loginForm.password === 'lovephoto') {
      sessionStorage.setItem('nk_admin_logged', 'true');
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Неверное имя пользователя или пароль');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nk_admin_logged');
    setIsAuthenticated(false);
  };

  const [leads, setLeads] = useState([]);

  const loadLeads = () => {
    fetch('/api/leads')
    .then(r => {
      if (!r.ok) throw new Error('API Error');
      return r.json();
    })
    .then(list => {
      setLeads(list);
    })
    .catch(err => {
      console.error('Failed to load leads from server, using localStorage:', err);
      const list = JSON.parse(localStorage.getItem('nk_leads') || '[]');
      setLeads(list);
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const deleteLead = (id) => {
    fetch(`/api/leads/${id}`, { method: 'DELETE' })
    .then(r => {
      if (!r.ok) throw new Error('API Error');
      loadLeads();
    })
    .catch(err => {
      console.error('Failed to delete lead from server, removing locally:', err);
      const updated = leads.filter(x => x.id !== id);
      localStorage.setItem('nk_leads', JSON.stringify(updated));
      setLeads(updated);
    });
  };

  const clearAll = () => {
    if (window.confirm('Вы действительно хотите очистить все поступившие заявки?')) {
      fetch('/api/leads', { method: 'DELETE' })
      .then(r => {
        if (!r.ok) throw new Error('API Error');
        setLeads([]);
      })
      .catch(err => {
        console.error('Failed to clear leads from server, clearing locally:', err);
        localStorage.setItem('nk_leads', JSON.stringify([]));
        setLeads([]);
      });
    }
  };

  const addMockLead = () => {
    const names = ['Константин', 'Александра', 'Дмитрий', 'Елена', 'Иван'];
    const contacts = ['@kos_expert', 'tg: @sasha_photo', '+7 (927) 111-22-33', 'elena@mail.ru', '@ivan_startup'];
    const kinds = ['family', 'portrait', 'reportage', 'wedding'];
    const dates = ['15 июня', 'В конце месяца', 'Ближайшие выходные', '12 июля'];
    const msgs = [
      'Привет! Давно следим за вашим творчеством и очень хотим заказать душевную семейную фотосессию на природе для четырёх человек (мы с мужем и двое детей: мальчик 5 лет и девочка 8 лет). Хотелось бы поймать тёплый золотой свет перед закатом. Из локаций думаем про красивую поляну в лесу или берег Волги. Ждём вашего ответа!',
      'Здравствуйте, Надежда! Мне нужен стильный деловой портрет для личного бренда (я занимаюсь консалтингом в сфере IT). Хочется получить живые и человечные фотографии, транслирующие уверенность и доверие. Планируем 2-3 образа: часть кадров снимем в минималистичной кофейне с ноутбуком, а часть — в светлой интерьерной студии с нейтральным фоном. Спасибо!',
      'Добрый день! Планируем заказать репортажную съемку детского праздника в саду (выпускной группы). Будет около 18-20 детей, они будут активно играть, участвовать в квесте и танцевать. Нужна съемка примерно на 2-3 часа, чтобы поймать живые эмоции детей в движении, общие кадры с воспитателями и групповой портрет в конце праздника.',
      'Надежда, привет! У нас планируется очень камерная свадьба (только мы вдвоем). Хотим провести регистрацию в красивом ЗАГСе Самары, а затем устроить небольшую непринужденную прогулку по старым улочкам и набережной. Хочется легкой, живой и искренней репортажной съемки без скучного натянутого позирования. Свободны ли вы на указанную дату?'
    ];

    const idx = Math.floor(Math.random() * names.length);
    const mock = {
      name: names[idx],
      contact: contacts[idx],
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      when: dates[Math.floor(Math.random() * dates.length)],
      msg: msgs[Math.floor(Math.random() * msgs.length)],
      date: new Date().toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mock)
    })
    .then(r => {
      if (!r.ok) throw new Error('API Error');
      loadLeads();
    })
    .catch(err => {
      console.error('Failed to post mock lead, using local storage fallback:', err);
      const mockWithId = { ...mock, id: Date.now() };
      const updated = [mockWithId, ...leads];
      localStorage.setItem('nk_leads', JSON.stringify(updated));
      setLeads(updated);
    });
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `nk_leads_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const getCatLabel = (id) => {
    const m = {
      family: 'Семья и дети',
      portrait: 'Портрет и бизнес',
      reportage: 'Репортаж',
      wedding: 'Свадьба'
    };
    return m[id] || id;
  };

  if (!isAuthenticated) {
    return (
      <section style={{ padding: '80px 0 120px', background: 'var(--bg)', minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: 440 }}>
          <div style={{
            background: 'var(--bg-warm)',
            border: '1px solid rgba(42,37,32,.1)',
            borderRadius: 12, padding: '40px 36px',
            boxShadow: '0 24px 60px -28px rgba(60,40,20,.15)',
            textAlign: 'center',
          }}>
            <span aria-hidden style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#1A140C', fontFamily: 'var(--serif)', fontSize: 24, fontStyle: 'italic',
              fontWeight: 600, margin: '0 auto 16px',
            }}>N</span>
            
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--ink)', margin: '0 0 8px' }}>
              Вход для автора
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 28px', fontFamily: 'var(--sans)' }}>
              Доступ к управлению заявками и статистике сайта
            </p>

            <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: 18 }}>
                <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8, fontFamily: 'ui-monospace, monospace' }}>Имя пользователя</span>
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  placeholder="Например, nadya" 
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 6,
                    background: '#FBF7EF', border: '1px solid rgba(42,37,32,.18)',
                    color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 14.5, outline: 'none',
                  }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 20 }}>
                <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8, fontFamily: 'ui-monospace, monospace' }}>Пароль</span>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="••••••••" 
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 6,
                    background: '#FBF7EF', border: '1px solid rgba(42,37,32,.18)',
                    color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 14.5, outline: 'none',
                  }}
                />
              </label>

              {loginError && (
                <div style={{
                  background: 'rgba(177,74,45,.06)', border: '1px solid rgba(177,74,45,.2)',
                  color: '#B14A2D', padding: '10px 14px', borderRadius: 6,
                  fontSize: 13, marginBottom: 20, fontFamily: 'var(--sans)',
                }}>
                  {loginError}
                </div>
              )}

              <button type="submit" style={{
                width: '100%', padding: '14px 24px', background: 'var(--ink)',
                color: 'var(--bg)', border: 0, borderRadius: 999,
                fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 500,
                cursor: 'pointer', transition: 'all .18s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Войти в панель →
              </button>
            </form>
            
            <div style={{
              marginTop: 24, fontSize: 11.5, color: 'var(--muted)',
              fontFamily: 'ui-monospace, monospace', padding: '10px',
              borderTop: '1px solid rgba(42,37,32,.06)',
            }}>
              тест-логин: <span style={{ color: 'var(--accent-dark)' }}>nadya</span> / пароль: <span style={{ color: 'var(--accent-dark)' }}>lovephoto</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '40px 0 100px', background: 'var(--bg)' }}>
      <div className="container">
        <button 
          onClick={() => window.__navigate('home')}
          style={{
            background: 'transparent', border: 0, padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
            marginBottom: 32, fontFamily: 'var(--sans)',
            textTransform: 'uppercase', letterSpacing: '.06em',
          }}
        >
          ← На главную
        </button>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          gap: 24, flexWrap: 'wrap', marginBottom: 40,
          borderBottom: '1px solid rgba(42,37,32,.12)', paddingBottom: 24,
        }}>
          <div>
            <div style={{
              fontFamily: 'ui-monospace, monospace', fontSize: 11,
              letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent-dark)',
              marginBottom: 8,
            }}>
              Панель администратора
            </div>
            <SerifH size={48}>Поступившие заявки</SerifH>
          </div>
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button 
              onClick={addMockLead}
              style={dashBtn(false, true)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,165,116,.18)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212,165,116,.08)'}
            >
              ⚡ Симулировать заявку
            </button>
            {leads.length > 0 && (
              <>
                <button onClick={exportJSON} style={dashBtn(false)}>Экспорт в JSON</button>
                <button onClick={clearAll} style={dashBtn(true)}>Очистить всё</button>
              </>
            )}
            <button onClick={handleLogout} style={dashBtn(true)}>Выйти</button>
          </div>
        </div>

        {leads.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40,
          }} className="stats-grid">
            <style>{`
              @media (max-width: 768px) {
                .stats-grid { grid-template-columns: 1fr 1fr !important; }
              }
            `}</style>
            {[
              ['Всего заявок', leads.length],
              ['Семья и дети', leads.filter(x => x.kind === 'family').length],
              ['Портрет и бизнес', leads.filter(x => x.kind === 'portrait').length],
              ['Остальное', leads.filter(x => x.kind !== 'family' && x.kind !== 'portrait').length],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{
                background: 'var(--bg-warm)', padding: '16px 20px', borderRadius: 8,
                border: '1px solid rgba(42,37,32,.06)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.02em' }}>{lbl}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)', marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {leads.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px', background: 'var(--bg-warm)',
            borderRadius: 12, border: '1px dashed rgba(42,37,32,.2)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📩</div>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0, color: 'var(--ink)' }}>
              Заявок пока нет
            </h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginTop: 8, maxWidth: 360, margin: '8px auto 24px' }}>
              Когда клиенты заполнят форму обратной связи на вашем сайте, новые заявки мгновенно отобразятся здесь.
            </p>
            <button onClick={addMockLead} style={{
              padding: '12px 22px', borderRadius: 999, background: 'var(--accent)',
              color: '#1A140C', border: 0, fontFamily: 'var(--sans)', fontSize: 13.5,
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Создать тестовую заявку
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="leads-grid">
            <style>{`
              @media (max-width: 768px) {
                .leads-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
            {leads.map((l) => (
              <div 
                key={l.id} 
                style={{
                  background: 'var(--bg-warm)', borderRadius: 10, padding: 28,
                  border: '1px solid rgba(42,37,32,.08)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,.02)',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: 0, color: 'var(--ink)' }}>
                        {l.name}
                      </h4>
                      <div style={{
                        display: 'inline-block', background: 'var(--accent-dark)', color: '#fff',
                        fontSize: 10.5, padding: '2px 8px', borderRadius: 4, marginTop: 6,
                        fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase',
                        letterSpacing: '.06em',
                      }}>
                        {getCatLabel(l.kind)}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteLead(l.id)}
                      title="Удалить заявку"
                      style={{
                        background: 'transparent', border: 0, color: 'rgba(42,37,32,.4)',
                        cursor: 'pointer', fontSize: 18, padding: 4, transition: 'color .18s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#B14A2D'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(42,37,32,.4)'}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{
                    marginTop: 20, borderTop: '1px solid rgba(42,37,32,.06)', paddingTop: 16,
                    display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px 12px',
                    fontSize: 13.5, color: 'var(--ink-soft)',
                  }}>
                    <span style={{ color: 'var(--muted)', fontSize: 11.5, letterSpacing: '.02em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Связь:</span>
                    <strong style={{ color: 'var(--ink)', wordBreak: 'break-all' }}>{formatContactLink(l.contact)}</strong>

                    <span style={{ color: 'var(--muted)', fontSize: 11.5, letterSpacing: '.02em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Когда:</span>
                    <span style={{ color: 'var(--ink)' }}>{l.when || 'Не указано'}</span>
                  </div>

                  {l.msg && (
                    <div style={{
                      marginTop: 16, background: 'rgba(255,250,240,.4)', padding: '14px 18px',
                      borderRadius: 6, border: '1px solid rgba(42,37,32,.04)',
                      fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)',
                      fontFamily: 'var(--serif)', fontStyle: 'italic',
                    }}>
                      "{l.msg}"
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: 20, fontSize: 11, color: 'var(--muted)',
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: 'ui-monospace, monospace', borderTop: '1px solid rgba(42,37,32,.06)',
                  paddingTop: 12,
                }}>
                  <span>ID: {l.id}</span>
                  <span>{l.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function dashBtn(danger, highlight = false) {
  return {
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid ' + (danger ? '#B14A2D' : highlight ? 'var(--accent)' : 'rgba(42,37,32,.18)'),
    background: highlight ? 'rgba(212,165,116,.08)' : 'transparent',
    color: danger ? '#B14A2D' : 'var(--ink)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'var(--sans)',
    fontWeight: 500,
    transition: 'all .18s ease',
  };
}

Object.assign(window, {
  Nav, Hero, About, Portfolio, Process, Trust, Stories, Contact, Footer, BackToTop, StoryPage, LeadsDashboard,
});
