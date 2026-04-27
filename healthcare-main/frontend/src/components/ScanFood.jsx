// ─── ScanFood Component ──────────────────────────────────────────────────────
import React, { useRef } from "react";
import { useFoodScanner } from "../hooks/useFoodFeature";

export default function ScanFood({ onClose }) {
  const { scanning, scanResult, scanError, preview, fileRef, handleFileSelect, resetScan } =
    useFoodScanner();
  const inputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence === "high") return "#10b981";
    if (confidence === "medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "440px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: "20px", fontWeight: 800 }}>
              🔍 Scan Food
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>
              Upload a photo to detect food & calories
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Upload zone */}
          {!preview && (
            <div
              onClick={() => inputRef.current?.click()}
              style={{
                border: "2.5px dashed #d1fae5",
                borderRadius: "20px",
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: "#f0fdf4",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#dcfce7";
                e.currentTarget.style.borderColor = "#10b981";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#d1fae5";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
              <p style={{ color: "#065f46", fontWeight: 700, margin: "0 0 6px", fontSize: "16px" }}>
                Tap to upload food photo
              </p>
              <p style={{ color: "#6b7280", margin: 0, fontSize: "13px" }}>
                JPG, PNG or HEIC supported
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            style={{ display: "none" }}
          />

          {/* Preview */}
          {preview && (
            <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
              <img
                src={preview}
                alt="Food preview"
                style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
              />
              {scanning && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      border: "4px solid rgba(255,255,255,0.2)",
                      borderTop: "4px solid #10b981",
                      borderRadius: "50%",
                      animation: "spin 0.9s linear infinite",
                    }}
                  />
                  <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>Analyzing food...</p>
                </div>
              )}
            </div>
          )}

          {/* Scan Result */}
          {scanResult && !scanning && (
            <div
              style={{
                background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                borderRadius: "20px",
                padding: "20px",
                border: "1.5px solid #a7f3d0",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1a1a2e" }}>
                  {scanResult.detected_food || "Unknown Food"}
                </h4>
                {scanResult.confidence && (
                  <span
                    style={{
                      background: getConfidenceColor(scanResult.confidence),
                      color: "#fff",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {scanResult.confidence} confidence
                  </span>
                )}
              </div>

              {scanResult.calories && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>🔥</span>
                  <span style={{ fontSize: "28px", fontWeight: 900, color: "#059669" }}>
                    {scanResult.calories}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>kcal / {scanResult.per}</span>
                </div>
              )}

              {scanResult.description && (
                <p style={{ color: "#374151", fontSize: "14px", lineHeight: 1.6, margin: "0 0 12px" }}>
                  {scanResult.description}
                </p>
              )}

              {scanResult.tags && scanResult.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {scanResult.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#10b98120",
                        color: "#065f46",
                        borderRadius: "20px",
                        padding: "3px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {scanError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fecaca",
                borderRadius: "12px",
                padding: "14px",
                color: "#b91c1c",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              ⚠️ {scanError}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            {preview && (
              <button
                onClick={resetScan}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "14px",
                  background: "#fff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
