import React, { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  arrayUnion,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import {
  Search,
  RefreshCw,
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
  Upload,
  Sun,
  Moon,
  MapPin,
  Star,
  Eye,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  User,
  BookOpen,
  Building,
  Briefcase
} from "lucide-react";

/* ----------------------------------------------------------------
   EMPRENDEUTB — PLATAFORMA COMERCIAL INTERFACULTADES v2.5
   SISTEMA OFICIAL DE LA UNIVERSIDAD TÉCNICA DE BABAHOYO
   ---------------------------------------------------------------- */

const IMGBB_API_KEY = "6da44aaefe21a80aa77627332d8137ee";

const CATEGORIES = [
  "Alimentos y Bebidas",
  "Tecnología y Software",
  "Moda, Calzado y Accesorios",
  "Servicios Académicos",
  "Artesanías y Detalles",
  "Librería y Papelería",
  "Salud y Belleza",
  "Otros"
];

const FACULTADES = [
  "Facultad de Administración, Finanzas e Informática (FAFI)",
  "Facultad de Ciencias de la Salud (FACS)",
  "Facultad de Ciencias Jurídicas, Sociales y de la Educación (FCJSE)",
  "Facultad de Ciencias Agropecuarias (FACIAG)"
];

const LOCATIONS = [
  "Predio Central - Puerta 1",
  "Predio Central - Puerta 2",
  "Predio Central - Puerta 3",
  "Predio Central - Áreas Verdes / Bar",
  "Campus",
  "Facultad de Ciencias Agropecuarias (Vía Babahoyo-Montalvo)",
  "Solo bajo pedido / Entrega a convenir en el Campus"
];

const TIKTOK_ICON = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
    <path d="M16.6 5.82a4.28 4.28 0 0 1-2.7-1.13V14.7a4.85 4.85 0 1 1-4.16-4.8v2.18a2.7 2.7 0 1 0 1.89 2.58V2h2.27a4.28 4.28 0 0 0 4.28 4.27v2.27a4.28 4.28 0 0 1-1.58-.72Z" />
  </svg>
);

const FACEBOOK_ICON = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12z" />
  </svg>
);



const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Error en la pasarela de imágenes ImgBB");
  const result = await response.json();
  return result.data.url;
};

const emptyProduct = () => ({
  id: `p-${Math.random().toString(36).slice(2)}`,
  name: "",
  price: "",
  desc: "",
  image: ""
});

const emptyForm = (currentOwner, currentEmail) => ({
  name: "",
  owner: currentOwner || "",
  ownerEmail: currentEmail || "",
  faculty: FACULTADES[0],
  career: "",
  category: CATEGORIES[0],
  location: LOCATIONS[0],
  color: "#0D472B",
  description: "",
  image: "",
  phone: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  products: [emptyProduct()],
  views: 0,
  whatsappClicks: 0,
  reviews: []
});

const updateUserVentures = async (updatedUser) => {
  try {
    const snapshot = await getDocs(collection(db, "ventures"));

    const batch = writeBatch(db);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Busca los emprendimientos del usuario
      if (data.owner === updatedUser.name) {
        batch.update(docSnap.ref, {
          ownerPhoto: updatedUser.photoURL,
          owner: updatedUser.name,
          faculty: updatedUser.faculty || data.faculty,
          career: updatedUser.career || data.career
        });
      }
    });

    await batch.commit();

    console.log("Todos los emprendimientos fueron actualizados.");
  } catch (err) {
    console.error(err);
  }
};

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
        <path 
          d="M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20" 
          fill="none" 
          stroke="url(#riverGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          className="river-path" 
        />
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
  const ratingAvg = useMemo(() => {
    if (!v.reviews || v.reviews.length === 0) return 0;
    const sum = v.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / v.reviews.length).toFixed(1);
  }, [v.reviews]);

  return (
    <div 
      onClick={() => onOpen(v.id)} 
      className={`venture-card ${big ? "venture-card-big" : ""}`} 
      style={{ "--accent": v.color }}
    >
      {v.image ? (
        <div className="venture-card-image" style={{ backgroundImage: `url(${v.image})` }} />
      ) : (
        <div className="venture-card-image default-gradient-bg">
          <Sparkles size={28} color="#FFFFFF" />
          <span>UTB Emprende</span>
        </div>
      )}
      <div className="venture-card-body">
        <div className="card-top-meta">
          <span className="eyebrow" style={{ color: v.color }}>{v.category}</span>
          {ratingAvg > 0 && (
            <span className="rating-badge">
              <Star size={12} fill="currentColor" /> {ratingAvg}
            </span>
          )}
        </div>
       <h3>{v.name}</h3>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
    marginBottom: "6px"
  }}
>
  <img
    src={
      v.ownerPhoto ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    alt={v.owner}
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid #ffffff"
    }}
  />

  <div>
    <p
      style={{
        margin: 0,
        fontWeight: "600",
        color: "#fff"
      }}
    >
      {v.owner}
    </p>

    <span className="card-faculty-tag-badge">
      {v.faculty
        ? v.faculty.split(" (")[0]
        : "UTB Matriz"}
    </span>
  </div>
</div>
        <div className="card-location-footer">
          <MapPin size={12} /> 
          <span>{v.location || "Campus UTB"}</span>
        </div>
      </div>
      <div className="venture-card-glow" style={{ background: v.color }} />
    </div>
  );
}

function DetailView({ venture, onBack, currentUser, onEditClick, onVentureUpdate, onVentureDelete }) {
  const isOwner = currentUser && venture.ownerEmail === currentUser.email;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState(currentUser ? currentUser.name : "");

  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [quantities, setQuantities] = useState({});

  const ratingAvg = useMemo(() => {
    if (!venture || !venture.reviews || venture.reviews.length === 0) return 0;
    const sum = venture.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / venture.reviews.length).toFixed(1);
  }, [venture.reviews]);

  // Funciones para incrementar y decrementar cantidades
  const handleIncrease = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleDecrease = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1)
    }));
  };

  // Obtener la lista de productos seleccionados con cantidad mayor a cero
  const selectedItems = useMemo(() => {
    if (!venture.products) return [];
    return venture.products
      .map(p => ({
        ...p,
        quantity: quantities[p.id] || 0
      }))
      .filter(item => item.quantity > 0);
  }, [venture.products, quantities]);

  // Calcular el precio total acumulado de la cotización de forma segura
  const totalQuote = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const priceValue = !isNaN(parseFloat(item.price)) ? parseFloat(item.price) : 0;
      return acc + (priceValue * item.quantity);
    }, 0);
  }, [selectedItems]);

  // Función optimizada para móviles que redirige inmediatamente
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      alert("Por favor, selecciona al menos un producto usando los botones (+) antes de realizar el pedido.");
      return;
    }

    // 1. Preparamos el mensaje estructurado de la cotización
    let message = `¡Hola! Me interesa realizar un pedido en tu emprendimiento *${venture.name}* a través de la plataforma EmprendeUTB. Aquí tienes el detalle:\n\n`;
    
    selectedItems.forEach(item => {
      const priceValue = !isNaN(parseFloat(item.price)) ? parseFloat(item.price) : 0;
      const subtotal = (priceValue * item.quantity).toFixed(2);
      message += `• *${item.quantity}x* ${item.name} ($${priceValue.toFixed(2)} c/u) → Subtotal: $${subtotal}\n`;
    });

    message += `\n💰 *Total de la Cotización:* $${totalQuote.toFixed(2)}`;
    message += `\n📍 *Punto de Entrega sugerido:* ${venture.location || "Campus UTB"}`;

    const encodedMessage = encodeURIComponent(message);
    
    // Limpiamos el número de teléfono removiendo espacios, guiones y el 0 inicial
    const cleanPhone = venture.phone.trim().replace(/[- ]/g, "").replace(/^0/, "");
    const whatsappUrl = `https://wa.me/593${cleanPhone}?text=${encodedMessage}`;

    // 2. Redirección instantánea sin demoras (evita el bloqueo de pop-ups en celulares)
    window.location.href = whatsappUrl;

    // 3. Registramos la métrica analítica en segundo plano
    try {
      const docRef = doc(db, "ventures", venture.id);
      updateDoc(docRef, { whatsappClicks: increment(1) });
    } catch (e) { 
      console.error("Error al registrar click analítico:", e); 
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      alert("Por favor rellene todos los campos requeridos para la reseña.");
      return;
    }
    const newReview = { 
      id: `r-${Date.now()}`, 
      name: reviewerName, 
      rating, 
      comment, 
      date: new Date().toLocaleDateString() 
    };
    const updatedReviews = venture.reviews ? [...venture.reviews, newReview] : [newReview];
    
    try {
      const docRef = doc(db, "ventures", venture.id);
      await updateDoc(docRef, { reviews: arrayUnion(newReview) });
      onVentureUpdate({ ...venture, reviews: updatedReviews });
      setComment("");
      if (!currentUser) setReviewerName("");
      alert("¡Tu valoración ha sido guardada en los servidores de la Universidad!");
    } catch (err) {
      alert("No se pudo guardar la opinión en la base de datos.");
    }
  };


  const handleDeleteVenture = async () => {
    const confirmacion = window.confirm(`⚠️ ¿Estás completamente seguro de que deseas eliminar permanentemente el emprendimiento "${venture.name}"?\n\nEsta acción borrará todas tus métricas y catálogo de productos en Firebase Firestore y no se puede deshacer.`);
    
    if (!confirmacion) return;

    try {
      // Eliminar el documento físico en la nube de forma directa
      await deleteDoc(doc(db, "ventures", venture.id));
      
      alert("El proyecto comercial ha sido removido exitosamente de la base de datos de EmprendeUTB.");
      
      if (onVentureDelete) {
        onVentureDelete(venture.id);
      }
    } catch (error) {
      console.error("Error en el proceso de eliminación:", error);
      alert("Ocurrió un error de comunicación con Firestore al intentar eliminar el registro.");
    }
  };

  return (
    <div className="detail-view">
      <div className="detail-nav-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Volver a la pagina comercial
        </button>
        
        {/* PANEL ADMINISTRATIVO EXCLUSIVO: EDITAR Y ELIMINAR */}
        {isOwner && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="cta-btn cta-ghost small" onClick={() => onEditClick(venture)}>
              <Edit size={14} /> Panel Administrativo
            </button>
            <button 
              className="cta-btn small" 
              onClick={handleDeleteVenture}
              style={{ 
                background: "#dc2626", 
                color: "#ffffff", 
                border: "none", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.4rem",
                padding: "0.4rem 0.8rem",
                fontSize: "0.85rem",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              <Trash2 size={14} /> Eliminar Emprendimiento
            </button>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="stats-dashboard">
          <div className="dashboard-header">
            <h4><TrendingUp size={16} /> Métricas Analíticas del Comercio Universitario</h4>
            <span className="badge-live">Sincronizado</span>
          </div>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon-wrapper"><Eye size={18} /></div>
              <div className="stat-info">
                <span className="stat-label">Vistas del Perfil</span>
                <strong className="stat-value">{venture.views || 0}</strong>
              </div>
            </div>
            <div className="stat-box whatsapp-stat">
              <div className="stat-icon-wrapper"><Phone size={18} /></div>
              <div className="stat-info">
                <span className="stat-label">Redirecciones a WhatsApp</span>
                <strong className="stat-value">{venture.whatsappClicks || 0}</strong>
              </div>
            </div>
            <div className="stat-box rating-stat">
              <div className="stat-icon-wrapper"><Star size={18} /></div>
              <div className="stat-info">
                <span className="stat-label">Promedio de Feedback</span>
                <strong className="stat-value">{ratingAvg > 0 ? `${ratingAvg} / 5.0` : "Sin reseñas"}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="detail-banner" style={{ background: `linear-gradient(135deg, ${venture.color}33, transparent)` }}>
        {venture.image && <img src={venture.image} alt={venture.name} className="detail-banner-img" />}
        <div className="detail-banner-overlay" />
        <div className="detail-banner-content">
          <span className="eyebrow" style={{ color: "#FFFFFF", backgroundColor: venture.color, padding: "0.2rem 0.6rem", borderRadius: "4px", display: "inline-block", marginBottom: "0.5rem" }}>{venture.category}</span>
          <h1>{venture.name}</h1>
          <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "12px",
    marginBottom: "10px"
  }}
>
  <img
  src={
    venture.ownerPhoto ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  }
  alt={venture.owner}
  onClick={() => setShowProfilePhoto(true)}
  style={{
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid rgba(255,255,255,0.9)",
    cursor: "pointer",
    transition: "0.3s"
  }}
/>

  <div>
    <div
      style={{
        fontWeight: "700",
        fontSize: "18px",
        color: "#fff"
      }}
    >
      {venture.owner}
    </div>

    <div
      style={{
        color: "#e5e7eb",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      <GraduationCap size={14} />
      {venture.faculty}
    </div>
  </div>
</div>
          <p className="subtitle-career"><BookOpen size={14} /> {venture.career}</p>
          <div className="detail-location-tag">
            <MapPin size={14} /> <span>Campus/Zona: {venture.location || "Instalaciones UTB"}</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="content-block">
            <h2>Sobre nuestro proyecto comercial</h2>
            <p className="body-text">{venture.description || "Sin descripción disponible."}</p>
          </div>

          <div className="content-block">
            <h2>Catálogo de Artículos y Lista de Precios</h2>
            <p className="muted small" style={{ marginBottom: "1rem" }}>Usa los botones de más (+) y menos (-) para ajustar las cantidades y cotizar tu pedido en tiempo real.</p>
            <div className="products-grid">
              {venture.products && venture.products.length > 0 ? (
                venture.products.map((p) => {
                  const currentQty = quantities[p.id] || 0;
                  return (
                    <div key={p.id} className="product-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="product-card-img" />
                        ) : (
                          <div className="product-card-img product-card-placeholder" style={{ background: venture.color + "15" }}>
                            <Sparkles size={20} style={{ color: venture.color }} />
                          </div>
                        )}
                        <div className="product-card-body">
                          <div className="product-card-row">
                            <h4>{p.name}</h4>
                            <span className="price" style={{ color: venture.color }}>
                              <DollarSign size={14} style={{ display: "inline", marginRight: "-2px" }} />
                              {!isNaN(parseFloat(p.price)) ? Number(p.price).toFixed(2) : "0.00"}
                            </span>
                          </div>
                          <p className="muted small product-description-text">{p.desc || "Sin especificaciones."}</p>
                        </div>
                      </div>

                      {/* Selectores de Cantidad Integrados por Producto */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderTop: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.01)" }}>
                        <span className="font-small muted">Cantidad:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <button 
                            type="button" 
                            className="pill" 
                            onClick={() => handleDecrease(p.id)}
                            style={{ width: "28px", height: "28px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", minWidth: "auto", fontWeight: "bold" }}
                          >
                            -
                          </button>
                          <strong style={{ minWidth: "16px", textAlign: "center", fontSize: "0.9rem" }}>{currentQty}</strong>
                          <button 
                            type="button" 
                            className="pill" 
                            onClick={() => handleIncrease(p.id)}
                            style={{ 
                              width: "28px", 
                              height: "28px", 
                              padding: 0, 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center", 
                              minWidth: "auto", 
                              fontWeight: "bold",
                              background: currentQty > 0 ? venture.color : "",
                              color: currentQty > 0 ? "#FFFFFF" : ""
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted small" style={{ gridColumn: "1 / -1", padding: "1.5rem", textAlign: "center" }}>Este negocio no cuenta con productos activos en su catálogo.</p>
              )}
            </div>

            {/* Caja flotante resumen / Enviar orden por WhatsApp */}
            {selectedItems.length > 0 && (
              <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "8px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h5 style={{ margin: 0 }}>Pedido Cotizado ({selectedItems.length} art.)</h5>
                  <strong style={{ fontSize: "1.3rem", color: venture.color }}>Total: ${totalQuote.toFixed(2)}</strong>
                </div>
                <button type="button" className="cta-btn cta-solid" onClick={handlePlaceOrder} style={{ background: "#25D366", color: "#FFF", borderColor: "#25D366" }}>
                  <Phone size={14} /> Enviar Orden de Compra por WhatsApp
                </button>
              </div>
            )}
          </div>

          <div className="content-block reviews-block">
            <h2>Comentarios y Valoraciones de la Comunidad ({venture.reviews ? venture.reviews.length : 0})</h2>
            <div className="reviews-section">
              <form onSubmit={handleAddReview} className="review-form">
                <h5>Dejar una valoración comercial</h5>
                <div className="form-row two">
                  <label>
                    Nombre del Comprador * <input 
                      required 
                      value={reviewerName} 
                      onChange={(e) => setReviewerName(e.target.value)} 
                      disabled={!!currentUser} 
                      placeholder="Tu nombre completo" 
                    />
                  </label>
                  <label>
                    Calificación *
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                      <option value="5">⭐⭐⭐⭐⭐ Excelente (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ Muy Bueno (4/5)</option>
                      <option value="3">⭐⭐⭐ Regular (3/5)</option>
                      <option value="2">⭐⭐ Deficiente (2/5)</option>
                      <option value="1">⭐ Insatisfactorio (1/5)</option>
                    </select>
                  </label>
                </div>
                <label>
                  Tu reseña u opinión * <textarea 
                    required 
                    required
                    rows={2} 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    placeholder="Cuéntanos sobre la calidad, atención o precio del producto..." 
                  />
                </label>
                <button type="submit" className="cta-btn cta-solid small" style={{ width: "fit-content" }}>
                  Enviar Comentario
                </button>
              </form>

              <div className="reviews-list">
                {venture.reviews && venture.reviews.length > 0 ? (
                  [...venture.reviews].reverse().map((r) => (
                    <div key={r.id} className="review-item">
                      <div className="review-item-header">
                        <strong className="reviewer-identity">{r.name}</strong>
                        <span className="stars-rendered">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                      </div>
                      <p className="review-text-content">{r.comment}</p>
                      <div className="review-item-footer">
                        <Calendar size={12} /> <span className="review-date-label">{r.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted small blank-slate-text">Aún no se registran opiniones. ¡Sé el primero en calificar este emprendimiento!</p>
                )}
              </div>
            </div>
          </div>
        </div>
 
        <aside className="contact-card" style={{ "--accent": venture.color, height: "fit-content", position: "sticky", top: "20px" }}>
          {/* MÓDULO INTERACTIVO DE COTIZACIÓN Y CARRITO */}
          <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Resumen del Pedido</h3>
            
            {selectedItems.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", margin: "0.75rem 0", paddingRight: "4px" }}>
                {selectedItems.map(item => {
                  const priceValue = !isNaN(parseFloat(item.price)) ? parseFloat(item.price) : 0;
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span className="muted" style={{ maxWidth: "75%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <strong>{item.quantity}x</strong> {item.name}
                      </span>
                      <strong style={{ color: "var(--text)" }}>${(priceValue * item.quantity).toFixed(2)}</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted font-small" style={{ margin: "1rem 0", fontStyle: "italic" }}>No has añadido artículos a tu cotización.</p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--glass-border)" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Total Estimado:</span>
              <strong style={{ fontSize: "1.3rem", color: venture.color }}>${totalQuote.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="cta-btn cta-solid full"
              onClick={handlePlaceOrder}
              disabled={selectedItems.length === 0}
              style={{
                background: selectedItems.length > 0 ? "#25D366" : "var(--glass-border)",
                boxShadow: selectedItems.length > 0 ? "0 4px 12px rgba(37, 211, 102, 0.2)" : "none",
                color: selectedItems.length > 0 ? "#FFFFFF" : "var(--muted)",
                cursor: selectedItems.length > 0 ? "pointer" : "not-allowed",
                marginTop: "1.25rem",
                fontWeight: "700",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Phone size={16} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} /> Realizar Pedido por WhatsApp
            </button>
          </div>

          <div className="contact-card-header">
            <h3>Canales de Atención</h3>
            <span className="verified-tag"><Award size={12} /> Emprendedor UTB</span>
          </div>
          
          {/* Enlaces de Redes Sociales Directos y Seguros */}
          <a className="contact-row" href={`https://wa.me/593${venture.phone.trim().replace(/[- ]/g, "").replace(/^0/, "")}`} target="_blank" rel="noreferrer">
            <div className="contact-icon-bg"><Phone size={14} /></div>
            <div className="contact-info-text">
              <span className="contact-label">WhatsApp de Contacto</span>
              <span className="contact-value">{venture.phone}</span>
            </div>
          </a>
          
          {venture.instagram && (
            <a className="contact-row" href={`https://instagram.com/${venture.instagram}`} target="_blank" rel="noreferrer">
              <div className="contact-icon-bg"><span>IG</span></div>
              <div className="contact-info-text">
                <span className="contact-label">Instagram Comercial</span>
                <span className="contact-value">@{venture.instagram}</span>
              </div>
            </a>
          )}
          
          {venture.facebook && (
            <a className="contact-row" href={`https://facebook.com/${venture.facebook}`} target="_blank" rel="noreferrer">
              <div className="contact-icon-bg"><FACEBOOK_ICON /></div>
              <div className="contact-info-text">
                <span className="contact-label">Página de Facebook</span>
                <span className="contact-value">{venture.facebook}</span>
              </div>
            </a>
          )}
          
          {venture.tiktok && (
            <a className="contact-row" href={`https://tiktok.com/@${venture.tiktok}`} target="_blank" rel="noreferrer">
              <div className="contact-icon-bg"><TIKTOK_ICON /></div>
              <div className="contact-info-text">
                <span className="contact-label">Canal de TikTok</span>
                <span className="contact-value">@{venture.tiktok}</span>
              </div>
            </a>
          )}
        </aside>
          </div>

      {/* MODAL PARA VER LA FOTO EN GRANDE */}
      {showProfilePhoto && (
        <div
          onClick={() => setShowProfilePhoto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: "center" }}
          >
            <img
              src={
                venture.ownerPhoto ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={venture.owner}
              style={{
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "5px solid white",
                boxShadow: "0 0 30px rgba(0,0,0,.5)"
              }}
            />

            <h2 style={{ color: "white", marginTop: "20px" }}>
              {venture.owner}
            </h2>
          </div>
        </div>
      )}

    </div>
  );
}
      

function RegisterView({ currentUser, editingVenture, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => {
    if (editingVenture) return { ...editingVenture };
    return emptyForm(currentUser ? currentUser.name : "", currentUser ? currentUser.email : "");
  });
  const [done, setDone] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingProd, setUploadingProd] = useState({});

// 🟢 EFECTO PARA REESCRIBIR EL FORMULARIO CUANDO ENTRAS EN MODO EDICIÓN
  React.useEffect(() => {
    if (editingVenture) {
      setForm({ ...editingVenture });
    }
  }, [editingVenture]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateProduct = (id, field, value) =>
    setForm((f) => ({ ...f, products: f.products.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));
  const addProduct = () => setForm((f) => ({ 
    ...f, 
    products: [...f.products, {
      id: `p-${Math.random().toString(36).slice(2)}-${Date.now()}`,
      name: "",
      price: "",
      desc: "",
      image: ""
    }] 
  }));
  const removeProduct = (id) => setForm((f) => ({ ...f, products: f.products.filter((p) => p.id !== id) }));

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingMain(true);
      const onlineUrl = await uploadToImgBB(file);
      update("image", onlineUrl);
    } catch (err) {
      alert("Hubo un fallo crítico al subir la imagen al servidor remoto de ImgBB.");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleProductImageUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingProd(prev => ({ ...prev, [id]: true }));
      const onlineUrl = await uploadToImgBB(file);
      updateProduct(id, "image", onlineUrl);
    } catch (err) {
      alert("Ocurrió un error subiendo la fotografía de este artículo específico.");
    } finally {
      setUploadingProd(prev => ({ ...prev, [id]: false }));
    }
  };

  const canSubmit = form.name.trim() && form.owner.trim() && form.phone.trim() && !uploadingMain;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // LIMPIEZA DE ARREGLOS CORRUPTOS ANTES DE ENVIAR A FIRESTORE
    const parsedProducts = form.products
      .filter((p) => p.name && p.name.trim() !== "")
      .map((p) => ({
        id: p.id || `p-${Math.random().toString(36).slice(2)}`,
        name: p.name.trim(),
        price: Number(p.price) || 0,
        desc: p.desc ? p.desc.trim() : "",
        image: p.image ? p.image.trim() : ""
      }));

    if (parsedProducts.length === 0) {
      alert("Debes agregar al menos un producto válido con su nombre y precio en la lista.");
      return;
    }

    onSubmit({
      ...form,
      id: form.id || `v-${Date.now()}`,
      products: parsedProducts,
      reviews: form.reviews || [],
      views: form.views || 0,
      whatsappClicks: form.whatsappClicks || 0,
      ownerPhoto: currentUser?.photoURL || "",
      ownerName: currentUser?.name || "",

    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="success-state">
        <div className="success-icon"><Check size={28} /></div>
        <h2>Sincronización Exitosa</h2>
        <p className="muted">La base de datos central de la UTB fue actualizada con los parámetros de tu negocio.</p>
        <button className="cta-btn cta-solid" onClick={onCancel}>Volver a la Pagina Principal</button>
      </div>
    );
  }

  return (
    <form className="form-view" onSubmit={handleSubmit}>
      <button type="button" className="back-btn" onClick={onCancel}>
        <ArrowLeft size={16} /> Volver sin Guardar
      </button>
      <h1>{editingVenture ? "Modificar Ficha de Negocio" : "Registrar Proyecto Comercial"}</h1>
      <p className="muted font-small">Formulario Único de Emprendimientos UTB. Recuerda que las imágenes locales se procesan automáticamente en la nube para no saturar los límites de Firestore.</p>

      <div className="form-section">
        <h3 className="section-form-title">Estructura Comercial</h3>
        <div className="form-row two">
          <label>
            Nombre del Emprendimiento * <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej. Cevichería El Palmar UTB" required />
          </label>
          <label>
            Giro de Negocio / Categoría *
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row two">
          <label>
            📍 Ubicación o Campus de Operación *
            <select value={form.location} onChange={(e) => update("location", e.target.value)}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label>
            Color de Identidad de Marca
            <div className="color-row">
              <input type="color" value={form.color} onChange={(e) => update("color", e.target.value)} />
              <span className="muted small hex-code-label">{form.color}</span>
            </div>
          </label>
        </div>
        <label>
          Descripción del Negocio / Propuesta de Valor
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="¿Qué ofreces? Cuéntale a la comunidad universitaria tus horarios o modalidades de entrega..." />
        </label>
        
        <label>
          Logotipo o Foto de Portada
          <div className="file-uploader-wrapper">
            <input type="file" accept="image/*" onChange={handleMainImageUpload} style={{ display: "none" }} id="main-image-file" />
            <label htmlFor="main-image-file" className="cta-btn cta-ghost small">
              <Upload size={14} /> {uploadingMain ? "Subiendo archivo..." : "Seleccionar Imagen"}
            </label>
            {form.image && <span className="upload-success-indicator">✓ Enlace en la nube generado</span>}
          </div>
        </label>
      </div>

      <div className="form-section">
        <h3 className="section-form-title">Datos del Estudiante Responsable</h3>
        <div className="form-row two">
          <label>Nombres y Apellidos Completos * <input value={form.owner} onChange={(e) => update("owner", e.target.value)} required /></label>
          <label>
            Facultad de Pertenencia *
            <select value={form.faculty} onChange={(e) => update("faculty", e.target.value)}>
              {FACULTADES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row two">
          <label>Carrera y Semestre * <input value={form.career} onChange={(e) => update("career", e.target.value)} placeholder="Ej. Ingeniería en Sistemas - 6to Semestre" required /></label>
          <label>Teléfono Celular (WhatsApp) * <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Ej. 0987654321" required /></label>
        </div>
        <div className="form-row three">
          <label>Instagram (usuario) <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="mi.negocio" /></label>
          <label>Facebook (usuario) <input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} placeholder="pagina.fb" /></label>
          <label>TikTok (usuario) <input value={form.tiktok} onChange={(e) => update("tiktok", e.target.value)} placeholder="username.tt" /></label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="section-form-title">Catálogo de Productos</h3>
          <button type="button" className="cta-btn cta-ghost small" onClick={addProduct}>
            <Plus size={14} /> Añadir Artículo
          </button>
        </div>
        
        {form.products && form.products.map((p, i) => (
          <div className="product-form-row" key={p.id}>
            <div className="product-item-meta-row">
              <span className="item-counter-label">Ítem Comercial #{i + 1}</span>
              {form.products.length > 1 && (
                <button type="button" className="icon-btn delete-item-trigger" onClick={() => removeProduct(p.id)}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="form-row two">
              <label>Nombre del Producto * <input placeholder="Ej. Porción de Tortilla" value={p.name} onChange={(e) => updateProduct(p.id, "name", e.target.value)} required /></label>
              <label>Precio Unitario ($ USD) * <input placeholder="0.00" type="number" min="0" step="0.01" value={p.price} onChange={(e) => updateProduct(p.id, "price", e.target.value)} required /></label>
            </div>
            <div className="form-row two" style={{ alignItems: "end" }}>
              <label>Detalle o Variante <input placeholder="Ej. Con queso y salsa de la casa" value={p.desc} onChange={(e) => updateProduct(p.id, "desc", e.target.value)} /></label>
              <label>
                Fotografía del Producto
                <div className="file-uploader-wrapper">
                  <input type="file" accept="image/*" onChange={(e) => handleProductImageUpload(p.id, e)} style={{ display: "none" }} id={`prod-file-${p.id}`} />
                  <label htmlFor={`prod-file-${p.id}`} className="cta-btn cta-ghost small">
                    <Upload size={14} /> {uploadingProd[p.id] ? "Subiendo..." : "Subir Foto"}
                  </label>
                  {p.image && <span className="upload-success-indicator">✓ Guardado</span>}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
      <button type="submit" className="cta-btn cta-solid full" style={{ padding: "1rem" }} disabled={!canSubmit}>
        {editingVenture ? "Actualizar Datos del Emprendimiento" : "Publicar Proyecto en EmprendeUTB"}
      </button>
    </form>
  );
}

function AuthView({ onCancel, onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Campos del formulario convencional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [faculty, setFaculty] = useState(FACULTADES ? FACULTADES[0] : "");

  // Estados de visualización de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para el flujo de recuperación de contraseña
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Ingresar correo, 2: Validar código y nueva clave
  const [sentCode, setSentCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 1. Manejo de Autenticación por Correo / Registro Manual
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (isRegistering) {
      if (!name.trim() || !phone.trim() || !confirmPassword.trim()) {
        alert("Por favor, completa todos los campos del registro.");
        return;
      }
      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden. Por favor, verifícalas.");
        return;
      }
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const allUsers = querySnapshot.docs.map(doc => doc.data());
        
        if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          alert("El correo electrónico ya se encuentra registrado.");
          return;
        }

        const newUserId = "usr_" + Date.now();
        const newUser = { id: newUserId, name, email, password, faculty, phone, photoURL: "" };
        
        await setDoc(doc(db, "users", newUserId), newUser);
        alert("¡Registro estudiantil exitoso en la red EmprendeUTB!");
        localStorage.setItem("utb_logged_user", JSON.stringify(newUser));
        onAuthSuccess(newUser);
      } catch (error) {
        console.error("Error al registrar en la nube:", error);
        alert("Hubo un problema de conexión con el servidor de Firebase.");
      }
    } else {
      // Flujo de Login convencional
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const allUsers = querySnapshot.docs.map(doc => doc.data());
        const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (found) {
          localStorage.setItem("utb_logged_user", JSON.stringify(found));
          onAuthSuccess(found);
        } else {
          alert("Credenciales incorrectas o el usuario no existe en la base de datos.");
        }
      } catch (error) {
        console.error("Error al autenticar:", error);
        alert("Error al conectar con la base de datos remota.");
      }
    }
  };

  // 2. Flujo de Autenticación con Google OAuth
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const googleUserEmail = googleUser.email;
      const googleUserName = googleUser.displayName || "Usuario Google";
      
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const allUsers = querySnapshot.docs.map(doc => doc.data());
      
      let loggedUser = allUsers.find(u => u.email.toLowerCase() === googleUserEmail.toLowerCase());
      
      if (!loggedUser) {
        // Registro automático si el correo de Google no existe en la BD corporativa
        const newUserId = "usr_gg_" + googleUser.uid; 
        loggedUser = {
    id: newUserId,
    name: googleUserName,
    email: googleUserEmail,
    password: "...",
    faculty: FACULTADES ? FACULTADES[0] : "",
    phone: "0999999999",
    photoURL: googleUser.photoURL || ""
};
        await setDoc(doc(db, "users", newUserId), loggedUser);
        alert("¡Cuenta de Google vinculada exitosamente en EmprendeUTB!");
      }
      
      localStorage.setItem("utb_logged_user", JSON.stringify(loggedUser));
      onAuthSuccess(loggedUser);
      window.location.reload();
    } catch (error) {
      console.error("Error en Google Sign-In:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        alert("Error al intentar conectar con los servicios de Google de Firebase.");
      }
    }
  };

  // 3. Flujo Olvidó Contraseña: Envío de Código de Simulación
  const handleSendRecoveryCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Por favor ingresa tu correo institucional o personal.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const allUsers = querySnapshot.docs.map(doc => doc.data());
      const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        alert("El correo electrónico ingresado no pertenece a ninguna cuenta.");
        return;
      }

      // Generar código aleatorio de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      
      console.log(`[UTB SECURITY] Código de confirmación para ${email}: ${code}`);
      alert(`Se ha enviado un código de confirmación a tu correo: ${email}.\n(Para fines de prueba, revisa la consola del navegador o usa este código: ${code})`);
      
      setRecoveryStep(2);
    } catch (error) {
      alert("Error al buscar el usuario en la base de datos.");
    }
  };

  // 4. Flujo Olvidó Contraseña: Validación y Modificación en Firestore
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!inputCode.trim() || !newPassword.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (inputCode !== sentCode) {
      alert("El código de confirmación ingresado es incorrecto.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const userDoc = querySnapshot.docs.find(doc => doc.data().email.toLowerCase() === email.toLowerCase());

      if (userDoc) {
        await updateDoc(doc(db, "users", userDoc.id), {
          password: newPassword
        });
        
        alert("¡Contraseña actualizada con éxito en los servidores de la Universidad! Ya puedes iniciar sesión.");
        
        // Limpieza de estados y retorno al Login
        setIsForgotPassword(false);
        setRecoveryStep(1);
        setPassword("");
        setNewPassword("");
        setInputCode("");
      } else {
        alert("No se pudo encontrar el registro para actualizar la contraseña.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al intentar actualizar la base de datos.");
    }
  };

  /* ==========================================
     INTERFAZ 1: FORMULARIO DE RECUPERACIÓN
     ========================================== */
  if (isForgotPassword) {
    return (
      <div className="form-view main-card font-smooth">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <button type="button" className="back-btn" onClick={() => { setIsForgotPassword(false); setRecoveryStep(1); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowLeft size={16} /> Cancelar
          </button>
          <span className="badge badge-accent">Recuperación UTB</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>Restablecer Contraseña</h2>
          <p className="muted" style={{ fontSize: "0.9rem", marginTop: "0.4rem" }}>
            {recoveryStep === 1 
              ? "Ingresa tu correo para recibir un código de confirmación de 6 dígitos" 
              : "Ingresa el código recibido y tu nueva clave de acceso"}
          </p>
        </div>

        {recoveryStep === 1 ? (
          <form onSubmit={handleSendRecoveryCode} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="input-group">
              <label>Correo Electrónico Registrado</label>
              <div className="input-with-icon">
                <Send className="input-icon" size={16} />
                <input type="email" placeholder="usuario@utb.edu.ec" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="cta-btn cta-solid" style={{ width: "100%", padding: "0.9rem" }}>
              Enviar Código de Confirmación
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="input-group">
              <label>Código de Confirmación</label>
              <div className="input-with-icon">
                <Check className="input-icon" size={16} />
                <input type="text" placeholder="Ej. 123456" value={inputCode} onChange={(e) => setInputCode(e.target.value)} required />
              </div>
            </div>
            
            <div className="input-group">
              <label>Nueva Contraseña</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <Check className="input-icon" size={16} />
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  style={{ paddingRight: "2.5rem" }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
                >
                  {showNewPassword ? <X size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="cta-btn cta-solid" style={{ width: "100%", padding: "0.9rem" }}>
              Actualizar Contraseña e Ingresar
            </button>
          </form>
        )}
      </div>
    );
  }

  /* ==========================================
     INTERFAZ 2: LOGIN / REGISTRO ESTÁNDAR
     ========================================== */
  return (
    <div className="form-view main-card font-smooth">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <button type="button" className="back-btn" onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Regresar
        </button>
        <span className="badge badge-accent">Seguridad UTB</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>
          {isRegistering ? "Registro de Emprendedor" : "Acceso de Estudiantes"}
        </h2>
        <p className="muted" style={{ fontSize: "0.9rem", marginTop: "0.4rem" }}>
          {isRegistering ? "Crea tu credencial digital única para el ecosistema comercial" : "Ingresa tus datos universitarios validados"}
        </p>
      </div>

      {/* Botón de Google OAuth */}
      <button 
        type="button" 
        onClick={handleGoogleAuth} 
        className="cta-btn cta-ghost" 
        style={{ width: "100%", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", border: "1px solid var(--glass-border)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        {isRegistering ? "Registrarse con Google" : "Iniciar Sesión con Google"}
      </button>

      <div style={{ display: "flex", alignItems: "center", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)", margin: "0.5rem 0 1rem 0" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
        <span style={{ padding: "0 0.5rem" }}>O usar correo</span>
        <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
      </div>

      <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {isRegistering && (
          <>
            <div className="input-group">
              <label>Nombres Completos</label>
              <div className="input-with-icon">
                <User className="input-icon" size={16} />
                <input type="text" placeholder="Ej. Juan Alberto Pérez" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label>Teléfono Celular (WhatsApp)</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={16} />
                <input type="tel" placeholder="Ej. 0987654321" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label>Facultad de Dependencia</label>
              <div className="input-with-icon">
                <GraduationCap className="input-icon" size={16} />
                <select value={faculty} onChange={(e) => setFaculty(e.target.value)} style={{ paddingLeft: "2.5rem" }}>
                  {FACULTADES && FACULTADES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <div className="input-group">
          <label>Correo Institucional o Personal</label>
          <div className="input-with-icon">
            <Send className="input-icon" size={16} />
            <input type="email" placeholder="usuario@utb.edu.ec" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="input-group">
          <label>Contraseña de Acceso</label>
          <div className="input-with-icon" style={{ position: "relative" }}>
            <Check className="input-icon" size={16} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ paddingRight: "2.5rem" }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
            >
              {showPassword ? <X size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {isRegistering && (
          <div className="input-group">
            <label>Confirmar Contraseña</label>
            <div className="input-with-icon" style={{ position: "relative" }}>
              <Check className="input-icon" size={16} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{ paddingRight: "2.5rem" }}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                {showConfirmPassword ? <X size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {!isRegistering && (
          <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
            <button 
              type="button" 
              className="cta-btn cta-ghost small" 
              onClick={() => setIsForgotPassword(true)}
              style={{ fontSize: "0.8rem", color: "var(--muted)", cursor: "pointer", background: "none", border: "none" }}
            >
              ¿Olvidaste tu contraseña?
            </button>l
          </div>
        )}
        <button type="submit" className="cta-btn cta-solid" style={{ width: "100%", marginTop: "0.5rem", padding: "0.9rem" }}>
          {isRegistering ? "Finalizar Mi Registro" : "Iniciar Sesión e Ingresar"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.2rem" }}>
        <button type="button" className="cta-btn cta-ghost small" onClick={() => { setIsRegistering(!isRegistering); setPassword(""); setConfirmPassword(""); }}>
          {isRegistering ? "¿Ya posees una cuenta registrada? Inicia Sesión" : "¿Eres nuevo emprendedor? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
}

const FAQ_DATA = {
  cliente: [
    {
      q: "¿Cómo realizo un pedido a un emprendimiento?",
      a: "Para hacer un pedido, entra a la tarjeta del negocio en el catálogo, selecciona tus productos/cantidades y presiona el botón 'Realizar Pedido por WhatsApp'. Esto te abrirá un chat directo con el emprendedor."
    },
    {
      q: "¿Dónde se entregan los productos dentro de la UTB?",
      a: "Cada emprendimiento especifica su zona de entrega (Ej: Puerta 1, Puerta 2, Áreas Verdes o Facultad). Puedes coordinar el punto exacto de encuentro al escribirles por WhatsApp."
    },
    {
      q: "¿Los precios publicados son finales?",
      a: "Sí, todos los precios mostrados en el catálogo son establecidos directamente por los estudiantes emprendedores."
    },
    {
      q: "¿Puedo calificar o dejar una reseña a un negocio?",
      a: "¡Sí! Inicia sesión con tu cuenta, entra al detalle del emprendimiento y en la sección inferior podrás dejar tu valoración con estrellas y un comentario."
    }
  ],
  empleador: [
    {
      q: "¿Cómo puedo registrar mi emprendimiento?",
      a: "Inicia sesión en la plataforma, abre el menú superior y presiona el botón '+ Registrar Comercio'. Llena la información de tu negocio, productos y fotos."
    },
    {
      q: "📸 Error al subir imágenes o fotos",
      a: "Para evitar fallos de cuota en Firestore, procesamos las imágenes mediante ImgBB. Asegúrate de que el archivo sea JPG/PNG y no supere los 5MB para generar el enlace CDN correctamente."
    },
    {
      q: "¿Tiene algún costo publicar mi negocio en EmprendeUTB?",
      a: "No, la plataforma es 100% gratuita para la comunidad universitaria de la Universidad Técnica de Babahoyo (FAFI, FACS, FCJSE, FACIAG)."
    },
    {
      q: "¿Cómo sé cuántas personas han visto mi emprendimiento?",
      a: "El sistema registra automáticamente las visitas y clics hacia tu WhatsApp en la base de datos de la plataforma."
    }
  ]
};

function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null); // 'cliente' | 'empleador' | null
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [input, setInput] = useState("");
  const [customMessages, setCustomMessages] = useState([]);

  const resetChat = () => {
    setRole(null);
    setSelectedFaq(null);
    setCustomMessages([]);
  };

  const processBotResponse = (userText) => {
    const text = userText.toLowerCase();
    
    if (text.includes("imagen") || text.includes("foto") || text.includes("subir") || text.includes("error")) {
      return "💡 Para evitar errores en Firebase/ImgBB, asegura que la foto sea JPG/PNG y pese menos de 5MB.";
    }
    if (text.includes("facultad") || text.includes("utb") || text.includes("fafi")) {
      return "🏫 EmprendeUTB está disponible para FAFI, FACS, FCJSE y FACIAG.";
    }
    return "Entendido. Tu consulta sobre el ecosistema commercial UTB ha sido registrada.";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: "user" };
    const botReply = { id: Date.now() + 1, text: processBotResponse(input), sender: "bot" };

    setCustomMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
  };

  return (
    <div className="support-chat-container">
      <style>{`
        .support-floating-bubble {
          width: 56px;np
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--utb-green, #10B981);
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          box-shadow: 0 4px 20px rgba(13,71,43,0.35);
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .support-floating-bubble:hover {
          transform: scale(1.08);
        }
        .support-chat-window {
          width: 360px;
          max-height: 520px;
          height: 80vh;
          background: var(--ink-elevated, #1e293b);
          color: var(--text, #f8fafc);
          border-radius: 20px;
          border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chatAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes chatAppear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-window-header {
          background: var(--utb-green, #10B981);
          padding: 1rem 1.2rem;
          color: #FFFFFF;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-main-title {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .chat-status-sub {
          font-size: 0.72rem;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          background: #25D366;
          border-radius: 50%;
          display: inline-block;
        }
        .chat-body-viewport {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          font-size: 0.88rem;
        }
        .role-btn {
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: inherit;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
        }
        .faq-btn {
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          border: 1px solid var(--utb-green, #10B981);
          background: transparent;
          color: inherit;
          font-size: 0.82rem;
          cursor: pointer;
          text-align: left;
          line-height: 1.3;
        }
        .chat-input-row {
          display: flex;
          padding: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          gap: 0.5rem;
          background: rgba(0,0,0,0.1);
        }
        .chat-input-row input {
          flex: 1;
          font-size: 0.85rem;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: inherit;
        }
        .chat-submit-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: var(--utb-green, #10B981);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .support-chat-window {
            width: calc(100% - 32px) !important;
            right: 16px !important;
            bottom: 85px !important;
          }
        }
      `}</style>

      {/* BOTÓN FLOTANTE */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="support-floating-bubble" aria-label="Abrir Soporte">
          <MessageSquare size={24} color="#FFF" />
        </button>
      )}

      {/* VENTANA DEL CHAT */}
      {isOpen && (
        <div className="support-chat-window">
          <div className="chat-window-header">
            <div>
              <div className="chat-main-title">Asistente EmprendeUTB</div>
              <div className="chat-status-sub"><span className="status-dot" /> En línea</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {role && (
                <button onClick={resetChat} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} title="Reiniciar">
                  <RefreshCw size={16} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chat-body-viewport">
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "10px", borderLeft: "3px solid var(--utb-green, #10B981)" }}>
              👋 ¡Hola! Selecciona tu perfil o escribe tu duda en la parte inferior:
            </div>

            {/* SELECCIÓN DE ROL */}
            {!role && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
                <button className="role-btn" onClick={() => setRole("cliente")}>
                  🛍️ Soy Cliente / Comprador
                </button>
                <button className="role-btn" onClick={() => setRole("empleador")}>
                  💼 Soy Emprendedor / Vendedor
                </button>
              </div>
            )}

            {/* PREGUNTAS FRECUENTES DEL ROL */}
            {role && !selectedFaq && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>
                  Preguntas habituales para {role === "cliente" ? "Clientes" : "Emprendedores"}:
                </p>
                {FAQ_DATA[role].map((item, index) => (
                  <button key={index} className="faq-btn" onClick={() => setSelectedFaq(item)}>
                    ❓ {item.q}
                  </button>
                ))}
                <button 
                  onClick={() => setRole(null)} 
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", marginTop: "0.4rem" }}
                >
                  <ArrowLeft size={14} /> Cambiar perfil
                </button>
              </div>
            )}

            {/* DETALLE DE PREGUNTA SELECCIONADA */}
            {selectedFaq && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ alignSelf: "flex-end", background: "var(--utb-green, #10B981)", color: "#fff", padding: "0.6rem 0.8rem", borderRadius: "12px 12px 0 12px", maxWidth: "85%" }}>
                  {selectedFaq.q}
                </div>
                <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", padding: "0.75rem", borderRadius: "12px 12px 12px 0", borderLeft: "3px solid #3b82f6", lineHeight: "1.4" }}>
                  💡 {selectedFaq.a}
                </div>
                <button 
                  onClick={() => setSelectedFaq(null)} 
                  style={{ alignSelf: "center", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "inherit", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", cursor: "pointer", marginTop: "0.4rem" }}
                >
                  ↩️ Ver otras preguntas
                </button>
              </div>
            )}

            {/* MENSAJES LIBRES DEL USUARIO */}
            {customMessages.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background: msg.sender === "user" ? "var(--utb-green, #10B981)" : "rgba(255,255,255,0.08)",
                color: "#fff",
                padding: "0.6rem 0.85rem",
                borderRadius: msg.sender === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
                maxWidth: "85%"
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* INPUT PARA ESCRIBIR */}
          <form onSubmit={handleSendMessage} className="chat-input-row">
            <input 
              placeholder="Escribe una pregunta libre..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit" className="chat-submit-btn">
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

// CONFIGURACIÓN E INSTANCIACIÓN DE FIREBASE
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
const auth = getAuth(app);

// 🟢 COMPONENTE DE EDICIÓN DE PERFIL (Colócalo arriba de export default function App)
function ProfileView({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photoURL: user?.photoURL || ""
  });
  const [savedMessage, setSavedMessage] = useState(false);
  const handleImage = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setFormData(prev => ({
      ...prev,
      photoURL: reader.result
    }));
  };

  reader.readAsDataURL(file);
};
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const updatedUser = {
      ...user,
      ...formData
    };

    // Guardar en Firestore
    await setDoc(
      doc(db, "users", updatedUser.id),
      updatedUser,
      { merge: true }
    );

    // Guardar también en localStorage
    localStorage.setItem(
      "utb_logged_user",
      JSON.stringify(updatedUser)
    );

    const venturesSnapshot = await getDocs(collection(db, "ventures"));

for (const ventureDoc of venturesSnapshot.docs) {

    const venture = ventureDoc.data();

    if (venture.owner === updatedUser.name) {

    console.log("Usuario actualizado:", updatedUser);
    console.log("ID:", updatedUser.id);
    console.log("DB:", db);

        await setDoc(
            doc(db, "ventures", ventureDoc.id),
            {
                ...venture,
                ownerPhoto: updatedUser.photoURL
            },
            { merge: true }
        );

    }

}

    onSave(updatedUser);

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);

 } catch (error) {
  console.error("ERROR:", error);
  alert(error.message);
}
};

  return (
    <div className="shell" style={{ marginTop: "2rem", maxWidth: "500px" }}>
      <h2>Editar Perfil</h2>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Actualiza tus datos de cuenta universitarios.
      </p>

      {savedMessage && (
        <div style={{ padding: "0.75rem", background: "#10B98122", color: "#10B981", borderRadius: "8px", marginBottom: "1rem" }}>
          ¡Perfil actualizado con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>

  <img
    src={
      formData.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    alt="Perfil"
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid #0D472B",
      marginBottom: "10px"
    }}
  />

  <input
    type="file"
    accept="image/*"
    onChange={handleImage}
  />

</div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>Nombre Completo</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>Correo Institucional o Personal</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>Teléfono / WhatsApp</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            placeholder="0991234567"
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button type="submit" className="cta-btn cta-solid" style={{ flex: 1 }}>
            Guardar Cambios
          </button>
          <button type="button" className="cta-btn cta-ghost" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeFaculty, setActiveFaculty] = useState("Todas");
  const [activeLocation, setActiveLocation] = useState("Todas");
  const [maxPrice, setMaxPrice] = useState(30);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editingVenture, setEditingVenture] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("utb_theme") === "dark");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("utb_logged_user")));
  const [ventures, setVentures] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ventures"));
        const list = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          reviews: [], 
          views: 0, 
          whatsappClicks: 0, 
          faculty: FACULTADES[0],
          ...doc.data() 
        }));
        setVentures(list);
      } catch (error) { 
        console.error("Error crítico de red al sincronizar Firestore:", error); 
      }
    };
    loadData();
  }, [view, user]);

  useEffect(() => {
    localStorage.setItem("utb_theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  useEffect(() => {
    if (view === "home") {
      window.history.replaceState({ view: "home" }, "");
    } else {
      window.history.pushState({ view }, "");
    }

    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView("home");
      }
      setSelectedId(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [view]);

  const filtered = useMemo(() => {
    return ventures.filter((v) => {
      const matchesCategory = activeCategory === "Todas" || v.category === activeCategory;
      const matchesFaculty = activeFaculty === "Todas" || v.faculty === activeFaculty;
      const matchesLocation = activeLocation === "Todas" || v.location === activeLocation;
      const matchesPrice = v.products && v.products.some(p => Number(p.price) <= maxPrice);
      
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || 
        v.name.toLowerCase().includes(q) || 
        (v.products && v.products.some((p) => p.name.toLowerCase().includes(q)));
        
      return matchesCategory && matchesFaculty && matchesLocation && matchesPrice && matchesQuery;
    });
  }, [ventures, query, activeCategory, activeFaculty, activeLocation, maxPrice]);

  const selected = ventures.find((v) => v.id === selectedId);

  const openDetail = async (id) => {
    setSelectedId(id);
    setView("detail");
    try {
      const docRef = doc(db, "ventures", id);
      await updateDoc(docRef, { views: increment(1) });
      setVentures(prev => prev.map(item => item.id === id ? { ...item, views: (item.views || 0) + 1 } : item));
    } catch (e) { 
      console.error("Fallo de red al registrar telemetría de visualización:", e); 
    }
  };

  const goHome = () => { 
    setView("home"); 
    setSelectedId(null); 
  };

  const handleVentureUpdateFromReview = (updatedVenture) => {
    setVentures(prev => prev.map(item => item.id === updatedVenture.id ? updatedVenture : item));
  };

  return (
    <div className={`app-root ${darkMode ? "dark-mode-active" : ""}`}>
      <style>{`
        :root {
          --utb-green: #0D472B; --utb-blue: #8C9F2A;
          --ink: #F4F6F4; --ink-elevated: #FFFFFF;
          --glass-border: rgba(13, 71, 43, 0.15); --text: #1E293B; --muted: #64748B;
        }
        .dark-mode-active {
          --ink: #0F172A; --ink-elevated: #1E293B;
          --glass-border: rgba(255, 255, 255, 0.1); --text: #F8FAFC; --muted: #94A3B8;
        }
        * { box-sizing: border-box; transition: background 0.25s ease, border-color 0.25s ease; }
        body { margin: 0; padding: 0; }
        .app-root { font-family: 'Inter', system-ui, sans-serif; background: var(--ink); color: var(--text); min-height: 100vh; padding-bottom: 4rem; }
        h1, h2, h3, h4, h5 { font-family: 'Space Grotesk', sans-serif; margin: 0; color: var(--text); font-weight: 700; }
        input, select, textarea { background: var(--ink-elevated); border: 1px solid var(--glass-border); border-radius: 10px; padding: 0.65rem 0.85rem; width: 100%; color: var(--text); outline: none; font-size: 0.9rem; }
        input:focus, select:focus, textarea:focus { border-color: var(--utb-green); }
        .shell { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
        
        button, .back-btn, .cta-btn, .pill {
          font-family: 'Inter', sans-serif;
          outline: none;
          border: none;
          background: none;
          cursor: pointer;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted);
          font-size: 0.88rem;
          font-weight: 600;
          padding: 0.6rem 1rem;
          background: var(--ink-elevated);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          color: var(--utb-green);
          border-color: var(--utb-green);
          box-shadow: 0 2px 8px rgba(13, 71, 43, 0.08);
        }

        /* NAVBAR PREMIUM */
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; background: var(--ink-elevated); border-bottom: 1px solid var(--glass-border); box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .navbar-brand-cluster { display: flex; align-items: center; gap: 0.8rem; user-select: none; }
        .navbar-logo-graphic { width: 38px; height: 38px; object-fit: contain; }
        .navbar-titles-wrapper { display: flex; flex-direction: column; }
        .navbar-main-brand-title { font-size: 1.25rem; font-weight: 800; color: var(--utb-green); letter-spacing: -0.02em; }
        .navbar-faculty-subtitle { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted); }
        .navbar-actions-group { display: flex; align-items: center; gap: 1.2rem; }
        
        .cta-btn { padding: 0.65rem 1.25rem; border-radius: 999px; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.45rem; border: 1px solid transparent; }
        .cta-solid {
  background: var(--utb-green);
  border: 1px solid var(--utb-green);
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(13, 71, 43, 0.35);
  transition: all 0.2s ease;
}

.cta-solid:hover {
  background: #0A3A23;
  border-color: #0A3A23;
}
        .cta-ghost { border: 1px solid var(--glass-border); color: var(--text); background: var(--ink-elevated); transition: all 0.2s ease; }
        .cta-ghost:hover { border-color: var(--utb-green); color: var(--utb-green); background: rgba(13, 71, 43, 0.02); }
        .cta-btn.small { padding: 0.45rem 0.85rem; font-size: 0.78rem; }
        .cta-btn.full { width: 100%; justify-content: center; }
        .icon-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; background: var(--ink-elevated); color: var(--text); }
        .icon-btn:hover { border-color: var(--utb-green); color: var(--utb-green); }

        /* HERO INSTITUCIONAL */
        .hero { max-width: 1180px; margin: 3rem auto 0; padding: 0 1.5rem; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center; }
        .hero h1 { font-size: 3rem; line-height: 1.1; letter-spacing: -0.03em; }
        .hero-green-gradient-text { color: var(--utb-green); background: none; -webkit-background-clip: initial; background-clip: initial; }
        .hero p.lead { margin-top: 1.2rem; font-size: 1.1rem; line-height: 1.6; color: var(--muted); max-width: 48ch; }
        .search-box { display: flex; align-items: center; gap: 0.6rem; background: var(--ink-elevated); border: 1px solid var(--glass-border); border-radius: 999px; padding: 0.75rem 1.25rem; max-width: 460px; margin-top: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .search-box input { border: none; background: transparent; width: 100%; padding: 0; font-size: 0.95rem; }
        .hero-graphics-cluster { display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--ink-elevated); border: 1px solid var(--glass-border); padding: 3rem 2rem; border-radius: 24px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.01); }
        .hero-center-crest {
  max-width: 40%;
  height: auto;
  object-fit: contain;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  margin-bottom: 1.5rem;
}
        .hero-metric-tag { background: var(--ink); border: 1px solid var(--glass-border); width: 100%; border-radius: 14px; padding: 1rem; text-align: center; }
        .eyebrow { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; }

        /* DIVISOR DE ONDA */
        .river-divider { max-width: 1180px; margin: 3.5rem auto 2.5rem; padding: 0 1.5rem; }
        .river-path { stroke-dasharray: 6 8; animation: riverFlowingEffect 12s linear infinite; }
        @keyframes riverFlowingEffect { to { stroke-dashoffset: -200; } }

        /* FILTROS Y SIDEBAR */
        .sidebar-panel { background: var(--ink-elevated); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1.25rem; box-shadow: 0 4px 15px rgba(0,0,0,0.01); }
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem; }
        .pill { padding: 0.5rem 1.1rem; border-radius: 999px; border: 1px solid var(--glass-border); background: var(--ink-elevated); color: var(--text); font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease; }
        .pill:hover { border-color: var(--utb-green); color: var(--utb-green); }
        .pill-active { background: var(--utb-green); color: #FFFFFF !important; border-color: var(--utb-green); }
        
        /* BENTO GRID COMERCIAL */
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .venture-card { position: relative; border-radius: 18px; overflow: hidden; border: 1px solid var(--glass-border); background: var(--ink-elevated); text-align: left; display: flex; flex-direction: column; width: 100%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.01); transform: translateY(0); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .venture-card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }
        .venture-card-image { width: 100%; height: 160px; background-size: cover; background-position: center; border-bottom: 1px solid var(--glass-border); }
        .default-gradient-bg { width: 100%; height: 160px; background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #FFFFFF; gap: 0.4rem; }
        .default-gradient-bg span { font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
        .venture-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
        .card-top-meta { display: flex; justify-content: space-between; align-items: center; }
        .rating-badge { background: rgba(255, 176, 0, 0.12); color: #FFB000; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; }
        .card-owner-text { font-size: 0.88rem; font-weight: 500; margin: 0; }
        .card-faculty-tag-badge { font-size: 0.7rem; background: rgba(13, 71, 43, 0.08); color: var(--utb-green); padding: 0.15rem 0.4rem; border-radius: 4px; width: fit-content; font-weight: 600; }
        .card-location-footer { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; color: var(--muted); margin-top: auto; padding-top: 0.6rem; border-top: 1px solid var(--glass-border); }
        .venture-card-glow { position: absolute; width: 80px; height: 80px; border-radius: 50%; filter: blur(40px); opacity: 0.12; top: -30px; right: -30px; }
        .no-results { grid-column: 1 / -1; text-align: center; padding: 5rem 0; color: var(--muted); font-size: 0.95rem; }

        /* DETALLE DE EMPRENDIMIENTOS */
        .detail-view { max-width: 1180px; margin: 0 auto; padding: 1.5rem; }
        .detail-nav-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .detail-banner { position: relative; border-radius: 24px; overflow: hidden; height: 320px; border: 1px solid var(--glass-border); background: #000000; }
        .detail-banner-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
        .detail-banner-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.85)); z-index: 1; }
        .detail-banner-content { position: absolute; bottom: 2rem; left: 2rem; right: 2rem; z-index: 2; color: #FFFFFF; }
        .detail-banner-content h1 { font-size: 2.5rem; color: #FFFFFF; margin: 0.3rem 0; letter-spacing: -0.02em; }
        .subtitle-owner, .subtitle-career { display: flex; align-items: center; gap: 0.5rem; color: #E2E8F0; font-size: 0.95rem; margin: 0.2rem 0; }
        .detail-location-tag { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #CBD5E1; margin-top: 0.6rem; background: rgba(255,255,255,0.1); padding: 0.3rem 0.75rem; border-radius: 999px; }
        
        /* PANEL ANALÍTICO */
        .stats-dashboard { background: rgba(13, 71, 43, 0.05); border: 1px solid var(--utb-green); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.6rem; margin-bottom: 1rem; }
        .badge-live { background: var(--utb-green); color: #FFFFFF; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .stat-box { background: var(--ink-elevated); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 0.8rem; }
        .stat-icon-wrapper { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(13,71,43,0.08); color: var(--utb-green); }
        .whatsapp-stat .stat-icon-wrapper { background: rgba(37, 211, 102, 0.1); color: #25D366; }
        .rating-stat .stat-icon-wrapper { background: rgba(255, 176, 0, 0.1); color: #FFB000; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; }
        .stat-value { font-size: 1.3rem; color: var(--text); font-weight: 800; }

        /* GRID INTERNO */
        .detail-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 3rem; margin-top: 2.5rem; }
        .content-block { margin-bottom: 2.5rem; }
        .detail-main h2 { font-size: 1.4rem; margin-bottom: 1rem; position: relative; padding-left: 0.75rem; }
        .detail-main h2::before { content: ""; position: absolute; left: 0; top: 4px; bottom: 4px; width: 4px; background: var(--utb-green); border-radius: 2px; }
        .body-text { line-height: 1.7; color: var(--text); font-size: 0.98rem; text-align: justify; }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; margin-top: 1rem; }
        .product-card { border: 1px solid var(--glass-border); border-radius: 14px; background: var(--ink-elevated); overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.01); }
        .product-card-img { width: 100%; height: 130px; object-fit: cover; border-bottom: 1px solid var(--glass-border); display: block; }
        .product-card-placeholder { height: 130px; display: flex; align-items: center; justify-content: center; }
        .product-card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .product-card-row { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; }
        .product-card-row h4 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
        .price { font-weight: 800; font-size: 1.05rem; }
        .product-description-text { font-size: 0.82rem; line-height: 1.4; }

        /* ASIDE DE CONVERSIONES */
        .contact-card { border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.75rem; background: var(--ink-elevated); align-self: start; box-shadow: 0 4px 20px rgba(0,0,0,0.01); position: sticky; top: 20px; }
        .contact-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem; }
        .verified-tag { font-size: 0.65rem; font-weight: 700; background: rgba(13,71,43,0.08); color: var(--utb-green); padding: 0.25rem 0.6rem; border-radius: 999px; display: flex; align-items: center; gap: 0.2rem; text-transform: uppercase; }
        .contact-row { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 0; border-bottom: 1px solid var(--glass-border); text-decoration: none; }
        .contact-icon-bg { width: 32px; height: 32px; border-radius: 8px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 0.8rem; font-weight: 700; }
        .contact-info-text { display: flex; flex-direction: column; }
        .contact-label { font-size: 0.72rem; color: var(--muted); font-weight: 500; }
        .contact-value { font-size: 0.88rem; font-weight: 600; color: var(--text); }

        /* FEEDBACK / RESEÑAS */
        .review-form { background: var(--ink-elevated); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 16px; margin-top: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
        .review-item { background: var(--ink-elevated); border: 1px solid var(--glass-border); padding: 1.2rem; border-radius: 12px; display: flex; flex-direction: column; gap: 0.4rem; margin-top: 1rem; }
        .review-item-header { display: flex; justify-content: space-between; align-items: center; }
        .stars-rendered { color: #FFB000; font-size: 0.85rem; }
        .review-text-content { font-size: 0.88rem; margin: 0; }
        .review-item-footer { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--muted); }

        /* FORMULARIOS DE REGISTRO */
        .form-view { max-width: 780px; margin: 0 auto; padding: 2rem 1.5rem; }
        .form-view h1 { font-size: 2.2rem; letter-spacing: -0.02em; }
        .form-section { background: var(--ink-elevated); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.75rem; margin-top: 1.5rem; }
        .section-form-title { font-size: 1.15rem; color: var(--utb-green); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.4rem; margin-bottom: 1.2rem; }
        .form-row { display: grid; gap: 1.25rem; margin-bottom: 1.25rem; }
        .form-row.two { grid-template-columns: repeat(2, 1fr); }
        .form-row.three { grid-template-columns: repeat(3, 1fr); }
        .file-uploader-wrapper { display: flex; gap: 0.75rem; align-items: center; margin-top: 0.25rem; }
        .product-form-row { background: var(--ink); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--glass-border); margin-bottom: 1rem; }
        .product-item-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        label { display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.82rem; color: var(--muted); font-weight: 700; text-transform: uppercase; }
        .color-row { display: flex; align-items: center; gap: 0.75rem; }
        .color-row input[type="color"] { width: 45px; height: 40px; padding: 0; background: none; border: none; cursor: pointer; }
        
        /* AUTENTICACIÓN */
        .auth-card-container { max-width: 460px; padding: 2.5rem 2rem; background: var(--ink-elevated); border-radius: 20px; border: 1px solid var(--glass-border); margin: 4rem auto; box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
        .auth-form-body { display: flex; flex-direction: column; gap: 1.1rem; margin-top: 1rem; }
        .auth-view-toggle-footer { text-align: center; margin-top: 1.2rem; font-size: 0.85rem; }
        .toggle-interactive-link { color: var(--utb-green); font-weight: 700; cursor: pointer; }
        .support-floating-bubble { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--utb-green); position: fixed; bottom: 24px; right: 24px; z-index: 999; box-shadow: 0 4px 20px rgba(13,71,43,0.3); }
        .support-chat-window { width: 330px; height: 430px; background: var(--ink-elevated); border-radius: 20px; border: 1px solid var(--glass-border); box-shadow: 0 12px 40px rgba(0,0,0,0.12); position: fixed; bottom: 24px; right: 24px; z-index: 1000; display: flex; flex-direction: column; overflow: hidden; }
        .chat-window-header { background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); padding: 1.2rem; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; }
        .chat-header-titles { display: flex; flex-direction: column; }
        .chat-main-title { font-size: 0.95rem; font-weight: 700; color: #FFFFFF; }
        .chat-status-sub { font-size: 0.7rem; opacity: 0.85; }
        .chat-messages-viewport { flex: 1; padding: 1.2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; }
        .chat-bubble { max-width: 85%; padding: 0.65rem 0.9rem; border-radius: 14px; font-size: 0.82rem; }
        .bubble-user { align-self: flex-end; background: var(--utb-green); color: #FFFFFF; border-bottom-right-radius: 2px; }
        .bubble-bot { align-self: flex-start; background: rgba(0,0,0,0.05); color: var(--text); border-bottom-left-radius: 2px; }
        .chat-input-row { display: flex; padding: 0.75rem; border-top: 1px solid var(--glass-border); gap: 0.5rem; }
        .chat-input-row input { font-size: 0.85rem; padding: 0.5rem 0.75rem; }

        .success-state { max-width: 500px; margin: 6rem auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--utb-green), var(--utb-blue)); display: flex; align-items: center; justify-content: center; color: #FFFFFF; }
        .font-small { font-size: 0.85rem; }

        /* --- ARREGLO GLOBAL PARA PANTALLA EN BLANCO Y DESBORDE RESPONSIVO --- */
        html, body, #root, .app-root {
          max-width: 100% !important;
          width: 100% !important;
          overflow-x: hidden !important;
        }

        /* --- CONTROL DISPOSITIVOS MÓVILES (MÁXIMO 860px) --- */
        @media (max-width: 860px) {
          .navbar {
            position: relative !important;
            padding: 1rem 1.5rem !important;
          }

          /* Hace visible el botón hamburguesa en móviles */
          .hamburger-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: var(--text);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            z-index: 100001;
          }

          /* Oculta y transforma el contenedor de acciones en un panel flotante */
          .navbar-actions-group {
            display: none !important;
            flex-direction: column !important;
            align-items: stretch !important;
            position: absolute !important;
            top: 100% !important;
            right: 1.5rem !important;
            left: 1.5rem !important;
            background: var(--ink-elevated) !important;
            border: 1px solid var(--glass-border) !important;
            border-radius: 16px !important;
            padding: 1.5rem !important;
            gap: 1rem !important;
            z-index: 100000 !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
          }

          /* Muestra el panel cuando el estado mobileMenu sea true */
          .navbar-actions-group.mobile-open {
            display: flex !important;
          }

          .user-nav-container {
            flex-direction: column !important;
            width: 100% !important;
            gap: 1rem !important;
            align-items: center !important;
          }

          .navbar-actions-group .cta-btn,
          .navbar-actions-group .icon-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.75rem !important;
          }

          /* --- RESPONSIVE DE ELEMENTOS DE LA VITRINA --- */
          .hero { grid-template-columns: 1fr; text-align: center; margin-top: 1.5rem; gap: 2rem; }
          .hero h1 { font-size: 2.2rem; }
          .hero p.lead { margin: 1rem auto 0; }
          .search-box { margin: 1.5rem auto 0; width: 100% !important; max-width: 100% !important; }
          .bento-grid { grid-template-columns: 1fr; }
          .detail-grid { grid-template-columns: 1fr; gap: 2rem; }
          .products-grid { grid-template-columns: 1fr; }
          .form-row.two, .form-row.three { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
          .shell { padding: 0 12px !important; }
        }

        /* Oculta por defecto el botón hamburguesa en computadoras */
        @media (min-width: 861px) {
          .hamburger-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* NAV BAR PREPARADO CON MENÚ HAMBURGUESA EXTRACTO */}
      <nav className="navbar" style={{ position: 'relative' }}>
        <div className="navbar-brand-cluster" onClick={goHome} style={{ cursor: "pointer" }}>
          <img 
            src="https://ricardomedinao.wordpress.com/wp-content/uploads/2011/12/utb_logo_verdea.png" 
            alt="Logo Institucional UTB" 
            className="navbar-logo-graphic" 
          />
          <div className="navbar-titles-wrapper">
            <span className="navbar-main-brand-title">EmprendeUTB</span>
            <span className="navbar-faculty-subtitle">Universidad Técnica de Babahoyo</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

  <button
    className="icon-btn"
    onClick={() => setDarkMode(!darkMode)}
    aria-label="Cambiar tema"
  >
    {darkMode
      ? <Sun size={18} style={{ color: "#FFB000" }} />
      : <Moon size={18} />}
  </button>

  <button
    className="hamburger-btn"
    onClick={() => setMobileMenu(!mobileMenu)}
    type="button"
    aria-label="Alternar menú"
  >
    {mobileMenu ? (
      <X size={24} />
    ) : (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    )}
  </button>

</div>

        
      <div className={`navbar-actions-group ${mobileMenu ? "mobile-open" : ""}`}>
            {user ? (
              <div className="user-nav-container" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}
>

  <img
    src={
      user.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    alt={user.name}
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />

  <span style={{ fontWeight: "700" }}>
    {user.name}
  </span>

</div>
               
<button 
    type="button"
    className="cta-btn cta-ghost small"
    onClick={() => {
      setView("profile");
      setMobileMenu(false);
    }}
  >
    ✏️ Editar Perfil
  </button>

  {view === "home" && (
  <button 
    type="button" 
    className="cta-btn cta-solid small" 
    onClick={(e) => { 
      e.preventDefault();
      e.stopPropagation();
      setEditingVenture(null);
      setView("register"); 
      setMobileMenu(false); 
    }}
  >
    <Plus size={14} /> Registrar Comercio
  </button>
)}
  
              <button className="cta-btn cta-ghost small" onClick={() => { localStorage.removeItem("utb_logged_user"); setUser(null); setMobileMenu(false); goHome(); }}>Cerrar Sesión</button>
            </div>
          ) : (
            view === "home" && <button className="cta-btn cta-solid" onClick={() => { setView("auth"); setMobileMenu(false); }}>Acceso Emprendedor</button>
          )}
        </div>
      </nav>

      {view === "home" && (
        <div className="shell" style={{ marginTop: "2rem" }}>
          <header className="hero">
            <div>
              <h1>Emprendedores <span className="hero-green-gradient-text">UTB</span></h1>
              <p className="lead">El espacio oficial multiclave diseñado para impulsar, buscar y coordinar las actividades comerciales de los estudiantes de todas las Facultades del campus.</p>
              <div className="search-box">
                <Search size={16} className="muted" />
                <input placeholder="Buscar almuerzos, tecnología, papelería..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
            <div className="hero-graphics-cluster">
              <img src="https://ricardomedinao.wordpress.com/wp-content/uploads/2011/12/utb_logo_verdea.png" alt="UTB Escudo" className="hero-center-crest" />
              <div className="hero-metric-tag">
                <span className="eyebrow" style={{ color: "var(--utb-green)" }}>Módulo de Indexación</span>
                <strong style={{ display: "block", fontSize: "1.1rem", margin: "0.15rem 0" }}>{ventures.length} Negocios Registrados</strong>
                <span className="muted small" style={{ fontSize: "11px" }}>Ecosistema Universitario Integrado</span>
              </div>
            </div>
          </header>

          <RiverDivider />

          {/* SIDEBAR COMPACTADO DE FILTROS INTEGRALES */}
          <div className="sidebar-panel">
            <div>
              <h5><Briefcase size={13} style={{ marginRight: "4px" }} /> Filtrar por Sector Comercial</h5>
              <div className="filters">
                <Pill active={activeCategory === "Todas"} onClick={() => setActiveCategory("Todas")}>Todos los sectores</Pill>
                {CATEGORIES.map(c => <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>{c}</Pill>)}
              </div>
            </div>
            
            <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.8rem" }}>
              <h5><Building size={13} style={{ marginRight: "4px" }} /> Filtrar por Unidad Académica / Facultad</h5>
              <div className="filters">
                <Pill active={activeFaculty === "Todas"} onClick={() => setActiveFaculty("Todas")}>Todas las Facultades</Pill>
                {FACULTADES.map(f => <Pill key={f} active={activeFaculty === f} onClick={() => setActiveFaculty(f)}>{f.split(" (")[0]}</Pill>)}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.8rem" }}>
              <h5>📍 Segmentar por Campus o Zona Geográfica</h5>
              <div className="filters">
                <Pill active={activeLocation === "Todas"} onClick={() => setActiveLocation("Todas")}>Cualquier zona</Pill>
                {LOCATIONS.map(l => <Pill key={l} active={activeLocation === l} onClick={() => setActiveLocation(l)}>{l.split(" - ")[1] || l.split(" (")[0]}</Pill>)}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.8rem" }}>
              <h5>💵 Presupuesto Máximo de Compra: <span style={{ color: "var(--utb-green)" }}>${maxPrice.toFixed(2)}</span></h5>
              <input type="range" min="0.5" max="40" step="0.5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ cursor: "pointer" }} />
            </div>
          </div>

          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Catálogo de Emprendimientos</h3>
            <span className="muted font-small">{filtered.length} negocio(s) encontrado(s)</span>
          </div>

          <div className="bento-grid">
            {filtered.length === 0 && <p className="muted no-results">Ningún proyecto comercial coincide con los filtros de búsqueda seleccionados.</p>}
            {filtered.map((v, idx) => <VentureCard key={v.id} v={v} onOpen={openDetail} big={idx === 0} />)}
          </div>
        </div>
      )}

      {/* OTRAS VISTAS CONDICIONALES */}
      {view === "auth" && (
        <AuthView onCancel={goHome} onAuthSuccess={(u) => { setUser(u); setView("home"); }} />
      )}

      {/* 🟢 VISTA DE EDICIÓN DE PERFIL */}
      {view === "profile" && (
        <ProfileView
  user={user}
  onSave={async (updatedUser) => {

    setUser(updatedUser);

    await updateUserVentures(updatedUser);

    goHome();
  }}
  onCancel={goHome}
/>
      )}

  {/* VISTA DE REGISTRO / EDICIÓN DE EMPRENDIMIENTO */}
      {view === "register" && (
        <RegisterView 
          onCancel={goHome} 
          currentUser={user} 
          editingVenture={editingVenture || selected}
          onSubmit={async (finalData) => {
            try {
              // Guarda o actualiza directamente en la colección 'ventures' en Firestore
              await setDoc(doc(db, "ventures", finalData.id), finalData);
              
              // Actualiza el estado local en App.jsx para ver el cambio de inmediato
              setVentures(prev => {
                const exists = prev.some(v => v.id === finalData.id);
                if (exists) {
                  return prev.map(v => v.id === finalData.id ? finalData : v);
                }
                return [finalData, ...prev];
              });
              
              
              alert("¡Información guardada con éxito en la base de datos!");
              goHome();
            } catch (error) {
              console.error("Error al guardar en Firestore:", error);
              alert("Hubo un problema de conexión al guardar los datos en la nube.");
            }
          }} 
        />
      )}
      
      {/* VISTA DE DETALLE */}
      {view === "detail" && selected && (
  <DetailView 
    venture={selected} 
    onBack={goHome} 
    currentUser={user} 
    onEditClick={(venture) => {
      setEditingVenture(venture); // <--- Guarda el emprendimiento que se va a editar
      setView("register");       // <--- Cambia a la vista del formulario
    }} 
    onVentureUpdate={handleVentureUpdateFromReview}
    onVentureDelete={(id) => {
      setVentures(prev => prev.filter(v => v.id !== id));
      goHome();
    }}
  />
)}

      <SupportChat />
    </div>
  );
}