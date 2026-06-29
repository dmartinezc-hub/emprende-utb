import React, { useState, useMemo, useEffect } from "react";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

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
    width="16" height="16"
    {...props}
  >
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

const seedVentures = [];

const emptyProduct = () => ({ id: `p-${Math.random().toString(36).slice(2)}`, name: "", price: "", desc: "", image: "" });
const emptyForm = (currentOwner, currentEmail) => ({
  name: "", owner: currentOwner || "", ownerEmail: currentEmail || "", career: "", category: CATEGORIES[0], color: "#00A859",
  description: "", image: "", phone: "", instagram: "", facebook: "", tiktok: "",
  products: [emptyProduct()],
});

function RiverDivider() {
  return (
    <div className="river-divider" aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" width="100%" height="40">
        <defs>
          <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0D472B" />
            <stop offset="100%" stopColor="#8C9F2A" />
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
      {v.image ? (
        <div className="venture-card-image" style={{ backgroundImage: `url(${v.image})` }} />
      ) : (
        <div className="venture-card-image" style={{ background: "linear-gradient(135deg, var(--utb-green), var(--utb-blue))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>UTB Comercial</div>
      )}
      <div className="venture-card-body">
        <span className="eyebrow" style={{ color: v.color }}>{v.category}</span>
        <h3>{v.name}</h3>
        <p className="muted">{v.owner}</p>
      </div>
      <div className="venture-card-glow" style={{ background: v.color }} />
    </button>
  );
}

function DetailView({ venture, onBack, currentUser, onEditClick }) {
  const isOwner = currentUser && venture.ownerEmail === currentUser.email;

  return (
    <div className="detail-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <button className="back-btn" onClick={onBack} style={{ margin: 0 }}>
          <ArrowLeft size={16} /> Volver a la vitrina
        </button>
        {isOwner && (
          <button className="cta-btn cta-ghost small" onClick={() => onEditClick(venture)} style={{ borderColor: "var(--utb-green)", color: "var(--utb-green)", gap: "0.5rem" }}>
            <Edit size={14} /> Editar mis datos y productos
          </button>
        )}
      </div>

      <div className="detail-banner" style={{ background: `linear-gradient(135deg, ${venture.color}33, transparent)` }}>
        {venture.image && <img src={venture.image} alt={venture.name} className="detail-banner-img" />}
        <div className="detail-banner-overlay" />
        <div className="detail-banner-content">
          <span className="eyebrow" style={{ color: venture.color }}>{venture.category}</span>
          <h1 style={{ color: "#FFFFFF" }}>{venture.name}</h1>
          <p style={{ color: "#E2E8F0" }}>{venture.owner} · {venture.career}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <h2 style={{ color: "var(--text)" }}>Sobre el emprendimiento</h2>
          <p className="body-text" style={{ color: "var(--text)" }}>{venture.description}</p>

          <h2 style={{ color: "var(--text)" }}>Productos ofertados</h2>
          <div className="products-grid">
            {venture.products && venture.products.length > 0 ? (
              venture.products.map((p) => (
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
                      <h4 style={{ color: "var(--text)" }}>{p.name}</h4>
                      <span className="price" style={{ color: venture.color }}>${Number(p.price).toFixed(2)}</span>
                    </div>
                    <p className="muted small">{p.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted small" style={{ gridColumn: "1 / -1" }}>No hay productos registrados en este emprendimiento.</p>
            )}
          </div>
        </div>

        <aside className="contact-card" style={{ "--accent": venture.color }}>
          <h3 style={{ color: "var(--text)" }}>Contactar al vendedor</h3>
          <a className="contact-row" style={{ color: "var(--text)" }} href={`https://wa.me/593${venture.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer">
            <Phone size={16} /> {venture.phone}
          </a>
          {venture.instagram && (
            <a className="contact-row" style={{ color: "var(--text)" }} href={`https://instagram.com/${venture.instagram}`} target="_blank" rel="noreferrer">
              <span>Instagram: @{venture.instagram}</span>
            </a>
          )}
          {venture.facebook && (
            <a className="contact-row" style={{ color: "var(--text)" }} href={`https://facebook.com/${venture.facebook}`} target="_blank" rel="noreferrer">
              <FACEBOOK_ICON /> {venture.facebook}
            </a>
          )}
          {venture.tiktok && (
            <a className="contact-row" style={{ color: "var(--text)" }} href={`https://tiktok.com/@${venture.tiktok}`} target="_blank" rel="noreferrer">
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

function RegisterView({ currentUser, editingVenture, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => {
    if (editingVenture) return { ...editingVenture };
    return emptyForm(currentUser ? currentUser.name : "", currentUser ? currentUser.email : "");
  });
  const [done, setDone] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateProduct = (id, field, value) =>
    setForm((f) => ({ ...f, products: f.products.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));

  const handleImageFile = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update(field, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProductImageFile = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateProduct(id, "image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => setForm((f) => ({ ...f, products: [...f.products, emptyProduct()] }));
  
  // Función crítica: Permite la remoción inmediata de un producto antes de guardar
  const removeProduct = (id) => setForm((f) => ({ ...f, products: f.products.filter((p) => p.id !== id) }));

  const canSubmit = form.name.trim() && form.owner.trim() && form.phone.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      ...form,
      id: form.id || `v-${Date.now()}`,
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
        <h2 style={{ color: "var(--text)" }}>{editingVenture ? "¡Cambios guardados exitosamente!" : "¡Emprendimiento registrado!"}</h2>
        <p className="muted">Los datos y precios de {form.name} han sido actualizados en la vitrina.</p>
        <button className="cta-btn cta-solid" onClick={onCancel}>Ver la vitrina</button>
      </div>
    );
  }

  return (
    <form className="form-view" onSubmit={handleSubmit}>
      <button type="button" className="back-btn" onClick={onCancel}>
        <ArrowLeft size={16} /> Cancelar
      </button>
      <h1 style={{ color: "var(--text)" }}>{editingVenture ? "Editar mi emprendimiento" : "Registrar mi emprendimiento"}</h1>
      <p className="muted">Modifica o añade la información comercial de tus artículos o servicios.</p>

      {/* SECCIÓN: DATOS GENERALES */}
      <div className="form-section">
        <h3 style={{ color: "var(--utb-green)" }}>Datos del emprendimiento</h3>
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
            Subir foto / logo desde dispositivo
            <input type="file" accept="image/*" onChange={(e) => handleImageFile("image", e.target.files[0])} style={{ background: "transparent" }} />
            {form.image && <span style={{ fontSize: "11px", color: "var(--utb-green)" }}>✔ Imagen cargada con éxito</span>}
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

      {/* SECCIÓN: CONTACTO */}
      <div className="form-section">
        <h3 style={{ color: "var(--utb-green)" }}>Datos del vendedor</h3>
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

      {/* SECCIÓN COMPONENTES DE PRODUCTOS (Gestiòn de Precios y Eliminación) */}
      <div className="form-section">
        <div className="form-section-header" style={{ marginBottom: "1rem" }}>
          <h3 style={{ color: "var(--utb-green)" }}>Productos / Servicios en catálogo</h3>
          <button type="button" className="cta-btn cta-ghost small" style={{ color: "var(--text)" }} onClick={addProduct}>
            <Plus size={14} /> Añadir producto nuevo
          </button>
        </div>
        
        {form.products && form.products.map((p, i) => (
          <div className="product-form-row" key={p.id} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", background: "var(--ink-elevated)", padding: "1.2rem", borderRadius: "10px", marginBottom: "1rem", border: "1px solid var(--glass-border)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--utb-green)", fontWeight: "bold" }}>Artículo #{i + 1}</span>
              {form.products.length > 1 && (
                <button 
                  type="button" 
                  className="icon-btn" 
                  onClick={() => removeProduct(p.id)} 
                  aria-label="Eliminar producto" 
                  style={{ color: "#EF4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            
            <div className="form-row two">
              <label>
                Nombre del producto/servicio *
                <input placeholder="Ej. Porción de torta" value={p.name} onChange={(e) => updateProduct(p.id, "name", e.target.value)} required />
              </label>
              <label>
                Precio de venta ($) *
                <input placeholder="0.00" type="number" min="0" step="0.01" value={p.price} onChange={(e) => updateProduct(p.id, "price", e.target.value)} required />
              </label>
            </div>

            <div className="form-row two" style={{ alignItems: "end" }}>
              <label>
                Descripción corta o porción
                <input placeholder="Ej. Tamaño personal, incluye aderezo" value={p.desc} onChange={(e) => updateProduct(p.id, "desc", e.target.value)} />
              </label>
              <label>
                Cambiar foto del artículo
                <input type="file" accept="image/*" onChange={(e) => handleProductImageFile(p.id, e.target.files[0])} style={{ background: "transparent", padding: "4px" }} />
                {p.image && <span style={{ fontSize: "10px", color: "var(--utb-green)", marginTop: "2px" }}>✔ Foto cargada en caché</span>}
              </label>
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="cta-btn cta-solid full" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5, marginTop: "1.5rem" }}>
        {editingVenture ? "Guardar y actualizar catálogo comercial" : "Publicar mi emprendimiento"}
      </button>
    </form>
  );
}

/* COMPONENTE DE AUTENTICACIÓN LOCAL CON NUEVAS VALIDACIONES STRICT */
function AuthView({ onCancel, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem("utb_users_list")) || [];

    if (isRegister) {
      if (!email.includes("@") || !email.includes(".com")) {
        alert("Error de Registro: El correo electrónico debe ser válido (debe incluir '@' y terminar en '.com').");
        return;
      }
      if (password.length < 8) {
        alert("Error de Contraseña: Debe contener mínimo 8 letras o caracteres.");
        return;
      }
      if (!/[A-Z]/.test(password)) {
        alert("Error de Contraseña: Debe incluir al menos una letra MAYÚSCULA.");
        return;
      }
      if (!/[0-9]/.test(password)) {
        alert("Error de Contraseña: Debe incluir al menos un NÚMERO.");
        return;
      }

      const userExists = registeredUsers.some(u => u.email === email);
      if (userExists) {
        alert("Este correo electrónico ya está registrado. Por favor, inicia sesión.");
        return;
      }
      
      const newUser = { email, password, name: fullName || "Estudiante UTB" };
      registeredUsers.push(newUser);
      localStorage.setItem("utb_users_list", JSON.stringify(registeredUsers));
      localStorage.setItem("utb_logged_user", JSON.stringify(newUser));
      alert("¡Cuenta creada con éxito! Tus datos cumplen con los parámetros institucionales.");
      onAuthSuccess(newUser);
    } else {
      const validUser = registeredUsers.find(u => u.email === email && u.password === password);
      if (!validUser) {
        alert("Error: Correo o contraseña incorrectos. Si no tienes una cuenta, por favor haz clic abajo en 'Regístrate aquí'.");
        return;
      }
      localStorage.setItem("utb_logged_user", JSON.stringify(validUser));
      onAuthSuccess(validUser);
    }
  };

  return (
    <div className="form-view" style={{ maxWidth: "450px", padding: "2rem", background: "var(--ink-elevated)", borderRadius: "16px", border: "1px solid var(--glass-border)", margin: "3rem auto" }}>
      <button type="button" className="back-btn" onClick={onCancel}><ArrowLeft size={16} /> Volver</button>
      <h2 style={{ color: "var(--utb-green)", marginBottom: "0.5rem", fontFamily: "Space Grotesk" }}>{isRegister ? "Crear Cuenta Estudiantil" : "Ingreso Obligatorio"}</h2>
      <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>Identifícate formalmente. El registro exige parámetros de seguridad institucionales.</p>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isRegister && (
          <label style={{ color: "var(--text)" }}>
            Nombre Completo *
            <input type="text" placeholder="Ej. Juan Pérez" required value={fullName} onChange={e => setFullName(e.target.value)} />
          </label>
        )}
        <label style={{ color: "var(--text)" }}>
          Correo Electrónico *
          <input type="text" placeholder="usuario@ejemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
          {isRegister && <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>Requerido: Debe contener '@' y '.com'</span>}
        </label>
        <label style={{ color: "var(--text)" }}>
          Contraseña *
          <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          {isRegister && <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>Requerido: Mínimo 8 letras, 1 Mayúscula y 1 Número</span>}
        </label>
        
        <button type="submit" className="cta-btn cta-solid full" style={{ marginTop: "0.5rem" }}>
          {isRegister ? "Registrarse" : "Iniciar Sesión"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem" }}>
        <span className="muted">{isRegister ? "¿Ya tienes una cuenta? " : "¿No tienes una cuenta? "}</span>
        <span style={{ color: "var(--utb-green)", fontWeight: "700", cursor: "pointer" }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Inicia sesión" : "Regístrate aquí"}
        </span>
      </div>
    </div>
  );
}

/* COMPONENTE DEL CHAT DE SOPORTE TÉCNICO INTERACTIVO */
function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! Bienvenido al Soporte Técnico de EmprendeUTB (FAFI). ¿En qué te puedo ayudar hoy?", sender: "bot" }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const userText = input.toLowerCase();
    setInput("");

    setTimeout(() => {
      let responseText = "Disculpa, no entendí bien tu consulta. Puedes comunicarte directamente al laboratorio de Computación o secretaría de la FAFI para soporte avanzado.";
      
      if (userText.includes("precio") || userText.includes("editar") || userText.includes("eliminar") || userText.includes("cambiar")) {
        responseText = "Para editar tus productos o cambiar precios: inicia sesión, ingresa al detalle de tu emprendimiento y haz clic arriba a la derecha en 'Editar mis datos y productos'. Allí podrás actualizar precios o borrar ítems con el ícono del basurero.";
      } else if (userText.includes("error") || userText.includes("registrar") || userText.includes("contraseña") || userText.includes("cuenta")) {
        responseText = "Recuerda que para registrarte el correo electrónico debe incluir obligatoriamente '@' y '.com'. Además, tu contraseña debe tener mínimo 8 letras, una letra Mayúscula y un Número.";
      } else if (userText.includes("hola") || userText.includes("buenos")) {
        responseText = "¡Hola estudiante! Cuéntame, ¿tienes algún problema con la modificación de precios, borrado de productos o el registro de tu cuenta?";
      } else if (userText.includes("foto") || userText.includes("imagen")) {
        responseText = "Ahora el sistema te permite seleccionar imágenes directamente desde los archivos de tu computadora o celular. No requieres enlaces de internet externos.";
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: responseText, sender: "bot" }]);
    }, 800);
  };

  return (
    <div className="support-chat-container" style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000, fontFamily: "Inter" }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="cta-solid" 
          style={{ width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(13, 71, 43, 0.4)", cursor: "pointer", border: "none" }}
        >
          <MessageSquare size={24} color="#FFF" />
        </button>
      )}

      {isOpen && (
        <div style={{ width: "320px", height: "420px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid var(--glass-border)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, var(--utb-green), var(--utb-blue))", padding: "1rem", color: "#FFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ color: "#FFF", fontSize: "0.95rem" }}>Soporte Técnico</h4>
              <span style={{ fontSize: "11px", opacity: 0.9 }}>FAFI - En Línea</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: "#FFF", cursor: "pointer" }}><X size={18} /></button>
          </div>

          <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", background: "#F8FAFC" }}>
            {messages.map((m) => (
              <div 
                key={m.id} 
                style={{ 
                  maxWidth: "85%", 
                  padding: "0.6rem 0.8rem", 
                  borderRadius: "12px", 
                  fontSize: "0.82rem", 
                  lineHeight: "1.4",
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  background: m.sender === "user" ? "var(--utb-green)" : "#E2E8F0",
                  color: m.sender === "user" ? "#FFFFFF" : "var(--text)"
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "0.75rem", borderTop: "1px solid var(--glass-border)", background: "#FFF", gap: "0.5rem" }}>
            <input 
              placeholder="Escribe tu duda aquí..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              style={{ fontSize: "0.8rem", padding: "0.5rem" }}
            />
            <button type="submit" className="cta-solid" style={{ borderRadius: "10px", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// CONEXIÓN REAL A LA NUBE DE FIREBASE
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
export const db = getFirestore(app);
// ==========================================

export default function App() {  

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("utb_logged_user");
    return saved ? JSON.parse(saved) : null;
  });

const [ventures, setVentures] = useState([]);

  // Cargar datos desde la nube al abrir la página
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
  }, []);

  const filtered = useMemo(() => {
    return ventures.filter((v) => {
      const matchesCategory = activeCategory === "Todas" || v.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || (v.products && v.products.some((p) => p.name.toLowerCase().includes(q)));
      return matchesCategory && matchesQuery;
    });
  }, [ventures, query, activeCategory]);

  const selected = ventures.find((v) => v.id === selectedId);

  const openDetail = (id) => { setSelectedId(id); setView("detail"); };
  const goHome = () => { setView("home"); setEditingVenture(null); };
  
  const handlePublishClick = () => {
    if (!user) {
      setView("auth");
    } else {
      setEditingVenture(null);
      setView("register");
    }
  };

  const handleEditVentureClick = (ventureToEdit) => {
    setEditingVenture(ventureToEdit);
    setView("register");
  };
  
  const handleNewOrEditVenture = async (v) => {
    try {
      // Guardar en la nube (Firestore)
      await setDoc(doc(db, "ventures", v.id), v);
      
      // Actualizar la pantalla del usuario de inmediato
      setVentures((vs) => {
        const exists = vs.some((item) => item.id === v.id);
        if (exists) {
          return vs.map((item) => (item.id === v.id ? v : item));
        } else {
          return [v, ...vs];
        }
      });
    } catch (error) {
      alert("Error al guardar en la nube: " + error.message);
    }
    setView("home");
    setEditingVenture(null);
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
        * { box-sizing: border-box; }
        .app-root {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          background: var(--ink);
          color: var(--text);
          min-height: 100vh;
          padding-bottom: 4rem;
        }
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        h1, h2, h3, h4 { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; margin: 0; letter-spacing: -0.01em; color: var(--text); }
        p { margin: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        input, select, textarea {
          background: #FFFFFF;
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
        .body-text { color: var(--text); line-height: 1.6; max-width: 60ch; }
        .eyebrow { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

        /* ---------- shell ---------- */
        .shell { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; max-width: 1180px; margin: 0 auto; border-bottom: 1px solid var(--glass-border); background: var(--ink-elevated); }
        .navbar-brand { display: flex; align-items: center; gap: 0.8rem; }
        
        .navbar-logo-container { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
        .navbar-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }

        .navbar-name { font-weight: 700; font-size: 1.1rem; color: var(--utb-green); letter-spacing: -0.02em; }
        .navbar-sub { font-size: 0.75rem; color: var(--utb-green); font-weight: 500; }

        .cta-btn { padding: 0.65rem 1.15rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .cta-btn:hover { transform: translateY(-1px); }
        .cta-solid { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); color: #FFFFFF !important; }
        .cta-solid:hover { box-shadow: 0 6px 20px -4px rgba(13, 71, 43, 0.4); }
        .cta-ghost { border: 1px solid var(--glass-border); background: rgba(255,255,255,0.02); color: var(--text); }
        .cta-ghost:hover { border-color: var(--utb-green); }
        .cta-btn.small { padding: 0.4rem 0.75rem; font-size: 0.78rem; }
        .cta-btn.full { width: 100%; justify-content: center; margin-top: 1rem; }

        /* ---------- hero ---------- */
        .hero { max-width: 1180px; margin: 2.5rem auto 0; padding: 0 1.5rem; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; }
        .hero h1 { font-size: 2.8rem; line-height: 1.1; font-weight: 700; color: var(--text); }
        .hero-grad { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .hero p.lead { margin-top: 1rem; color: var(--text); max-width: 46ch; font-size: 1.05rem; line-height: 1.6; }
        .hero-actions { display: flex; gap: 0.75rem; margin-top: 1.6rem; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: #FFFFFF; border: 1px solid var(--glass-border); border-radius: 999px; padding: 0.65rem 1.1rem; margin-top: 1.8rem; max-width: 440px; }
        .search-box input { border: none; background: none; padding: 0; width: 100%; color: var(--text); }
        .search-box:focus-within { border-color: var(--utb-green); }
        
        .hero-visual { position: relative; aspect-ratio: 1.1/1; border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
        .center-logo-img { max-width: 75%; max-height: 70%; object-fit: contain; margin-bottom: 1rem; }
        
        .hero-tag { background: rgba(255, 255, 255, 0.95); border: 1px solid var(--glass-border); border-radius: 14px; padding: 0.9rem 1.1rem; width: 100%; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

        /* ---------- river divider ---------- */
        .river-divider { max-width: 1180px; margin: 3rem auto 2rem; padding: 0 1.5rem; }
        .river-path { stroke-dasharray: 6 8; animation: flow 8s linear infinite; }
        @keyframes flow { to { stroke-dashoffset: -200; } }

        /* ---------- filters ---------- */
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0 0 1.75rem; }
        .pill { padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--muted); font-weight: 500; transition: all 0.2s; background: #FFFFFF; }
        .pill:hover { border-color: var(--utb-green); color: var(--utb-green); }
        .pill-active { background: var(--utb-green); color: #FFFFFF; border-color: var(--utb-green); }

        /* ---------- bento grid ---------- */
        .section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.25rem; }
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .venture-card { position: relative; grid-column: span 1; border-radius: 16px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); text-align: left; display: flex; flex-direction: column; transition: transform 0.2s ease, border-color 0.2s ease; }
        .venture-card-big { grid-column: span 2; flex-direction: row; }
        .venture-card:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 10px 25px -10px rgba(0,0,0,0.1); }
        .venture-card-image { width: 100%; height: 150px; background-size: cover; background-position: center; }
        .venture-card-big .venture-card-image { width: 45%; height: auto; min-height: 200px; }
        .venture-card-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
        .venture-card-body h3 { font-size: 1.1rem; color: var(--text); }
        .venture-card-glow { position: absolute; width: 60px; height: 60px; border-radius: 50%; filter: blur(35px); opacity: 0.15; top: -20px; right: -20px; }
        .no-results { grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--muted); }

        /* ---------- detail view ---------- */
        .detail-view { max-width: 1180px; margin: 0 auto; padding: 1.5rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--muted); font-size: 0.85rem; margin-bottom: 1.25rem; }
        .back-btn:hover { color: var(--utb-green); }
        .detail-banner { position: relative; border-radius: 20px; overflow: hidden; height: 280px; border: 1px solid var(--glass-border); background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); }
        .detail-banner-img { width: 100%; height: 100%; object-fit: cover; }
        .detail-banner-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7)); }
        .detail-banner-content { position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; z-index: 2; }
        
        .detail-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2.5rem; margin-top: 2.25rem; }
        .detail-main h2 { font-size: 1.25rem; margin-bottom: 0.8rem; margin-top: 1.75rem; color: var(--text); border-left: 3px solid var(--utb-green); padding-left: 0.5rem; }
        .detail-main h2:first-child { margin-top: 0; }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .product-card { border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; background: var(--ink-elevated); }
        .product-card-img { width: 100%; height: 120px; object-fit: cover; display: block; }
        .product-card-placeholder { display: flex; align-items: center; justify-content: center; }
        .product-card-body { padding: 0.9rem; }
        .product-card-row { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; }
        
        .price { font-weight: 700; font-size: 0.95rem; }

        .contact-card { border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem; background: var(--ink-elevated); align-self: start; }
        .contact-card h3 { font-size: 1.05rem; margin-bottom: 1rem; color: var(--text); }
        .contact-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0; font-size: 0.9rem; color: var(--text); border-bottom: 1px solid var(--glass-border); }
        .contact-row:hover { color: var(--accent); }

        /* ---------- register form ---------- */
        .form-view { max-width: 760px; margin: 0 auto; padding: 1.5rem; }
        .form-view h1 { font-size: 2rem; margin-top: 0.5rem; color: var(--text); }
        .form-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 1rem; }
        
        .form-section-header { display: flex; justify-content: space-between; align-items: center; }
        .form-row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; color: var(--muted); font-weight: 600; }
        .color-row { display: flex; align-items: center; gap: 0.6rem; }
        .color-row input[type="color"] { width: 42px; height: 38px; padding: 2px; background: none; border: none; cursor: pointer; }
        .icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; color: var(--muted); background: #FFFFFF; transition: all 0.2s; }
        .icon-btn:hover { color: #ff6b6b; border-color: #ff6b6b; background: #fff5f5; }

        .success-state { max-width: 480px; margin: 5rem auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .success-icon { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); display: flex; align-items: center; justify-content: center; color: #FFFFFF; margin-bottom: 0.75rem; }

        .footer { max-width: 1180px; margin: 5rem auto 0; padding: 2.5rem 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; font-size: 0.85rem; color: var(--muted); background: var(--ink-elevated); border-radius: 12px; }
        .footer-strong { color: var(--text); font-weight: 600; }

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
        }
        @media (max-width: 600px) {
          .bento-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand" onClick={goHome} style={{ cursor: "pointer" }}>
          <div className="navbar-logo-container">
            <img 
              src="https://ricardomedinao.wordpress.com/wp-content/uploads/2011/12/utb_logo_verdea.png" 
              alt="Logo Universidad Técnica de Babahoyo" 
              className="navbar-logo-img"
            />
          </div>
          <div>
            <div className="navbar-name">EmprendeUTB</div>
            <div className="navbar-sub">Facultad de Administración, Finanzas e Informática</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text)" }}>👋 Hola, {user.name}</span>
              {view === "home" && (
                <button className="cta-btn cta-solid" onClick={handlePublishClick}>
                  <Plus size={15} /> Registrar mi emprendimiento
                </button>
              )}
              <button className="cta-btn cta-ghost small" onClick={handleLogout}>Cerrar Sesión</button>
            </>
          ) : (
            view === "home" && (
              <button className="cta-btn cta-solid" onClick={() => setView("auth")}>
                Iniciar Sesión / Registrarse
              </button>
            )
          )}
        </div>
      </nav>

      {/* VISTAS CENTRALES */}
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
                <button className="cta-btn cta-ghost" onClick={handlePublishClick}>
                  <GraduationCap size={15} /> Soy estudiante, quiero publicar
                </button>
              </div>
            </div>
            
            <div className="hero-visual">
              <img 
                src="https://ricardomedinao.wordpress.com/wp-content/uploads/2011/12/utb_logo_verdea.png" 
                alt="Escudo Institucional UTB" 
                className="center-logo-img"
              />
              <div className="hero-tag">
                <div className="eyebrow" style={{ color: "var(--utb-green)" }}>Comunidad Universitaria</div>
                <strong style={{ color: "var(--text)", display: "block", margin: "0.2rem 0" }}>{ventures.length} Emprendimientos registrados</strong>
                <div className="muted small">Facultad de Administración, Finanzas e Informática</div>
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

      {view === "auth" && (
        <AuthView onCancel={goHome} onAuthSuccess={(userData) => { setUser(userData); setView("register"); }} />
      )}

      {view === "detail" && selected && (
        <DetailView venture={selected} onBack={goHome} currentUser={user} onEditClick={handleEditVentureClick} />
      )}

      {view === "register" && (
        <RegisterView currentUser={user} editingVenture={editingVenture} onCancel={goHome} onSubmit={handleNewOrEditVenture} />
      )}

      <SupportChat />

      <footer className="footer">
        <div>
          <p className="footer-strong">© {new Date().getFullYear()} Universidad Técnica de Babahoyo</p>
          <p className="muted">Desarrollado para la Vitrina Comercial Estudiantil (FAFI)</p>
        </div>
      </footer>
    </div>cd emprende-utb-real
  );
}