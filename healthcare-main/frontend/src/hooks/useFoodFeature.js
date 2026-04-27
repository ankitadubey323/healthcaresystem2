import { useState, useCallback, useRef } from "react";

export function useFood() {
  const [selectedFood, setSelectedFood] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [condition, setCondition] = useState("");
  const scrollRef = useRef(null);

  const openFood = useCallback((food) => setSelectedFood(food), []);
  const closeFood = useCallback(() => setSelectedFood(null), []);

  const fetchRecommendations = useCallback(async (healthCondition) => {
    if (!healthCondition.trim()) return;
    setLoadingRecs(true);
    setCondition(healthCondition);

    try {
      const response = await fetch("/api/food/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: healthCondition }),
      });
      if (!response.ok) throw new Error("API error");
      const result = await response.json();
      setAiRecommendations(result);
    } catch (err) {
      console.error("Food recommendation error:", err);
      setAiRecommendations(null);
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setAiRecommendations(null);
    setCondition("");
  }, []);

  return {
    selectedFood, openFood, closeFood,
    aiRecommendations, loadingRecs, condition,
    fetchRecommendations, clearRecommendations,
    scrollRef,
  };
}

export function useFoodScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;
    setScanError(null);
    setScanResult(null);
    setPreview(URL.createObjectURL(file));
    setScanning(true);

    try {
      const base64 = await fileToBase64(file);
      const response = await fetch("/api/food/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      if (!response.ok) throw new Error("Scan failed");
      const result = await response.json();
      setScanResult(result);
    } catch (err) {
      setScanError("Could not analyze image. Please try again.");
      setScanResult({
        detected_food: "Detection failed",
        confidence: "low",
        calories: null,
        tags: [],
        description: "Please try again with a clearer food image.",
      });
    } finally {
      setScanning(false);
    }
  }, []);

  const resetScan = useCallback(() => {
    setScanResult(null);
    setScanError(null);
    setPreview(null);
    setScanning(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  return {
    scanning, scanResult, scanError,
    preview, fileRef, handleFileSelect, resetScan
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}