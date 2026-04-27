import React, { useState } from "react";

const QUICK_CONDITIONS = [
  { label: "Diabetes", icon: "🩸" },
  { label: "Weight Loss", icon: "⚖️" },
  { label: "Heart Disease", icon: "❤️" },
  { label: "High BP", icon: "💊" },
  { label: "Gut Health", icon: "🫁" },
  { label: "Muscle Gain", icon: "💪" },
];

export default function AIFoodRecommendations({ onFetch, loading, result, onClear, onFoodClick }) {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = () => {
    if (inputVal.trim()) onFetch(inputVal.trim());
  };

  const handleQuick = (label) => {
    setInputVal(label);
    onFetch(label);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      borderRadius: "24px", padding: "28px 24px",
      marginTop: "32px", position: "relative", overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(16,185,129,0.12)", filter: "blur(30px)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "12px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
            🤖
          </div>
          <div>
            <h3 style={{ color: "#fff", margin: 0, fontSize: "18px", fontWeight: 800 }}>AI Food Advisor</h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>Get personalized food recommendations</p>
          </div>
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", marginBottom: "16px" }}>
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. diabetes, weight loss, high BP..."
            style={{
              flex: 1, padding: "14px 18px", borderRadius: "14px",
              border: "2px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.08)", color: "#fff",
              fontSize: "14px", outline: "none",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !inputVal.trim()}
            style={{
              padding: "14px 20px", borderRadius: "14px", border: "none",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff", fontWeight: 700, fontSize: "14px",
              cursor: loading ? "wait" : "pointer",
              opacity: !inputVal.trim() ? 0.6 : 1,
              minWidth: "80px",
            }}
          >
            {loading ? "..." : "Ask AI"}
          </button>
        </div>

        {/* Quick chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          {QUICK_CONDITIONS.map((cond) => (
            <button key={cond.label} onClick={() => handleQuick(cond.label)}
              style={{
                padding: "7px 14px", borderRadius: "20px",
                border: "1.5px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)", color: "#e2e8f0",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
              {cond.icon} {cond.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
            <div style={{
              width: "36px", height: "36px", margin: "0 auto 12px",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTop: "3px solid #10b981", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ margin: 0, fontSize: "14px" }}>AI is analyzing your condition...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h4 style={{ color: "#10b981", margin: 0, fontSize: "15px", fontWeight: 700 }}>
                ✅ Recommendations for {result.condition}
              </h4>
              <button onClick={onClear} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                Clear ✕
              </button>
            </div>

            {/* ── Clickable Food Cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {result.recommendations?.map((food, i) => (
                <div
                  key={i}
                  onClick={() => onFoodClick && onFoodClick(food)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "14px", padding: "14px 16px",
                    border: "1px solid rgba(16,185,129,0.2)",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "12px",
                    cursor: "pointer", transition: "all 0.18s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(16,185,129,0.12)";
                    e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                      🥗 {food.name}
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>tap for recipe →</span>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.5 }}>{food.why}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "#10b981", fontWeight: 800, fontSize: "18px" }}>{food.calories}</div>
                    <div style={{ color: "#64748b", fontSize: "11px" }}>kcal</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Foods to avoid */}
            {result.foods_to_avoid?.length > 0 && (
              <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: "14px", padding: "14px 16px", marginBottom: "12px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <h5 style={{ color: "#f87171", margin: "0 0 8px", fontSize: "13px", fontWeight: 700 }}>⚠️ Foods to Avoid</h5>
                {result.foods_to_avoid.map((item, i) => (
                  <div key={i} style={{ color: "#fca5a5", fontSize: "13px", marginBottom: "4px" }}>
                    ✗ {item.name} — <span style={{ color: "#94a3b8" }}>{item.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            {result.general_tip && (
              <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: "12px", padding: "12px 16px", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p style={{ color: "#6ee7b7", margin: 0, fontSize: "13px", lineHeight: 1.6 }}>
                  💡 {result.general_tip}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}