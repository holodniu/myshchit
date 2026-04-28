"use client";

type BusbarProps = {
  type: "PE" | "N";
  terminals?: number; // количество клемм
  label?: string;     // "N1", "N2", "PE"
};

/**
 * 🟡 Шина с клеммами (PE жёлто-зелёная, N синяя)
 * Как у electric2d на референсах
 */
export default function Busbar({
  type,
  terminals = 16,
  label,
}: BusbarProps) {
  const isPE = type === "PE";

  // Цвета по ГОСТ
  const colors = {
    PE: {
      bgGradient: "from-[#FFEB3B] via-[#FFD54F] to-[#F9A825]",
      border: "#F57F17",
      text: "#827717",
      badge: "#FFEB3B",
      stripes: true, // зелёно-жёлтая штриховка
    },
    N: {
      bgGradient: "from-[#90CAF9] via-[#42A5F5] to-[#1976D2]",
      border: "#0D47A1",
      text: "#0D47A1",
      badge: "#64B5F6",
      stripes: false,
    },
  };

  const c = colors[type];

  return (
    <div className="relative flex items-center gap-2 py-1">
      {/* Лейбл слева */}
      <div
        className="relative shrink-0 px-3 py-2 rounded-md text-xs font-bold font-mono shadow-md"
        style={{
          background: `linear-gradient(to bottom, ${c.badge}, ${c.border})`,
          color: "#fff",
          border: `1px solid ${c.border}`,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          minWidth: "32px",
          textAlign: "center",
        }}
      >
        {label || type}
      </div>

      {/* Сама шина */}
      <div
        className={`relative flex-1 h-10 rounded-sm shadow-inner bg-gradient-to-b ${c.bgGradient}`}
        style={{
          border: `2px solid ${c.border}`,
        }}
      >
        {/* Жёлто-зелёные полосы (только для PE, по ГОСТ) */}
        {isPE && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "repeating-linear-gradient(135deg, #4CAF50 0px, #4CAF50 6px, transparent 6px, transparent 12px)",
            }}
          />
        )}

        {/* Блик сверху (имитация металла) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-sm" />

        {/* Клеммы (маленькие прямоугольники с винтами) */}
        <div className="relative h-full flex items-center justify-around px-2">
          {Array.from({ length: terminals }).map((_, i) => (
            <div
              key={i}
              className="relative w-4 h-7 rounded-sm border shadow-sm"
              style={{
                background: `linear-gradient(to bottom, ${c.badge}, ${c.border}dd)`,
                borderColor: c.border,
              }}
            >
              {/* Винт клеммы */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-inner"
                style={{
                  background:
                    "radial-gradient(circle, #FFE082 30%, #FFA000 100%)",
                  border: "0.5px solid #E65100",
                }}
              >
                {/* Крестовая насечка */}
                <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-black" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-black" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
