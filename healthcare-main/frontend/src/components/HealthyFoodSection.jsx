import React, { useState } from "react";
import FoodCard from "./FoodCard";
import FoodDetailModal from "./FoodDetailModal";
import ScanFood from "./ScanFood";
import AIFoodRecommendations from "./AIFoodRecommendations";
import { useFood } from "../hooks/useFoodFeature.js";
import { HEALTHY_FOODS } from "../data/foodData";

export default function HealthyFoodSection() {
  const {
    selectedFood,
    openFood,
    closeFood,
    aiRecommendations,
    loadingRecs,
    fetchRecommendations,
    clearRecommendations,
    scrollRef,
  } = useFood();

  const [showScanner, setShowScanner] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loadingFood, setLoadingFood] = useState(false);

  const FILTERS = ["All", "Low Carb", "High Protein", "Weight Loss"];

  const filteredFoods =
    activeFilter === "All"
      ? HEALTHY_FOODS
      : HEALTHY_FOODS.filter((f) => f.tag === activeFilter);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  // ── Food click handler — backend se real data fetch karo ──
  const handleFoodClick = async (food) => {
    // Agar pehle se ingredients hain toh seedha kholo
    if (food.ingredients?.length > 0 || food.steps?.length > 0) {
      openFood(food);
      return;
    }

    setLoadingFood(true);
    try {
      const res = await fetch(
        `/api/food/search?name=${encodeURIComponent(food.name)}`
      );
      
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      openFood({
        ...food,
        name: data.name || food.name,
        image: data.image || food.image,
        calories: data.calories || food.calories,
        per: data.per || food.per || "1 serving",
        ingredients: data.ingredients || [],
        steps: data.steps || [],
        tags: data.tags?.length ? data.tags : [food.tag].filter(Boolean),
        readyInMinutes: data.readyInMinutes || null,
      });
    } catch {
      // Fallback — data nahi mila toh jo hai woh dikhao
      openFood(food);
    } finally {
      setLoadingFood(false);
    }
  };

  return (
    <>
      <section
        style={{
          padding: "32px 0 0",
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 20px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                border: "1.5px solid #a7f3d0",
                borderRadius: "20px",
                padding: "4px 12px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "14px" }}>🥗</span>
              <span
                style={{
                  color: "#065f46",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Nutrition Hub
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 900,
                color: "#1a1a2e",
                lineHeight: 1.2,
              }}
            >
              Healthy Foods
            </h2>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
              Curated for your wellness goals
            </p>
          </div>

          {/* Scan Button */}
          <button
            onClick={() => setShowScanner(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 18px",
              background: "linear-gradient(135deg, #1a1a2e, #16213e)",
              color: "#fff",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(26,26,46,0.3)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "18px" }}>📷</span>
            <span>Scan Food</span>
          </button>
        </div>

        {/* ── Filter Pills ── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "0 20px",
            marginBottom: "20px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                border: "2px solid",
                borderColor: activeFilter === filter ? "#10b981" : "#e5e7eb",
                background:
                  activeFilter === filter
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "#fff",
                color: activeFilter === filter ? "#fff" : "#6b7280",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ── Food Cards Scroll ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={scrollLeft}
            style={{
              position: "absolute", left: "8px", top: "50%",
              transform: "translateY(-50%)", zIndex: 10,
              background: "#fff", border: "none", borderRadius: "50%",
              width: "40px", height: "40px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>

          <div
            ref={scrollRef}
            style={{
              display: "flex", gap: "16px", overflowX: "auto",
              padding: "8px 24px 20px",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} onClick={handleFoodClick} />
            ))}
          </div>

          <button
            onClick={scrollRight}
            style={{
              position: "absolute", right: "8px", top: "50%",
              transform: "translateY(-50%)", zIndex: 10,
              background: "#fff", border: "none", borderRadius: "50%",
              width: "40px", height: "40px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            display: "flex", gap: "12px",
            padding: "0 20px", marginTop: "4px", marginBottom: "4px",
          }}
        >
          {[
            { icon: "🥗", label: "Foods", value: "∞" },
            { icon: "🔥", label: "Avg Kcal", value: Math.round(HEALTHY_FOODS.reduce((s, f) => s + f.calories, 0) / HEALTHY_FOODS.length) },
            { icon: "🤖", label: "AI Powered", value: "✓" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1, background: "#f8fafc",
                borderRadius: "16px", padding: "14px 12px",
                textAlign: "center", border: "1.5px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>{stat.icon}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a2e" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loadingFood && (
          <div
            style={{
              textAlign: "center", padding: "12px",
              color: "#10b981", fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
            }}
          >
            <div
              style={{
                width: "16px", height: "16px",
                border: "2px solid #d1fae5",
                borderTop: "2px solid #10b981",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Loading recipe...
          </div>
        )}

        {/* ── AI Panel ── */}
        <div style={{ padding: "0 20px 32px" }}>
          <AIFoodRecommendations
            onFetch={fetchRecommendations}
            loading={loadingRecs}
            result={aiRecommendations}
            onClear={clearRecommendations}
            onFoodClick={handleFoodClick}
          />
        </div>
      </section>

      {/* Modals */}
      {selectedFood && <FoodDetailModal food={selectedFood} onClose={closeFood} />}
      {showScanner && <ScanFood onClose={() => setShowScanner(false)} />}

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}