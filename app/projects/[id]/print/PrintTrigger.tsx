"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // Автоматически открываем диалог печати через небольшую задержку
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="no-print"
      style={{
        position: "sticky",
        top: 0,
        background: "#2962FF",
        color: "white",
        padding: "10px 20px",
        textAlign: "center",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      💡 Сейчас откроется диалог печати — выберите{" "}
      <strong>«Сохранить как PDF»</strong>.{" "}
      <button
        onClick={() => window.print()}
        style={{
          marginLeft: 20,
          padding: "5px 15px",
          background: "white",
          color: "#2962FF",
          border: "none",
          borderRadius: 4,
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🖨 Открыть диалог печати
      </button>
    </div>
  );
}
