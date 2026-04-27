import React, { useState } from "react";

const TAG_COLORS = {
  "Low Carb": "#f59e0b",
  "High Protein": "#3b82f6",
  "Weight Loss": "#10b981",
  "Heart Healthy": "#ef4444",
  "Anti-Inflammatory": "#8b5cf6",
  Vegetarian: "#22c55e",
  Vegan: "#22c55e",
  "Gluten Free": "#a78bfa",
  Healthy: "#10b981",
};

const FALLBACK = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80";

export default function FoodCard({ food, onClick }) {
  const [imgError, setImgError] = useState(false);
  const tagColor = TAG_COLORS[food.tag] || "#10b981";

  return (
    <div
      onClick={() => onClick(food)}
      style={{
        flex: "0 0 240px",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        cursor: "pointer",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        scrollSnapAlign: "start",
        minHeight: "300px",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.10)";
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "180px", overflow: "hidden", background: "#f3f4f6" }}>
        <img
          src={imgError || !food.image ? FALLBACK : food.image}
          alt={food.name}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent 60%)" }} />
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          background: tagColor, color: "#fff",
          borderRadius: "20px", padding: "3px 10px",
          fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
        }}>
          {food.tag}
        </div>
        {food.readyInMinutes && (
          <div style={{
            position: "absolute", top: "10px", right: "10px",
            background: "rgba(0,0,0,0.6)", color: "#fff",
            borderRadius: "20px", padding: "3px 8px", fontSize: "10px",
          }}>
            ⏱ {food.readyInMinutes} min
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3 }}>
            {food.name}
          </h3>
          {food.why && (
            <p style={{ margin: "0 0 10px", fontSize: "11.5px", color: "#666", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {food.why}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {food.calories > 0 ? (
              <>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>{food.calories}</span>
                <span style={{ fontSize: "11px", color: "#888", marginLeft: "3px" }}>kcal/{food.per}</span>
              </>
            ) : (
              <span style={{ fontSize: "12px", color: "#888" }}>Calories vary</span>
            )}
          </div>
          <div style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff", borderRadius: "50%",
            width: "30px", height: "30px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
          }}>›</div>
        </div>
      </div>
    </div>
  );
}