import React, { useState, useEffect } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80";

export default function FoodDetailModal({ food, onClose }) {
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("recipe");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  if (!food) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        opacity: visible ? 1 : 0, transition: "opacity 0.28s",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "28px 28px 0 0",
          width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", height: "260px", overflow: "hidden", borderRadius: "28px 28px 0 0" }}>
          <img
            src={imgError || !food.image ? FALLBACK : food.image}
            alt={food.name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 55%)" }} />
          <button onClick={handleClose} style={{
            position: "absolute", top: "14px", right: "14px",
            background: "rgba(255,255,255,0.9)", border: "none",
            borderRadius: "50%", width: "38px", height: "38px",
            cursor: "pointer", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{ position: "absolute", bottom: "16px", left: "18px", right: "18px" }}>
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 800, margin: "0 0 6px" }}>{food.name}</h2>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(food.tags?.length ? food.tags : [food.tag]).filter(Boolean).map((tag, i) => (
                <span key={i} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Calorie Strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 20px", background: "#ecfdf5", borderBottom: "1px solid #a7f3d0" }}>
          <span style={{ fontSize: "24px" }}>🔥</span>
          {food.calories > 0 ? (
            <>
              <span style={{ fontSize: "30px", fontWeight: 900, color: "#059669" }}>{food.calories}</span>
              <span style={{ color: "#065f46", fontSize: "14px" }}>kcal per {food.per}</span>
            </>
          ) : (
            <span style={{ color: "#065f46", fontSize: "15px", fontWeight: 600 }}>Calories vary by serving</span>
          )}
          {food.readyInMinutes && (
            <span style={{ marginLeft: "12px", color: "#6b7280", fontSize: "13px" }}>⏱ {food.readyInMinutes} min</span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #f0f0f0", padding: "0 20px" }}>
          {["recipe", "ingredients", "health"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "13px 0", border: "none", background: "none",
              fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "#10b981" : "#888",
              borderBottom: activeTab === tab ? "3px solid #10b981" : "3px solid transparent",
              cursor: "pointer", textTransform: "capitalize", marginBottom: "-2px",
            }}>
              {tab === "recipe" ? "📋 Recipe" : tab === "ingredients" ? "🥗 Ingredients" : "💚 Health"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "20px" }}>

          {/* Recipe Tab */}
          {activeTab === "recipe" && (
            <div>
              {food.steps?.length > 0 ? (
                <>
                  <h4 style={{ color: "#1a1a2e", fontWeight: 700, marginBottom: "14px", fontSize: "15px" }}>
                    Step-by-step Instructions
                  </h4>
                  {food.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "flex-start" }}>
                      <div style={{
                        flex: "0 0 28px", height: "28px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "13px",
                      }}>{i + 1}</div>
                      <p style={{ margin: 0, color: "#444", lineHeight: 1.6, fontSize: "13px", paddingTop: "4px" }}>{step}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p style={{ color: "#888", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
                  Recipe details not available for this item.
                </p>
              )}
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === "ingredients" && (
            <div>
              {food.ingredients?.length > 0 ? (
                <>
                  <h4 style={{ color: "#1a1a2e", fontWeight: 700, marginBottom: "14px", fontSize: "15px" }}>What you'll need</h4>
                  {food.ingredients.map((ing, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ color: "#10b981", fontSize: "14px" }}>✓</div>
                      <span style={{ color: "#333", fontSize: "13px" }}>{ing}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p style={{ color: "#888", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
                  Ingredients not available for this item.
                </p>
              )}
            </div>
          )}

          {/* Health Tab */}
          {activeTab === "health" && (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {(food.tags?.length ? food.tags : [food.tag]).filter(Boolean).map((tag, i) => (
                  <span key={i} style={{
                    background: "#10b98115", color: "#065f46",
                    border: "1.5px solid #a7f3d0", borderRadius: "20px",
                    padding: "5px 14px", fontSize: "13px", fontWeight: 600,
                  }}>{tag}</span>
                ))}
              </div>
              {food.why && (
                <div style={{ background: "#ecfdf5", borderRadius: "14px", padding: "14px", marginBottom: "14px" }}>
                  <h5 style={{ color: "#065f46", margin: "0 0 6px", fontWeight: 700, fontSize: "13px" }}>✅ Why it's recommended</h5>
                  <p style={{ color: "#047857", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{food.why}</p>
                </div>
              )}
              {food.safetyNote && (
                <div style={{ background: "#fffbeb", borderRadius: "14px", padding: "14px", marginBottom: "14px" }}>
                  <h5 style={{ color: "#92400e", margin: "0 0 6px", fontWeight: 700, fontSize: "13px" }}>⚠️ Safety note</h5>
                  <p style={{ color: "#b45309", fontSize: "13px", margin: 0 }}>{food.safetyNote}</p>
                </div>
              )}
              <p style={{ color: "#777", fontSize: "11px", padding: "12px", background: "#fafafa", borderRadius: "10px" }}>
                ⚕️ For general guidance only. Consult a healthcare professional for personalized advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}