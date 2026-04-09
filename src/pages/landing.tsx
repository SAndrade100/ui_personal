import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Dumbbell, Calendar, Activity, Flame, Heart, User } from 'lucide-react';

export default function Landing() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --color-linen: #F5F1EA;
          --color-khaki: #D7C9B8;
          --color-camel: #B2967D;
          --color-cocoa: #7D5A44;
          --color-espresso: #4A342A;
          --color-accent: #E86C2C;
          --color-hero-from: #2E1D16;
          --color-hero-to: #6B4A37;
          --font-heading: 'Playfair Display', Georgia, serif;
          --font-body: 'Inter', system-ui, sans-serif;
          --radius-btn: 999px;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font-body);
          background: var(--color-linen);
          color: var(--color-espresso);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 1.2rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(46,29,22,0.92);
          backdrop-filter: blur(12px);
          padding: 0.8rem 2rem;
          box-shadow: 0 2px 24px rgba(0,0,0,0.3);
        }
        .nav-logo {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-linen);
          letter-spacing: -0.02em;
        }
        .nav-logo span { color: var(--color-accent); }
        .nav-cta {
          background: var(--color-accent);
          color: white;
          border: none;
          padding: 0.55rem 1.4rem;
          border-radius: var(--radius-btn);
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: all 0.18s ease;
        }
        .nav-cta:hover {
          background: #d15a1e;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(232,108,44,0.4);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%);
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,108,44,0.15) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 8rem 2rem 4rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(232,108,44,0.15);
          border: 1px solid rgba(232,108,44,0.3);
          color: var(--color-accent);
          padding: 0.35rem 0.9rem;
          border-radius: var(--radius-btn);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s ease both;
        }
        .hero-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        .hero-title {
          font-family: var(--font-heading);
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 900;
          color: var(--color-linen);
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero-title em {
          font-style: italic;
          color: var(--color-camel);
        }
        .hero-sub {
          color: rgba(245,241,234,0.65);
          font-size: 1.05rem;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .btn-primary {
          background: var(--color-accent);
          color: white;
          border: none;
          padding: 0.9rem 2rem;
          border-radius: var(--radius-btn);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          letter-spacing: 0.02em;
        }
        .btn-primary:hover {
          background: #d15a1e;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(232,108,44,0.45);
        }
        .btn-secondary {
          background: transparent;
          color: var(--color-linen);
          border: 1.5px solid rgba(245,241,234,0.25);
          padding: 0.9rem 2rem;
          border-radius: var(--radius-btn);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-secondary:hover {
          border-color: rgba(245,241,234,0.6);
          background: rgba(245,241,234,0.07);
        }
        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(245,241,234,0.1);
          animation: fadeUp 0.7s 0.4s ease both;
        }
        .stat-num {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-linen);
        }
        .stat-num span { color: var(--color-accent); }
        .stat-label {
          font-size: 0.78rem;
          color: rgba(245,241,234,0.5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 0.1rem;
        }

        /* Hero visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeUp 0.9s 0.3s ease both;
        }
        .hero-card {
          background: rgba(245,241,234,0.06);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(245,241,234,0.12);
          border-radius: 24px;
          padding: 2rem;
          width: 100%;
          max-width: 360px;
        }
        .program-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .badge-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .badge-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-linen);
        }
        .badge-sub { font-size: 0.75rem; color: rgba(245,241,234,0.5); }
        .progress-block { margin-bottom: 1rem; }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: rgba(245,241,234,0.65);
          margin-bottom: 0.4rem;
        }
        .progress-bar {
          height: 6px;
          background: rgba(245,241,234,0.1);
          border-radius: 99px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--color-camel), var(--color-accent));
          animation: grow 1.2s 0.8s ease both;
          transform-origin: left;
        }
        @keyframes grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .next-session {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(245,241,234,0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .session-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(232,108,44,0.15);
          border: 1px solid rgba(232,108,44,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
        }
        .session-label { font-size: 0.72rem; color: rgba(245,241,234,0.45); text-transform: uppercase; letter-spacing: 0.06em; }
        .session-time { font-size: 0.9rem; color: var(--color-linen); font-weight: 500; margin-top: 0.1rem; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* SECTION BASE */
        section { padding: 5rem 2rem; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-tag {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 0.75rem;
        }
        .section-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 700;
          color: var(--color-espresso);
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .section-sub {
          color: var(--color-cocoa);
          font-size: 1rem;
          line-height: 1.7;
          font-weight: 300;
          max-width: 520px;
        }

        /* ABOUT */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .about-image {
          position: relative;
        }
        .about-img-box {
          background: linear-gradient(135deg, var(--color-espresso), var(--color-cocoa));
          border-radius: 20px;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          position: relative;
          overflow: hidden;
        }
        .about-img-box::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(74,52,42,0.6), transparent);
        }
        .about-float {
          position: absolute;
          bottom: -1.5rem;
          right: -1.5rem;
          background: var(--color-accent);
          color: white;
          padding: 1rem 1.4rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(232,108,44,0.4);
        }
        .float-num {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1;
        }
        .float-label { font-size: 0.72rem; opacity: 0.85; margin-top: 0.2rem; }
        .cert-list {
          list-style: none;
          margin-top: 2rem;
        }
        .cert-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-khaki);
          font-size: 0.9rem;
          color: var(--color-cocoa);
        }
        .cert-list li:last-child { border-bottom: none; }
        .cert-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
        }

        /* PROGRAMS */
        .programs-bg {
          background: linear-gradient(135deg, var(--color-hero-from) 0%, var(--color-hero-to) 100%);
        }
        .programs-bg .section-title { color: var(--color-linen); }
        .programs-bg .section-sub { color: rgba(245,241,234,0.6); }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 3rem;
        }
        .prog-card {
          background: rgba(245,241,234,0.05);
          border: 1px solid rgba(245,241,234,0.1);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.2s ease;
          cursor: default;
        }
        .prog-card:hover {
          background: rgba(245,241,234,0.09);
          border-color: rgba(232,108,44,0.35);
          transform: translateY(-4px);
        }
        .prog-card.featured {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
        .prog-card.featured:hover { filter: brightness(1.08); }
        .prog-emoji { font-size: 2rem; margin-bottom: 1.2rem; }
        .prog-name {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--color-linen);
          margin-bottom: 0.5rem;
        }
        .prog-desc {
          font-size: 0.85rem;
          color: rgba(245,241,234,0.55);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .prog-card.featured .prog-desc { color: rgba(255,255,255,0.75); }
        .prog-detail {
          font-size: 0.78rem;
          color: rgba(245,241,234,0.4);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .prog-card.featured .prog-detail { color: rgba(255,255,255,0.6); }

        /* TESTIMONIALS */
        .testi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 3rem;
        }
        .testi-card {
          background: white;
          border: 1px solid var(--color-khaki);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(74,52,42,0.07);
          transition: transform 0.2s ease;
        }
        .testi-card:hover { transform: translateY(-3px); }
        .testi-stars { color: var(--color-accent); margin-bottom: 1rem; font-size: 0.9rem; }
        .testi-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-cocoa);
          font-style: italic;
          margin-bottom: 1.5rem;
        }
        .testi-author { display: flex; align-items: center; gap: 0.75rem; }
        .author-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-camel), var(--color-cocoa));
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
        }
        .author-name { font-weight: 600; font-size: 0.88rem; color: var(--color-espresso); }
        .author-info { font-size: 0.75rem; color: var(--color-camel); }

        /* CTA SECTION */
        .cta-section {
          text-align: center;
          background: var(--color-linen);
        }
        .cta-box {
          max-width: 680px;
          margin: 0 auto;
          background: linear-gradient(135deg, var(--color-espresso), var(--color-cocoa));
          border-radius: 28px;
          padding: 4rem 3rem;
          position: relative;
          overflow: hidden;
        }
        .cta-box::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(232,108,44,0.12);
        }
        .cta-title {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--color-linen);
          margin-bottom: 1rem;
          position: relative;
        }
        .cta-sub {
          color: rgba(245,241,234,0.6);
          margin-bottom: 2rem;
          font-size: 0.95rem;
          line-height: 1.6;
          position: relative;
        }
        .cta-btn {
          background: var(--color-accent);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: var(--radius-btn);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }
        .cta-btn:hover {
          background: #d15a1e;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(232,108,44,0.5);
        }
        .cta-already {
          margin-top: 1.2rem;
          font-size: 0.82rem;
          color: rgba(245,241,234,0.4);
          position: relative;
        }
        .cta-already button {
          background: none;
          border: none;
          color: rgba(245,241,234,0.65);
          font-size: inherit;
          text-decoration: underline;
          cursor: pointer;
        }

        /* FOOTER */
        footer {
          background: var(--color-espresso);
          color: rgba(245,241,234,0.5);
          text-align: center;
          padding: 2rem;
          font-size: 0.82rem;
        }
        footer strong { color: var(--color-linen); }

        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; gap: 2rem; padding-top: 7rem; }
          .hero-visual { display: none; }
          .about-grid { grid-template-columns: 1fr; }
          .cards-grid { grid-template-columns: 1fr; }
          .testi-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 1.2rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-logo">Forge<span>PT</span></div>
        <button className="nav-cta" onClick={() => router.push('/login')}>
          Área do Aluno
        </button>
      </nav>

      {/* HERO */}
      <div className="hero" ref={heroRef}>
        <div className="hero-glow" />
        <div className="hero-inner">
          <div>
            <div className="hero-tag">Personal Trainer Certificado</div>
            <h1 className="hero-title">
              Transforme seu corpo.<br />
              <em>Supere seus limites.</em>
            </h1>
            <p className="hero-sub">
              Treinos personalizados, acompanhamento contínuo e resultados reais. 
              Não é só academia — é uma jornada construída para você.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => router.push('/login')}>
                Começar agora →
              </button>
              <button className="btn-secondary" onClick={() => {
                document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Ver programas
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="stat-num">8<span>+</span></div>
                <div className="stat-label">Anos de experiência</div>
              </div>
              <div>
                <div className="stat-num">200<span>+</span></div>
                <div className="stat-label">Alunos transformados</div>
              </div>
              <div>
                <div className="stat-num">98<span>%</span></div>
                <div className="stat-label">Satisfação</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="program-badge">
                <div className="badge-icon"><Dumbbell size={22} /></div>
                <div>
                  <div className="badge-title">Programa Ativo</div>
                  <div className="badge-sub">Hipertrofia — Semana 6/12</div>
                </div>
              </div>
              <div className="progress-block">
                <div className="progress-label">
                  <span>Progresso geral</span>
                  <span style={{ color: 'var(--color-accent)' }}>68%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '68%' }} />
                </div>
              </div>
              <div className="progress-block">
                <div className="progress-label">
                  <span>Treinos concluídos</span>
                  <span>18/26</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '69%' }} />
                </div>
              </div>
              <div className="next-session">
                <div className="session-icon"><Calendar size={20} /></div>
                <div>
                  <div className="session-label">Próxima sessão</div>
                  <div className="session-time">Hoje, 18h — Treino B (Costas)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section>
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-image">
              <div className="about-img-box"><Activity size={48} /></div>
              <div className="about-float">
                <div className="float-num">8+</div>
                <div className="float-label">Anos de<br />experiência</div>
              </div>
            </div>
            <div>
              <div className="section-tag">Sobre o Personal</div>
              <h2 className="section-title">Treinamento que respeita seu tempo e seu ritmo</h2>
              <p className="section-sub">
                Com metodologia baseada em evidências e foco total na sua evolução individual, 
                cada treino é pensado para o seu corpo, sua rotina e seus objetivos.
              </p>
              <ul className="cert-list">
                <li><span className="cert-dot" />CREF — Conselho Regional de Educação Física</li>
                <li><span className="cert-dot" />Especialização em Musculação e Hipertrofia</li>
                <li><span className="cert-dot" />Certificação Internacional em Nutrição Esportiva</li>
                <li><span className="cert-dot" />Formação em Corrida e Condicionamento Aeróbico</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="programs-bg">
        <div className="section-inner">
          <div className="section-tag" style={{ color: 'var(--color-camel)' }}>Metodologia</div>
          <h2 className="section-title">Programas feitos pra você evoluir</h2>
          <p className="section-sub">Seja qual for seu objetivo, existe um programa desenhado para chegar lá.</p>
          <div className="cards-grid">
            {[
              { Icon: Dumbbell, name: 'Hipertrofia', desc: 'Ganho de massa muscular com progressão de carga inteligente e periodização avançada.', detail: '3–5× por semana · 60–75 min' },
              { Icon: Flame, name: 'Emagrecimento', desc: 'Déficit calórico controlado, treinos HIIT e acompanhamento nutricional integrado.', detail: '4× por semana · 50 min', featured: true },
              { Icon: Heart, name: 'Saúde & Qualidade de Vida', desc: 'Mobilidade, força funcional e bem-estar para quem quer se mover melhor no dia a dia.', detail: '2–3× por semana · 45 min' },
            ].map((p, i) => (
              <div key={i} className={`prog-card${p.featured ? ' featured' : ''}`}>
                <div className="prog-emoji"><p.Icon size={28} /></div>
                <div className="prog-name">{p.name}</div>
                <div className="prog-desc">{p.desc}</div>
                <div className="prog-detail"><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{p.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="section-inner">
          <div className="section-tag">Resultados reais</div>
          <h2 className="section-title">O que os alunos dizem</h2>
          <div className="testi-grid">
            {[
              { text: 'Em 4 meses perdi 12kg e ganhei uma disposição que não tinha há anos. O acompanhamento pelo app fez toda a diferença.', name: 'Camila R.', info: 'Programa Emagrecimento · 4 meses' },
              { text: 'Nunca consegui manter constância em academia. Com os treinos personalizados e o suporte, nunca faltei uma semana.', name: 'Rafael M.', info: 'Hipertrofia · 6 meses' },
              { text: 'Voltei a correr sem dor no joelho depois de anos. A abordagem funcional mudou minha relação com o exercício.', name: 'Ana L.', info: 'Saúde & Qualidade · 3 meses' },
              { text: 'Os treinos são desafiadores, mas sempre dentro do possível. Sinto evolução real a cada semana.', name: 'Lucas T.', info: 'Hipertrofia · 5 meses' },
            ].map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testi-author">
                  <div className="author-avatar"><User size={20} color="white" /></div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-info">{t.info}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-inner">
          <div className="cta-box">
            <h2 className="cta-title">Pronto para começar?</h2>
            <p className="cta-sub">
              Crie sua conta, responda a avaliação inicial e receba seu programa 
              personalizado em até 24 horas.
            </p>
            <button className="cta-btn" onClick={() => router.push('/login')}>
              Criar conta grátis
            </button>
            <p className="cta-already">
              Já tem conta?{' '}
              <button onClick={() => router.push('/login')}>Fazer login</button>
            </p>
          </div>
        </div>
      </section>

      <footer>
        <p>© {new Date().getFullYear()} <strong>ForgePT</strong> · Todos os direitos reservados</p>
      </footer>
    </>
  );
}