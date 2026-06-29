import React, { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import {
  Search,
  Phone,
  ArrowLeft,
  Plus,
  GraduationCap,
  Check,
  Sparkles,
  Trash2,
  Edit,
  MessageSquare,
  X,
  Send,
} from "lucide-react";

/* ----------------------------------------------------------------
   EmprendeUTB — Vitrina de Emprendimientos
   UNIVERSIDAD TÉCNICA DE BABAHOYO
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
    <path d="M16.6 5.82a4.28 4.28 0 0 1-2.7-1.13V14.7a4.85 4.85 0 1 1-4.16-4.8v2.18a2.7 2.7 0 1 0 1.89 2.58V2h2.27a4.28 4.28 0 0 0 4.28 4.27v2.27a4.28 4.28 0 0 1-1.56-3.45z"/>
  </svg>
);

const INSTAGRAM_ICON = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// ==========================================
// CONFIGURACIÓN DE FIREBASE EN LA NUBE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDRauBCeoiNxwh4hPjB1SJUcvzpFfM0sLk",
  authDomain: "emprende-utb.firebaseapp.com",
  projectId: "emprende-utb",
  storageBucket: "emprende-utb.firebasestorage.app",
  messagingSenderId: "867458316566",
  appId: "1:867458316566:web:86c352af0b75eb9fbe7837"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("utb_logged_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [editingVenture, setEditingVenture] = useState(null);
  const [ventures, setVentures] = useState([]);

  // Cargar datos reales de Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ventures"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVentures(list);
      } catch (error) {
        console.error("Error cargando datos de Firebase:", error);
      }
    };
    loadData();
  }, [view]);

  const filtered = useMemo(() => {
    return ventures.filter((v) => {
      const matchesCategory = activeCategory === "Todas" || v.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || 
        v.name.toLowerCase().includes(q) || 
        v.category.toLowerCase().includes(q) || 
        (v.products && v.products.some((p) => p.name.toLowerCase().includes(q)));
      return matchesCategory && matchesQuery;
    });
  }, [ventures, query, activeCategory]);

  const selected = ventures.find((v) => v.id === selectedId);

  const openDetail = (id) => { setSelectedId(id); setView("detail"); };
  const goHome = () => { setView("home"); setEditingVenture(null); };
  
  const handlePublishClick = () => {
    if (!user) { setView("auth"); } else { setEditingVenture(null); setView("register"); }
  };

  const handleEditVentureClick = (ventureToEdit) => {
    setEditingVenture(ventureToEdit);
    setView("register");
  };
  
  const handleNewOrEditVenture = async (v) => {
    try {
      await setDoc(doc(db, "ventures", v.id), v);
      setView("home");
      setEditingVenture(null);
    } catch (error) {
      alert("Error al guardar en la nube: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("utb_logged_user");
    setUser(null);
    setView("home");
  };

  return (
    <div className="app-root">
      <style>{`
        :root {
          --utb-green: #0D472B;       
          --utb-blue: #8C9F2A;        
          --ink: #F4F6F4;             
          --ink-elevated: #FFFFFF;    
          --glass-border: rgba(13, 71, 43, 0.15); 
          --text: #1E293B;            
          --muted: #64748B;           
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root, .app-root { background-color: var(--ink) !important; color: var(--text); min-height: 100vh; width: 100%; overflow-x: hidden; }
        .app-root { font-family: 'Inter', system-ui, sans-serif; padding-bottom: 4rem; }
        h1, h2, h3, h4 { margin: 0; color: var(--text); }
        input, select, textarea { background: #FFFFFF; border: 1px solid var(--glass-border); border-radius: 10px; padding: 0.6rem 0.75rem; color: var(--text); font-family: inherit; font-size: 0.9rem; width: 100%; outline: none; }
        input:focus, select:focus, textarea:focus { border-color: var(--utb-green); }
        .muted { color: var(--muted); }
        .small { font-size: 0.8rem; }
        .body-text { color: var(--text); line-height: 1.6; }
        .eyebrow { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .shell { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--glass-border); background: var(--ink-elevated); }
        .navbar-brand { display: flex; align-items: center; gap: 0.8rem; }
        .navbar-logo-container { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
        .navbar-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .navbar-name { font-weight: 700; font-size: 1.1rem; color: var(--utb-green); }
        .navbar-sub { font-size: 0.75rem; color: var(--utb-green); }
        .cta-btn { padding: 0.65rem 1.15rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.15s; cursor: pointer; border: none; }
        .cta-solid { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); color: #FFFFFF !important; }
        .cta-ghost { border: 1px solid var(--glass-border); background: #FFFFFF; color: var(--text); }
        .cta-ghost:hover { border-color: var(--utb-green); }
        .hero { max-width: 1180px; margin: 2.5rem auto 0; padding: 0 1.5rem; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; }
        .hero h1 { font-size: 2.8rem; line-height: 1.1; font-weight: 700; }
        .hero-grad { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .hero p.lead { margin-top: 1rem; font-size: 1.05rem; line-height: 1.6; }
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: #FFFFFF; border: 1px solid var(--glass-border); border-radius: 999px; padding: 0.65rem 1.1rem; margin-top: 1.8rem; max-width: 440px; }
        .search-box input { border: none; background: none; width: 100%; }
        .hero-visual { position: relative; aspect-ratio: 1.1/1; border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
        .center-logo-img { max-width: 75%; object-fit: contain; margin-bottom: 1rem; }
        .hero-tag { background: rgba(255, 255, 255, 0.95); border: 1px solid var(--glass-border); border-radius: 14px; padding: 0.9rem 1.1rem; width: 100%; text-align: center; }
        .river-divider { max-width: 1180px; margin: 3rem auto 2rem; padding: 0 1.5rem; }
        .river-line { border: 0; height: 1px; background-image: linear-gradient(to right, rgba(13,71,43,0), rgba(13,71,43,0.2), rgba(13,71,43,0)); }
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0 0 1.75rem; }
        .pill { padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--muted); background: #FFFFFF; transition: all 0.2s; cursor: pointer; }
        .pill-active { background: var(--utb-green); color: #FFFFFF; border-color: var(--utb-green); }
        .section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.25rem; }
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .venture-card { border-radius: 16px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); display: flex; flex-direction: column; cursor: pointer; }
        .venture-card-big { grid-column: span 2; flex-direction: row; }
        .venture-card-image { width: 100%; height: 150px; background-size: cover; background-position: center; background-color: #ddd; }
        .venture-card-big .venture-card-image { width: 45%; height: auto; min-height: 200px; }
        .venture-card-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
        .venture-card-body h3 { font-size: 1.1rem; }
        .no-results { grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--muted); }
        .detail-view { max-width: 1180px; margin: 0 auto; padding: 1.5rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--muted); font-size: 0.85rem; margin-bottom: 1.25rem; cursor: pointer; }
        .detail-banner { position: relative; border-radius: 20px; overflow: hidden; height: 280px; background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); }
        .detail-banner-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7)); }
        .detail-banner-content { position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; z-index: 2; color: white; }
        .detail-banner-content h1 { color: white; font-size: 2.2rem; }
        .detail-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2.5rem; margin-top: 2.25rem; }
        .detail-main h2 { font-size: 1.25rem; margin-bottom: 0.8rem; margin-top: 1.75rem; border-left: 3px solid var(--utb-green); padding-left: 0.5rem; }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .product-card { border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; background: var(--ink-elevated); padding: 1rem; }
        .contact-card { border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem; background: var(--ink-elevated); align-self: start; }
        .contact-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0; font-size: 0.9rem; border-bottom: 1px solid var(--glass-border); }
        .form-view { max-width: 760px; margin: 0 auto; padding: 1.5rem; background: white; border-radius: 16px; border: 1px solid var(--glass-border); margin-top: 2rem; }
        .form-section { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
        .form-row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; color: var(--muted); font-weight: 600; }
        
        /* CHAT BOTTON */
        .chat-trigger { position: fixed; bottom: 1.5rem; right: 1.5rem; width: 56px; height: 56px; border-radius: 50%; background: var(--utb-green); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; z-index: 999; }
        .chat-window { position: fixed; bottom: 5.5rem; right: 1.5rem; width: 340px; height: 420px; background: white; border-radius: 16px; border: 1px solid var(--glass-border); box-shadow: 0 8px 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; z-index: 999; }
        .chat-header { background: var(--utb-green); color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; background: #f8f9fa; font-size: 0.85rem; }
        .msg { padding: 0.6rem 0.8rem; border-radius: 12px; max-width: 80%; line-height: 1.4; }
        .msg-bot { background: white; border: 1px solid var(--glass-border); align-self: flex-start; }
        .msg-user { background: var(--utb-green); color: white; align-self: flex-end; }
        .chat-footer { padding: 0.75rem; border-top: 1px solid var(--glass-border); display: flex; gap: 0.5rem; background: white; }

        .footer { max-width: 1180px; margin: 5rem auto 0; padding: 2.5rem 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; flex-wrap: wrap; background: var(--ink-elevated); border-radius: 12px; }
        @media (max-width: 860px) {
          .hero { grid-template-columns: 1fr; text-align: center; }
          .hero h1 { font-size: 2.2rem; }
          .search-box { margin: 1.5rem auto 0; }
          .bento-grid { grid-template-columns: 1fr; }
          .venture-card-big { grid-column: span 1; flex-direction: column; }
          .detail-grid { grid-template-columns: 1fr; }
          .products-grid { grid-template-columns: 1fr; }
          .form-row.two { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand" onClick={goHome} style={{ cursor: "pointer" }}>
          <div className="navbar-logo-container">
            <img src="https://ricardomedinao.wordpress.com/wp-content/uploads/2011/12/utb_logo_verdea.png" alt="UTB" className="navbar-logo-img" />
          </div>
          <div>
            <div className="navbar-name">EmprendeUTB</div>
            <div className="navbar-sub">Facultad de Administración, Finanzas e Informática</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>👋 {user.name}</span>
              {view === "home" && (
                <button className="cta-btn cta-solid" onClick={handlePublishClick}>
                  <Plus size={15} /> Publicar
                </button>
              )}
              <button className="cta-btn cta-ghost small" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            view === "home" && <button className="cta-btn cta-solid" onClick={() => setView("auth")}>Ingresar</button>
          )}
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      {view === "home" && (
        <>
          <header className="hero">
            <div>
              <h1>Vitrina de <span className="hero-grad">Emprendimientos</span> UTB</h1>
              <p className="lead">Explora artículos y servicios de la Facultad de Administración, Finanzas e Informática con sincronización y contacto en tiempo real.</p>
              <div className="search-box">
                <Search size={16} className="muted" />
                <input placeholder="Buscar productos..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <button className="cta-btn cta-ghost" onClick={handlePublishClick}>
                  <GraduationCap size={15} /> Publicar mi negocio estudiantil
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <img src="https://ricardomedinao.wordpress.com/wp-content/uploads/2011/12/utb_logo_verdea.png" alt="Escudo UTB" className="center-logo-img" />
              <div className="hero-tag">
                <strong style={{ display: "block" }}>{ventures.length} Negocios en la nube</strong>
                <div className="muted small">Actualizado globalmente</div>
              </div>
            </div>
          </header>

          <RiverDivider />

          <main className="shell">
            <div className="section-head">
              <h2>Vitrina comercial estudiantil</h2>
              <span className="muted small">{filtered.length} visible(s)</span>
            </div>

            <div className="filters">
              <Pill active={activeCategory === "Todas"} onClick={() => setActiveCategory("Todas")}>Todas las categorías</Pill>
              {CATEGORIES.map((c) => (
                <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>{c}</Pill>
              ))}
            </div>

            <div className="bento-grid">
              {filtered.length === 0 ? (
                <div className="no-results">No hay emprendimientos en la nube para esta categoría.</div>
              ) : (
                filtered.map((v, i) => (
                  <VentureCard key={v.id} v={v} onOpen={openDetail} big={i === 0} />
                ))
              )}
            </div>
          </main>
        </>
      )}

      {view === "auth" && <AuthView onCancel={goHome} onAuthSuccess={(userData) => { setUser(userData); setView("register"); }} />}
      {view === "detail" && selected && <DetailView venture={selected} onBack={goHome} currentUser={user} onEditClick={handleEditVentureClick} />}
      {view === "register" && <RegisterView currentUser={user} editingVenture={editingVenture} onCancel={goHome} onSubmit={handleNewOrEditVenture} />}

      <SupportChat />

      <footer className="footer">
        <div>
          <p>© {new Date().getFullYear()} Universidad Técnica de Babahoyo</p>
          <p className="muted">Vitrina Comercial Distribuida (FAFI)</p>
        </div>
      </footer>
    </div>
  );
}

/* --- COMPONENTES AUXILIARES DEL SISTEMA --- */

function RiverDivider() {
  return (
    <div className="river-divider">
      <hr className="river-line" />
    </div>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <span className={`pill ${active ? "pill-active" : ""}`} onClick={onClick}>
      {children}
    </span>
  );
}

function VentureCard({ v, onOpen, big }) {
  return (
    <div className={`venture-card ${big ? "venture-card-big" : ""}`} onClick={() => onOpen(v.id)}>
      <div className="venture-card-image" style={{ backgroundImage: v.imageUrl ? `url(${v.imageUrl})` : 'none' }}></div>
      <div className="venture-card-body">
        <span className="eyebrow" style={{ color: "var(--utb-green)" }}>{v.category}</span>
        <h3>{v.name}</h3>
        <p className="muted small">{v.description}</p>
        <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
          <span className="small" style={{ fontWeight: 600 }}>👤 Por: {v.ownerName || "Estudiante"}</span>
        </div>
      </div>
    </div>
  );
}

function AuthView({ onCancel, onAuthSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return alert("Completa todos los campos");
    const userData = { name, phone, id: "u_" + Date.now() };
    localStorage.setItem("utb_logged_user", JSON.stringify(userData));
    onAuthSuccess(userData);
  };

  return (
    <div className="form-view">
      <h2>Ingreso Estudiantil (FAFI)</h2>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>Regístrate con tus datos para poder publicar o editar tu emprendimiento.</p>
      <form onSubmit={handleSubmit} className="form-section">
        <label>
          Nombre completo:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Juan Pérez" required />
        </label>
        <label>
          Teléfono de WhatsApp (Para clientes):
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 0987654321" required />
        </label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" className="cta-btn cta-solid">Continuar</button>
          <button type="button" className="cta-btn cta-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function DetailView({ venture, onBack, currentUser, onEditClick }) {
  const isOwner = currentUser && currentUser.name === venture.ownerName;

  return (
    <div className="detail-view">
      <div className="back-btn" onClick={onBack}><ArrowLeft size={16} /> Volver a la vitrina</div>
      
      <div className="detail-banner">
        <div className="detail-banner-overlay"></div>
        <div className="detail-banner-content">
          <span className="eyebrow" style={{ color: "var(--utb-blue)" }}>{venture.category}</span>
          <h1>{venture.name}</h1>
          <p>Por: {venture.ownerName}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <h2>Sobre el emprendimiento</h2>
          <p className="body-text">{venture.description}</p>

          <h2>Productos / Servicios ofertados</h2>
          <div className="products-grid">
            {venture.products && venture.products.map((p, idx) => (
              <div key={idx} className="product-card">
                <div className="product-card-row">
                  <strong>{p.name}</strong>
                  <span className="price" style={{ color: "var(--utb-green)" }}>${p.price}</span>
                </div>
                <p className="muted small" style={{ marginTop: "0.3rem" }}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-card">
          <h3>Contacto Directo</h3>
          <p className="muted small" style={{ marginBottom: "1rem" }}>Comunícate directamente con el estudiante de la FAFI.</p>
          
          <div className="contact-row">
            <Phone size={16} style={{ color: "var(--utb-green)" }} />
            <span>{venture.phone || "No registrado"}</span>
          </div>

          <a 
            href={`https://wa.me/${venture.phone?.replace(/^0/, '593')}?text=Hola,%20vi%20tu%20emprendimiento%20${encodeURIComponent(venture.name)}%20en%20la%20Vitrina%20UTB.`}
            target="_blank" 
            rel="noreferrer" 
            className="cta-btn cta-solid" 
            style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem", textDecoration: "none" }}
          >
            <MessageSquare size={16} /> Contactar por WhatsApp
          </a>

          {isOwner && (
            <button 
              className="cta-btn cta-ghost" 
              style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
              onClick={() => onEditClick(venture)}
            >
              <Edit size={16} /> Editar mi publicación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterView({ currentUser, editingVenture, onCancel, onSubmit }) {
  const [name, setName] = useState(editingVenture?.name || "");
  const [category, setCategory] = useState(editingVenture?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(editingVenture?.description || "");
  const [products, setProducts] = useState(editingVenture?.products || [{ name: "", price: "", description: "" }]);

  const handleAddProduct = () => {
    setProducts([...products, { name: "", price: "", description: "" }]);
  };

  const handleProductChange = (idx, field, val) => {
    const updated = [...products];
    updated[idx][field] = val;
    setProducts(updated);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !description) return alert("Rellena los datos principales");
    
    const data = {
      id: editingVenture?.id || "v_" + Date.now(),
      name,
      category,
      description,
      ownerName: currentUser.name,
      phone: currentUser.phone,
      products: products.filter(p => p.name !== "")
    };
    
    onSubmit(data);
  };

  return (
    <div className="form-view">
      <h2>{editingVenture ? "Editar Emprendimiento" : "Publicar nuevo Emprendimiento"}</h2>
      <form onSubmit={handleFormSubmit} className="form-section" style={{ marginTop: "1.5rem" }}>
        <label>
          Nombre del negocio estudiantil:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        
        <label>
          Categoría principal:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>
          Descripción del negocio:
          <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        </label>

        <h3>Productos / Menú</h3>
        {products.map((p, idx) => (
          <div key={idx} className="form-row two" style={{ borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
            <label>
              Artículo/Servicio:
              <input type="text" value={p.name} onChange={(e) => handleProductChange(idx, "name", e.target.value)} placeholder="Ej. Hamburguesa simple" />
            </label>
            <label>
              Precio ($):
              <input type="number" step="0.01" value={p.price} onChange={(e) => handleProductChange(idx, "price", e.target.value)} placeholder="Ej. 3.50" />
            </label>
          </div>
        ))}
        
        <button type="button" className="cta-btn cta-ghost small" onClick={handleAddProduct}>+ Añadir otro producto</button>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <button type="submit" className="cta-btn cta-solid">Guardar en la nube</button>
          <button type="button" className="cta-btn cta-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function SupportChat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "¡Hola! Bienvenido al asistente de la Vitrina UTB. ¿En qué te puedo ayudar hoy?" }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newMsg = { sender: "user", text: text };
    setMessages(prev => [...prev, newMsg]);
    setText("");

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "¡Entendido! Tu mensaje ha sido registrado. Si necesitas soporte técnico con tu emprendimiento, acércate al laboratorio informático de la FAFI."
      }]);
    }, 1000);
  };

  return (
    <>
      <div className="chat-trigger" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </div>
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span style={{ fontWeight: 600 }}>Soporte UTB (FAFI)</span>
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender === "bot" ? "msg-bot" : "msg-user"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="chat-footer" onSubmit={handleSend}>
            <input placeholder="Escribe tu duda..." value={text} onChange={(e) => setText(e.target.value)} style={{ padding: "0.4rem 0.6rem" }} />
            <button type="submit" className="cta-btn cta-solid" style={{ padding: "0.4rem" }}><Send size={14} /></button>
          </form>
        </div>
      )}
    </>
  );
}