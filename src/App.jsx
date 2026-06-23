import React, { useState, useMemo } from "react";

import {
  Search,
  Phone,
  ArrowLeft,
  Plus,
  GraduationCap,
  Check,
  Sparkles,
  Trash2,
} from "lucide-react";
/* ----------------------------------------------------------------
   EmprendeUTB — Vitrina de Emprendimientos
   UNIVERSIDAD TÉCNICA DE BABAHOYO
   Facultad de Administración, Finanzas e Informática · UNIVERSIDAD TÉCNICA DE BABAHOYO
   ---------------------------------------------------------------- */

const CATEGORIES = [
  "Alimentos",
  "Tecnología",
  "Moda y Accesorios",
  "Servicios",
  "Artesanías",
];

const TIKTOK_ICON = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}>
    <path d="M16.6 5.82a4.28 4.28 0 0 1-2.7-1.13V14.7a4.85 4.85 0 1 1-4.16-4.8v2.18a2.7 2.7 0 1 0 1.89 2.58V2h2.27a4.28 4.28 0 0 0 4.28 4.27v2.27a4.28 4.28 0 0 1-1.58-.72Z" />
  </svg>
);

const FACEBOOK_ICON = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
    {...props}
  >
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

const seedVentures = [
  {
    id: "v1",
    name: "Sabores Babahoyo",
    owner: "María José Vera",
    career: "Administración de Empresas · 5to semestre",
    category: "Alimentos",
    color: "#00A859", // Verde UTB para este emprendimiento
    description:
      "Comida casera y postres a domicilio, hechos con productos de la zona. Pedidos para reuniones, eventos y cumpleaños dentro del campus.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    phone: "0991234567",
    instagram: "saboresbabahoyo",
    facebook: "SaboresBabahoyo",
    tiktok: "",
    featured: true,
    products: [
      { id: "p1", name: "Cazuela de mariscos", price: 6.5, desc: "Porción individual, lista para llevar.", image: "https://images.unsplash.com/photo-1626508035297-0f8c75a712c2?w=600&q=80" },
      { id: "p2", name: "Tres leches", price: 2.0, desc: "Porción de pastel tres leches casero.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80" },
    ],
  },
  {
    id: "v2",
    name: "TechSoluciones UTB",
    owner: "Carlos Andrade",
    career: "Ingeniería en Sistemas · 7mo semestre",
    category: "Tecnología",
    color: "#0056B3", // Azul UTB para este emprendimiento
    description:
      "Mantenimiento de computadoras, instalación de software, diseño de páginas web y asesoría en Excel para pequeños negocios.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    phone: "0987654321",
    instagram: "techsolucionesutb",
    facebook: "",
    tiktok: "techsolucionesutb",
    featured: true,
    products: [
      { id: "p3", name: "Página web básica", price: 80, desc: "Sitio de 1 a 3 secciones, listo en 5 días.", image: "https://images.unsplash.com/photo-1547658719971-680eafb3e524?w=600&q=80" },
      { id: "p4", name: "Formateo + soporte", price: 15, desc: "Limpieza de virus, instalación de programas.", image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600&q=80" },
    ],
  },
];

const emptyProduct = () => ({ id: `tmp-${Math.random().toString(36).slice(2)}`, name: "", price: "", desc: "", image: "" });
const emptyForm = () => ({
  name: "", owner: "", career: "", category: CATEGORIES[0], color: "#00A859",
  description: "", image: "", phone: "", instagram: "", facebook: "", tiktok: "",
  products: [emptyProduct()],
});

function RiverDivider() {
  return (
    <div className="river-divider" aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" width="100%" height="40">
        <defs>
          <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00A859" />
            <stop offset="100%" stopColor="#0056B3" />
          </linearGradient>
        </defs>
        <path d="M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20" fill="none" stroke="url(#riverGrad)" strokeWidth="2.5" strokeLinecap="round" className="river-path" />
      </svg>
    </div>
  );
}

function Pill({ active, children, ...props }) {
  return (
    <button className={`pill ${active ? "pill-active" : ""}`} {...props}>
      {children}
    </button>
  );
}

function VentureCard({ v, onOpen, big }) {
  return (
    <button 
      onClick={() => onOpen(v.id)} 
      className={`venture-card ${big ? "venture-card-big" : ""}`} 
      style={{ "--accent": v.color }}
    >
      <div className="venture-card-image" style={{ backgroundImage: `url(${v.image})` }} />
      <div className="venture-card-body">
        <span className="eyebrow" style={{ color: v.color }}>{v.category}</span>
        <h3>{v.name}</h3>
        <p className="muted">{v.owner}</p>
      </div>
      <div className="venture-card-glow" style={{ background: v.color }} />
    </button>
  );
}

function DetailView({ venture, onBack }) {
  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Volver a la vitrina
      </button>

      <div className="detail-banner" style={{ background: `linear-gradient(135deg, ${venture.color}33, transparent)` }}>
        <img src={venture.image} alt={venture.name} className="detail-banner-img" />
        <div className="detail-banner-overlay" />
        <div className="detail-banner-content">
          <span className="eyebrow" style={{ color: venture.color }}>{venture.category}</span>
          <h1>{venture.name}</h1>
          <p className="muted">{venture.owner} · {venture.career}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <h2>Sobre el emprendimiento</h2>
          <p className="body-text">{venture.description}</p>

          <h2>Productos</h2>
          <div className="products-grid">
            {venture.products.map((p) => (
              <div key={p.id} className="product-card">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="product-card-img" />
                ) : (
                  <div className="product-card-img product-card-placeholder" style={{ background: venture.color + "22" }}>
                    <Sparkles size={20} style={{ color: venture.color }} />
                  </div>
                )}
                <div className="product-card-body">
                  <div className="product-card-row">
                    <h4>{p.name}</h4>
                    <span className="price" style={{ color: venture.color }}>${Number(p.price).toFixed(2)}</span>
                  </div>
                  <p className="muted small">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="contact-card" style={{ "--accent": venture.color }}>
          <h3>Contactar al vendedor</h3>
          <a className="contact-row" href={`https://wa.me/593${venture.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer">
            <Phone size={16} /> {venture.phone}
          </a>
          {venture.instagram && (
            <a className="contact-row" href={`https://instagram.com/${venture.instagram}`} target="_blank" rel="noreferrer">
              <span>Instagram</span>
            </a>
          )}
          {venture.facebook && (
            <a className="contact-row" href={`https://facebook.com/${venture.facebook}`} target="_blank" rel="noreferrer">
              <FACEBOOK_ICON /> {venture.facebook}
            </a>
          )}
          {venture.tiktok && (
            <a className="contact-row" href={`https://tiktok.com/@${venture.tiktok}`} target="_blank" rel="noreferrer">
              <TIKTOK_ICON /> @{venture.tiktok}
            </a>
          )}
          <a className="cta-btn cta-solid full" style={{ background: venture.color, color: "#FFFFFF" }} href={`https://wa.me/593${venture.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer">
            Escribir por WhatsApp
          </a>
        </aside>
      </div>
    </div>
  );
}

function RegisterView({ onCancel, onSubmit }) {
  const [form, setForm] = useState(emptyForm());
  const [done, setDone] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateProduct = (id, field, value) =>
    setForm((f) => ({ ...f, products: f.products.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));

  const addProduct = () => setForm((f) => ({ ...f, products: [...f.products, emptyProduct()] }));
  const removeProduct = (id) => setForm((f) => ({ ...f, products: f.products.filter((p) => p.id !== id) }));

  const canSubmit = form.name.trim() && form.owner.trim() && form.phone.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      ...form,
      id: `v-${Date.now()}`,
      image: form.image || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      products: form.products
        .filter((p) => p.name.trim())
        .map((p) => ({ ...p, price: Number(p.price) || 0 })),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="success-state">
        <div className="success-icon"><Check size={28} /></div>
        <h2>¡Emprendimiento registrado!</h2>
        <p className="muted">{form.name} ya aparece en la vitrina principal.</p>
        <button className="cta-btn cta-solid" onClick={onCancel}>Ver la vitrina</button>
      </div>
    );
  }

  return (
    <form className="form-view" onSubmit={handleSubmit}>
      <button type="button" className="back-btn" onClick={onCancel}>
        <ArrowLeft size={16} /> Cancelar
      </button>
      <h1>Registrar mi emprendimiento</h1>
      <p className="muted">Completa tus datos y los de tu negocio. Podrás editarlos después.</p>

      <div className="form-section">
        <h3>Datos del emprendimiento</h3>
        <div className="form-row two">
          <label>
            Nombre del emprendimiento *
            <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej. Sabores Babahoyo" required />
          </label>
          <label>
            Categoría
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label>
          Descripción
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="¿Qué ofreces y qué te hace diferente?" />
        </label>
        <div className="form-row two">
          <label>
            URL de foto / logo
            <input value={form.image} onChange={(e) => update("image", e.target.value)} placeholder="https://..." />
          </label>
          <label>
            Color de marca institucional recomendado
            <div className="color-row">
              <input type="color" value={form.color} onChange={(e) => update("color", e.target.value)} />
              <span className="muted small">{form.color}</span>
            </div>
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Datos del vendedor</h3>
        <div className="form-row two">
          <label>
            Nombre del propietario *
            <input value={form.owner} onChange={(e) => update("owner", e.target.value)} required />
          </label>
          <label>
            Carrera / semestre
            <input value={form.career} onChange={(e) => update("career", e.target.value)} placeholder="Ej. Computación · 4to semestre" />
          </label>
        </div>
        <div className="form-row two">
          <label>
            Teléfono / WhatsApp *
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="09XXXXXXXX" required />
          </label>
          <label>
            Instagram (usuario)
            <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="sin @" />
          </label>
        </div>
        <div className="form-row two">
          <label>
            Facebook (usuario o página)
            <input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
          </label>
          <label>
            TikTok (usuario)
            <input value={form.tiktok} onChange={(e) => update("tiktok", e.target.value)} placeholder="sin @" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3>Productos / Servicios</h3>
          <button type="button" className="cta-btn cta-ghost small" onClick={addProduct}>
            <Plus size={14} /> Añadir producto
          </button>
        </div>
        {form.products.map((p, i) => (
          <div className="product-form-row" key={p.id}>
            <input placeholder="Nombre del producto" value={p.name} onChange={(e) => updateProduct(p.id, "name", e.target.value)} />
            <input placeholder="Precio" type="number" min="0" step="0.01" value={p.price} onChange={(e) => updateProduct(p.id, "price", e.target.value)} />
            <input placeholder="URL de foto" value={p.image} onChange={(e) => updateProduct(p.id, "image", e.target.value)} />
            <input placeholder="Descripción corta" value={p.desc} onChange={(e) => updateProduct(p.id, "desc", e.target.value)} />
            {form.products.length > 1 && (
              <button type="button" className="icon-btn" onClick={() => removeProduct(p.id)} aria-label="Eliminar producto">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="cta-btn cta-solid full" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
        Publicar emprendimiento
      </button>
    </form>
  );
}

export default function App() {
  const [ventures, setVentures] = useState(seedVentures);
  const [view, setView] = useState("home"); 
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filtered = useMemo(() => {
    return ventures.filter((v) => {
      const matchesCategory = activeCategory === "Todas" || v.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.products.some((p) => p.name.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [ventures, query, activeCategory]);

  const selected = ventures.find((v) => v.id === selectedId);

  const openDetail = (id) => { setSelectedId(id); setView("detail"); };
  const goHome = () => setView("home");
  const goRegister = () => setView("register");
  
  const handleNewVenture = (v) => {
    setVentures((vs) => [v, ...vs]);
    setView("home");
  };

  return (
    <div className="app-root">
      <style>{`
        :root {
  --utb-green: #0D472B;       /* Verde Pino Oscuro (El del botón Ingresar de la foto) */
  --utb-blue: #8C9F2A;        /* Verde Oliva Claro (El de las barras horizontales de la foto) */
  --ink: #F4F6F4;             /* Fondo Claro Grisáceo muy suave para la página */
  --ink-elevated: #FFFFFF;    /* Tarjetas blancas y limpias (Como el recuadro de inicio de sesión) */
  --glass-border: rgba(13, 71, 43, 0.12); /* Bordes sutiles en tono verde */
  --text: #1E293B;            /* Texto oscuro para que contraste perfectamente en el fondo claro */
  --muted: #64748B;           /* Texto secundario gris suavizado */
}
        * { box-sizing: border-box; }
        .app-root {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          background: var(--ink);
          color: var(--text);
          min-height: 100vh;
          padding-bottom: 4rem;
        }
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        h1, h2, h3, h4 { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; margin: 0; letter-spacing: -0.01em; }
        p { margin: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        input, select, textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.6rem 0.75rem;
          color: var(--text);
          font-family: inherit;
          font-size: 0.9rem;
          width: 100%;
          outline: none;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--utb-green); }

        .muted { color: var(--muted); }
        .small { font-size: 0.8rem; }
        .body-text { color: #E2E8F0; line-height: 1.6; max-width: 60ch; }
        .eyebrow { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

        /* ---------- shell ---------- */
        .shell { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; max-width: 1180px; margin: 0 auto; border-bottom: 1px solid var(--glass-border); }
        .navbar-brand { display: flex; align-items: center; gap: 0.8rem; }
        
        /* Contenedor del Logo de la Universidad */
        .navbar-logo-container { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
        .navbar-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }

        .navbar-name { font-weight: 700; font-size: 1.1rem; color: var(--utb-green); letter-spacing: -0.02em; }
        .navbar-sub { font-size: 0.75rem; color: var(--utb-green); font-weight: 500; }

        .cta-btn { padding: 0.65rem 1.15rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .cta-btn:hover { transform: translateY(-1px); }
        .cta-solid { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); color: #FFFFFF; }
        .cta-solid:hover { box-shadow: 0 6px 20px -4px rgba(0, 168, 89, 0.4); }
        .cta-ghost { border: 1px solid var(--glass-border); background: rgba(255,255,255,0.02); }
        .cta-ghost:hover { border-color: var(--utb-green); }
        .cta-btn.small { padding: 0.4rem 0.75rem; font-size: 0.78rem; }
        .cta-btn.full { width: 100%; justify-content: center; margin-top: 1rem; }

        /* ---------- hero ---------- */
        .hero { max-width: 1180px; margin: 2.5rem auto 0; padding: 0 1.5rem; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; }
        .hero h1 { font-size: 2.8rem; line-height: 1.1; font-weight: 700; color: var(--text); }
        .hero-grad { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .hero p.lead { margin-top: 1rem; color: var(--text); max-width: 46ch; font-size: 1.05rem; line-height: 1.6; }
        .hero-actions { display: flex; gap: 0.75rem; margin-top: 1.6rem; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 999px; padding: 0.65rem 1.1rem; margin-top: 1.8rem; max-width: 440px; }
        .search-box input { border: none; background: none; padding: 0; width: 100%; }
        .search-box:focus-within { border-color: var(--utb-green); }
        
        .hero-visual { position: relative; aspect-ratio: 1.1/1; border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); }
        .hero-visual img { width: 100%; height: 100%; object-fit: cover; opacity: 0.75; }
        .hero-visual::after { content: ""; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(0,168,89,0.25), rgba(0,86,179,0.25), transparent); }
        .hero-tag { position: absolute; bottom: 1rem; left: 1rem; right: 1rem; background: rgba(10,17,26,0.8); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 14px; padding: 0.9rem 1.1rem; z-index: 2; }

        /* ---------- river divider ---------- */
        .river-divider { max-width: 1180px; margin: 3rem auto 2rem; padding: 0 1.5rem; }
        .river-path { stroke-dasharray: 6 8; animation: flow 8s linear infinite; }
        @keyframes flow { to { stroke-dashoffset: -200; } }

        /* ---------- filters ---------- */
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0 0 1.75rem; }
        .pill { padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--muted); font-weight: 500; transition: all 0.2s; }
        .pill:hover { border-color: var(--utb-green); color: #FFFFFF; }
        .pill-active { background: var(--utb-green); color: #FFFFFF; border-color: var(--utb-green); }

        /* ---------- bento grid ---------- */
        .section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.25rem; }
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .venture-card { position: relative; grid-column: span 1; border-radius: 16px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); text-align: left; display: flex; flex-direction: column; transition: transform 0.2s ease, border-color 0.2s ease; }
        .venture-card-big { grid-column: span 2; flex-direction: row; }
        .venture-card:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 25px -10px rgba(0,0,0,0.5); }
        .venture-card-image { width: 100%; height: 150px; background-size: cover; background-position: center; }
        .venture-card-big .venture-card-image { width: 45%; height: auto; min-height: 200px; }
        .venture-card-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
        .venture-card-body h3 { font-size: 1.1rem; color: #FFFFFF; }
        .venture-card-glow { position: absolute; width: 60px; height: 60px; border-radius: 50%; filter: blur(35px); opacity: 0.25; top: -20px; right: -20px; }
        .no-results { grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--muted); }

        /* ---------- detail view ---------- */
        .detail-view { max-width: 1180px; margin: 0 auto; padding: 1.5rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--muted); font-size: 0.85rem; margin-bottom: 1.25rem; }
        .back-btn:hover { color: var(--utb-green); }
        .detail-banner { position: relative; border-radius: 20px; overflow: hidden; height: 280px; border: 1px solid var(--glass-border); }
        .detail-banner-img { width: 100%; height: 100%; object-fit: cover; }
        .detail-banner-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,17,26,0.1), rgba(10,17,26,0.95)); }
        .detail-banner-content { position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; z-index: 2; }
        .detail-banner-content h1 { font-size: 2.2rem; margin-top: 0.2rem; color: #FFFFFF; }
        .detail-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2.5rem;
  margin-top: 2.25rem;
}
        .detail-main h2 { font-size: 1.25rem; margin-bottom: 0.8rem; margin-top: 1.75rem; color: #FFFFFF; border-left: 3px solid var(--utb-green); padding-left: 0.5rem; }
        .detail-main h2:first-child { margin-top: 0; }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .product-card { border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; background: var(--ink-elevated); }
        .product-card-img { width: 100%; height: 120px; object-fit: cover; display: block; }
        .product-card-placeholder { display: flex; align-items: center; justify-content: center; }
        .product-card-body { padding: 0.9rem; }
        .product-card-row { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; }
        .product-card-row h4 { font-size: 0.95rem; color: #FFFFFF; }
        .price { font-weight: 700; font-size: 0.95rem; }

        .contact-card { border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem; background: var(--ink-elevated); align-self: start; }
        .contact-card h3 { font-size: 1.05rem; margin-bottom: 1rem; color: #FFFFFF; }
        .contact-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0; font-size: 0.9rem; color: #E2E8F0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .contact-row:hover { color: var(--accent); }

        /* ---------- register form ---------- */
        .form-view { max-width: 760px; margin: 0 auto; padding: 1.5rem; }
        .form-view h1 { font-size: 2rem; margin-top: 0.5rem; color: #FFFFFF; }
        .form-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 1rem; }
        .form-section h3 { font-size: 1rem; color: #FFFFFF; }
        .form-section-header { display: flex; justify-content: space-between; align-items: center; }
        .form-row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .product-form-row { display: grid; grid-template-columns: 1.2fr 0.7fr 1.2fr 1.5fr auto; gap: 0.5rem; align-items: center; }
        label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; color: var(--muted); }
        .color-row { display: flex; align-items: center; gap: 0.6rem; }
        .color-row input[type="color"] { width: 42px; height: 38px; padding: 2px; background: none; border: none; cursor: pointer; }
        .icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; color: var(--muted); }
        .icon-btn:hover { color: #ff6b6b; border-color: #ff6b6b; }

        .success-state { max-width: 480px; margin: 5rem auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .success-icon { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); display: flex; align-items: center; justify-content: center; color: #FFFFFF; margin-bottom: 0.75rem; }

        .footer { max-width: 1180px; margin: 5rem auto 0; padding: 2.5rem 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; font-size: 0.85rem; color: var(--muted); }
        .footer-strong { color: #FFFFFF; font-weight: 500; }

        @media (max-width: 860px) {
          .hero { grid-template-columns: 1fr; margin-top: 1.5rem; text-align: center; }
          .hero h1 { font-size: 2.2rem; }
          .search-box { margin: 1.5rem auto 0; }
          .hero-actions { justify-content: center; }
          .hero-visual { aspect-ratio: 16/9; }
          .bento-grid { grid-template-columns: 1fr 1fr; }
          .venture-card-big { grid-column: span 2; flex-direction: column; }
          .venture-card-big .venture-card-image { width: 100%; height: 150px; }
          .detail-grid { grid-template-columns: 1fr; }
          .products-grid { grid-template-columns: 1fr; }
          .form-row.two { grid-template-columns: 1fr; }
          .product-form-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .bento-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-container">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Logo_UTB_Ecuador.png" 
              alt="Logo Universidad Técnica de Babahoyo" 
              className="navbar-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = "<div style='background:var(--utb-green); color:white; font-weight:700; font-size:0.8rem; padding:6px; border-radius:8px;'>UTB</div>";
              }}
            />
          </div>
          <div>
            <div className="navbar-name">EmprendeUTB</div>
            <div className="navbar-sub">Facultad de Administración, Finanzas e Informática</div>
          </div>
        </div>
        {view === "home" && (
          <button className="cta-btn cta-solid" onClick={goRegister}>
            <Plus size={15} /> Registrar mi emprendimiento
          </button>
        )}
      </nav>

      {view === "home" && (
        <>
          <header className="hero">
            <div>
              <h1>
                Vitrina de <span className="hero-grad">Emprendimientos</span> de la Universidad Técnica de Babahoyo
              </h1>
              <p className="lead">
                Impulsando la innovación y el comercio de los estudiantes de la
                Universidad Técnica de Babahoyo. Explora productos y servicios con contacto directo vía WhatsApp.
              </p>
              <div className="search-box">
                <Search size={16} className="muted" />
                <input
                  placeholder="Buscar comida, tecnología, servicios..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="hero-actions">
                <button className="cta-btn cta-ghost" onClick={goRegister}>
                  <GraduationCap size={15} /> Soy estudiante, quiero publicar
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <img src={seedVentures[0].image} alt="Emprendedores Universitarios" />
              <div className="hero-tag">
                <div className="eyebrow" style={{ color: "var(--utb-green)" }}>Comunidad UTB</div>
                <strong>{ventures.length} Emprendimientos registrados</strong>
                <div className="muted small">en la Facultad de Administración, Finanzas e Informática</div>
              </div>
            </div>
          </header>

          <RiverDivider />

          <main className="shell">
            <div className="section-head">
              <h2>Vitrina comercial estudiantil</h2>
              <span className="muted small">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="filters">
              <Pill active={activeCategory === "Todas"} onClick={() => setActiveCategory("Todas")}>Todas las categorías</Pill>
              {CATEGORIES.map((c) => (
                <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>{c}</Pill>
              ))}
            </div>

            <div className="bento-grid">
              {filtered.length === 0 && (
                <div className="no-results">No encontramos resultados para tu búsqueda actual.</div>
              )}
              {filtered.map((v, i) => (
                <VentureCard key={v.id} v={v} onOpen={openDetail} big={v.featured && i === 0} />
              ))}
            </div>
          </main>
        </>
      )}

      {view === "detail" && selected && (
        <DetailView venture={selected} onBack={goHome} />
      )}

      {view === "register" && (
        <RegisterView onCancel={goHome} onSubmit={handleNewVenture} />
      )}

      <footer className="footer">
        <div>
          <p className="footer-strong">© {new Date().getFullYear()} Universidad Técnica de Babahoyo</p>
          <p className="muted">Desarrollado para la Vitrina Comercial Estudiantil</p>
        </div>
      </footer>
    </div>
  );
}
