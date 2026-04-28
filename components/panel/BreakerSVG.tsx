"use client";

type BreakerProps = {
  poles: 1 | 2 | 3 | 4;
  current: number;
  characteristic: "B" | "C" | "D";
  brand?: string;
  label?: string;
  sublabel?: string;
  type?: "BREAKER" | "RCD" | "INPUT" | "DIFF";
  sensitivity?: number;
  rcdType?: "AC" | "A" | "B";
};

const MODULE_WIDTH = 50;
const MODULE_HEIGHT = 185;

// 🎨 Цвета и стили брендов (повторяют реальные)
const BRAND_STYLES: Record<
  string,
  {
    stripColor: string;
    textColor: string;
    font: string;
    sublabel?: string;
  }
> = {
  ABB: { stripColor: "#D32F2F", textColor: "#D32F2F", font: "Arial Black", sublabel: "S201" },
  Schneider: { stripColor: "#3CAA3C", textColor: "#00914A", font: "Arial", sublabel: "Easy9" },
  "Schneider Electric": { stripColor: "#3CAA3C", textColor: "#00914A", font: "Arial", sublabel: "Easy9" },
  IEK: { stripColor: "#1976D2", textColor: "#1976D2", font: "Arial Black", sublabel: "ВА47-29" },
  EKF: { stripColor: "#F57C00", textColor: "#E65100", font: "Arial Black", sublabel: "ВА47" },
  Legrand: { stripColor: "#003087", textColor: "#003087", font: "Arial", sublabel: "TX³" },
  DEKraft: { stripColor: "#004D40", textColor: "#00695C", font: "Arial", sublabel: "BA-103" },
  DKC: { stripColor: "#E91E63", textColor: "#AD1457", font: "Arial", sublabel: "DKC" },
};

export default function BreakerSVG({
  poles,
  current,
  characteristic,
  brand = "ABB",
  label,
  sublabel,
  type = "BREAKER",
  sensitivity,
  rcdType,
}: BreakerProps) {
  const width = MODULE_WIDTH * poles;
  const style = BRAND_STYLES[brand] || BRAND_STYLES.ABB;
  const isRcd = type === "RCD";
  const isInput = type === "INPUT";

  // Индикатор включен/выключен (зелёный ON)
  const indicatorColor = "#4CAF50";

  return (
    <div className="inline-flex flex-col items-center">
      {/* 🏷️ Жёлтый стикер с QF-меткой сверху */}
      {label && (
        <div className="mb-1 relative">
          <div className="px-2 py-1 bg-gradient-to-b from-[#FFEB3B] to-[#F9A825] border border-[#F57F17] rounded shadow text-[10px] font-mono text-black font-bold leading-none">
            {label}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#F57F17]" />
        </div>
      )}

      {/* 📦 Корпус модуля */}
      <svg
        width={width}
        height={MODULE_HEIGHT}
        viewBox={`0 0 ${width} ${MODULE_HEIGHT}`}
        className="drop-shadow-lg"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
      >
        {/* Градиент корпуса (имитация пластика) */}
        <defs>
          <linearGradient id={`body-${width}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </linearGradient>

          <linearGradient id={`switch-${width}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#424242" />
            <stop offset="50%" stopColor="#212121" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          <radialGradient id={`screw-${width}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFA000" />
          </radialGradient>
        </defs>

        {/* Тень под корпусом */}
        <rect
          x="2"
          y="3"
          width={width - 4}
          height={MODULE_HEIGHT - 4}
          rx="4"
          fill="rgba(0,0,0,0.1)"
        />

        {/* Основной корпус */}
        <rect
          x="1"
          y="1"
          width={width - 2}
          height={MODULE_HEIGHT - 2}
          rx="3"
          fill={`url(#body-${width})`}
          stroke="#9e9e9e"
          strokeWidth="1"
        />

        {/* Блик слева (имитация объёма) */}
        <rect
          x="2"
          y="2"
          width="4"
          height={MODULE_HEIGHT - 4}
          fill="rgba(255,255,255,0.5)"
        />

        {/* 🔩 Верхние клеммы (винты) */}
        {Array.from({ length: poles }).map((_, i) => (
          <g key={`top-${i}`}>
            {/* Основа клеммы */}
            <rect
              x={i * MODULE_WIDTH + 4}
              y="6"
              width={MODULE_WIDTH - 8}
              height="22"
              fill="#FFC107"
              stroke="#E65100"
              strokeWidth="0.5"
              rx="2"
            />
            {/* Винт */}
            <circle
              cx={MODULE_WIDTH / 2 + i * MODULE_WIDTH}
              cy="17"
              r="7"
              fill={`url(#screw-${width})`}
              stroke="#E65100"
              strokeWidth="1"
            />
            {/* Крест на винте */}
            <path
              d={`M ${MODULE_WIDTH / 2 + i * MODULE_WIDTH - 4} 17 L ${MODULE_WIDTH / 2 + i * MODULE_WIDTH + 4} 17 M ${MODULE_WIDTH / 2 + i * MODULE_WIDTH} 13 L ${MODULE_WIDTH / 2 + i * MODULE_WIDTH} 21`}
              stroke="#000"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* 🏭 Полоса бренда */}
        <rect
          x="3"
          y="32"
          width={width - 6}
          height="4"
          fill={style.stripColor}
        />

        {/* 🏭 Бренд */}
        <text
          x={width / 2}
          y="46"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fill={style.textColor}
          fontFamily={style.font}
          letterSpacing="0.5"
        >
          {brand.length > 8 ? brand.substring(0, 8) : brand}
        </text>

        {/* 🔧 Модель / серия */}
        <text
          x={width / 2}
          y="56"
          textAnchor="middle"
          fontSize="6"
          fill="#616161"
          fontFamily="Arial"
        >
          {isInput ? "S203" : isRcd ? `F${poles}02 ${rcdType}` : style.sublabel}
        </text>

        {/* 🟡 Жёлтая кнопка TEST для УЗО */}
        {isRcd && (
          <g>
            <text
              x={width / 2}
              y="68"
              textAnchor="middle"
              fontSize="7"
              fill="#333"
              fontWeight="bold"
            >
              T
            </text>
            <circle
              cx={width / 2}
              cy="76"
              r="5"
              fill="#FDD835"
              stroke="#F57F17"
              strokeWidth="1"
            />
          </g>
        )}

        {/* 🎛️ Клавиша переключения (центр) */}
        <rect
          x={width / 2 - width / 3}
          y={isRcd ? 90 : 78}
          width={(width / 3) * 2}
          height={isRcd ? 48 : 60}
          rx="3"
          fill={`url(#switch-${width})`}
          stroke="#000"
          strokeWidth="1"
        />

        {/* Блик на клавише */}
        <rect
          x={width / 2 - width / 4}
          y={isRcd ? 92 : 80}
          width={(width / 4) * 2}
          height="3"
          fill="rgba(255,255,255,0.2)"
          rx="1"
        />

        {/* 🟢 Индикатор ON/OFF (зелёная полоска) */}
        <rect
          x={width / 2 - 10}
          y={isRcd ? 96 : 86}
          width="20"
          height="5"
          fill={indicatorColor}
          stroke="#1B5E20"
          strokeWidth="0.5"
          rx="1"
        />

        {/* Тонкая светящаяся полоса */}
        <rect
          x={width / 2 - 9}
          y={isRcd ? 97 : 87}
          width="18"
          height="1.5"
          fill="#81C784"
        />

        {/* Белая риска на клавише (индикатор положения) */}
        <line
          x1={width / 2 - 6}
          y1={isRcd ? 120 : 124}
          x2={width / 2 + 6}
          y2={isRcd ? 120 : 124}
          stroke="#fff"
          strokeWidth="1.5"
        />

        {/* 🔢 Основной номинал (крупно) */}
        <text
          x={width / 2}
          y="152"
          textAnchor="middle"
          fontSize="16"
          fontWeight="900"
          fill="#000"
          fontFamily="Arial Black"
        >
          {!isRcd && characteristic}
          {current}A
        </text>

        {/* 📏 Чувствительность УЗО */}
        {isRcd && sensitivity && (
          <text
            x={width / 2}
            y="165"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#D32F2F"
            fontFamily="Arial"
          >
            {sensitivity}мА
          </text>
        )}

        {/* 🔩 Нижние клеммы */}
        {Array.from({ length: poles }).map((_, i) => (
          <g key={`bot-${i}`}>
            <rect
              x={i * MODULE_WIDTH + 4}
              y={MODULE_HEIGHT - 28}
              width={MODULE_WIDTH - 8}
              height="22"
              fill="#FFC107"
              stroke="#E65100"
              strokeWidth="0.5"
              rx="2"
            />
            <circle
              cx={MODULE_WIDTH / 2 + i * MODULE_WIDTH}
              cy={MODULE_HEIGHT - 17}
              r="7"
              fill={`url(#screw-${width})`}
              stroke="#E65100"
              strokeWidth="1"
            />
            <path
              d={`M ${MODULE_WIDTH / 2 + i * MODULE_WIDTH - 4} ${MODULE_HEIGHT - 17} L ${MODULE_WIDTH / 2 + i * MODULE_WIDTH + 4} ${MODULE_HEIGHT - 17} M ${MODULE_WIDTH / 2 + i * MODULE_WIDTH} ${MODULE_HEIGHT - 21} L ${MODULE_WIDTH / 2 + i * MODULE_WIDTH} ${MODULE_HEIGHT - 13}`}
              stroke="#000"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Вентиляционные отверстия по бокам */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={`vent-l-${i}`}
            x="2"
            y={50 + i * 12}
            width="1"
            height="6"
            fill="#9e9e9e"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={`vent-r-${i}`}
            x={width - 3}
            y={50 + i * 12}
            width="1"
            height="6"
            fill="#9e9e9e"
          />
        ))}
      </svg>

      {/* 🏷️ Нижний белый стикер (подпись) */}
      {sublabel && (
        <div className="mt-2 relative max-w-[110px]">
          <div className="px-2 py-1 bg-gradient-to-b from-white to-[#FAFAFA] border border-[#BDBDBD] rounded shadow-sm text-[9px] text-[#37474F] text-center leading-tight">
            {sublabel}
          </div>
          {/* Иголка-прикрепление */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D32F2F] rounded-full shadow" />
        </div>
      )}
    </div>
  );
}

