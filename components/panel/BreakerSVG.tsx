"use client";

type BreakerProps = {
  poles: 1 | 2 | 3 | 4;
  current: number;              // 6, 10, 16, 20, 25, 32...
  characteristic: "B" | "C" | "D";
  brand?: string;                // "ABB", "Schneider", "IEK"
  label?: string;                // "QF1"
  sublabel?: string;             // "Розетки кухня"
  type?: "BREAKER" | "RCD" | "INPUT" | "DIFF";
  sensitivity?: number;          // для УЗО: 10, 30, 100 мА
  rcdType?: "AC" | "A" | "B";    // тип УЗО
};

const MODULE_WIDTH = 50;   // 1 модуль = 50px
const MODULE_HEIGHT = 180; // высота модуля

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

  // Цвет бренда (красная полоса у ABB, зелёная у Schneider и т.д.)
  const brandColor =
    brand === "ABB"
      ? "#d32f2f"
      : brand === "Schneider" || brand === "Schneider Electric"
      ? "#3eaf3e"
      : brand === "IEK"
      ? "#1976d2"
      : brand === "Legrand"
      ? "#003087"
      : brand === "EKF"
      ? "#f57c00"
      : "#666";

  // Цвет клавиши для УЗО
  const isRcd = type === "RCD";
  const switchColor = isRcd
    ? rcdType === "B"
      ? "#1976d2"  // синяя клавиша у Type B
      : "#424242"  // обычный AC/A — тёмно-серая
    : "#263238";

  return (
    <div className="inline-flex flex-col items-center">
      {/* Верхняя метка (QF1, QD1) */}
      {label && (
        <div className="mb-1 px-2 py-0.5 bg-[#FFF59D] border border-[#F9A825] rounded-sm text-[10px] font-mono text-black font-bold">
          {label}
        </div>
      )}

      {/* Корпус модуля */}
      <svg
        width={width}
        height={MODULE_HEIGHT}
        viewBox={`0 0 ${width} ${MODULE_HEIGHT}`}
        className="drop-shadow-lg"
      >
        {/* Задник (белый пластик) */}
        <rect
          x="1"
          y="1"
          width={width - 2}
          height={MODULE_HEIGHT - 2}
          rx="3"
          fill="#f5f5f5"
          stroke="#b0b0b0"
          strokeWidth="1"
        />

        {/* Верхние винты клемм */}
        {Array.from({ length: poles }).map((_, i) => (
          <g key={`top-${i}`}>
            <circle
              cx={MODULE_WIDTH / 2 + i * MODULE_WIDTH}
              cy="12"
              r="6"
              fill="#ffc107"
              stroke="#ff8f00"
              strokeWidth="1"
            />
            <line
              x1={MODULE_WIDTH / 2 + i * MODULE_WIDTH - 3}
              y1="12"
              x2={MODULE_WIDTH / 2 + i * MODULE_WIDTH + 3}
              y2="12"
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Бренд + полоса бренда */}
        <rect x="3" y="24" width={width - 6} height="4" fill={brandColor} />
        <text
          x={width / 2}
          y="38"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="#333"
          fontFamily="Arial"
        >
          {brand}
        </text>

        {/* Модель / серия */}
        <text
          x={width / 2}
          y="48"
          textAnchor="middle"
          fontSize="6"
          fill="#666"
          fontFamily="Arial"
        >
          {isRcd
            ? `F${poles}02 ${rcdType}`
            : type === "DIFF"
            ? "DS201"
            : "SH201L"}
        </text>

        {/* Для УЗО — жёлтая кнопка Test */}
        {isRcd && (
          <g>
            <text
              x={width / 2}
              y="62"
              textAnchor="middle"
              fontSize="7"
              fill="#333"
              fontWeight="bold"
            >
              T
            </text>
            <circle
              cx={width / 2}
              cy="70"
              r="5"
              fill="#fdd835"
              stroke="#f57f17"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Клавиша включения (центр) */}
        <rect
          x={width / 2 - width / 3}
          y="85"
          width={(width / 3) * 2}
          height="50"
          rx="3"
          fill={switchColor}
          stroke="#000"
          strokeWidth="1"
        />

        {/* Индикатор ON/OFF (зелёная полоска) */}
        <rect
          x={width / 2 - 8}
          y="92"
          width="16"
          height="4"
          fill="#4caf50"
          stroke="#2e7d32"
          strokeWidth="0.5"
          rx="1"
        />

        {/* Белая риска на клавише */}
        <line
          x1={width / 2 - 6}
          y1="115"
          x2={width / 2 + 6}
          y2="115"
          stroke="#fff"
          strokeWidth="1.5"
        />

        {/* Основной номинал */}
        <text
          x={width / 2}
          y="150"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#000"
          fontFamily="Arial"
        >
          {!isRcd && characteristic}
          {current}A
        </text>

        {/* Чувствительность для УЗО */}
        {isRcd && sensitivity && (
          <text
            x={width / 2}
            y="163"
            textAnchor="middle"
            fontSize="9"
            fill="#333"
            fontFamily="Arial"
          >
            {sensitivity}мА
          </text>
        )}

        {/* Нижние винты клемм */}
        {Array.from({ length: poles }).map((_, i) => (
          <g key={`bot-${i}`}>
            <circle
              cx={MODULE_WIDTH / 2 + i * MODULE_WIDTH}
              cy={MODULE_HEIGHT - 12}
              r="6"
              fill="#ffc107"
              stroke="#ff8f00"
              strokeWidth="1"
            />
            <line
              x1={MODULE_WIDTH / 2 + i * MODULE_WIDTH - 3}
              y1={MODULE_HEIGHT - 12}
              x2={MODULE_WIDTH / 2 + i * MODULE_WIDTH + 3}
              y2={MODULE_HEIGHT - 12}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>

      {/* Нижняя подпись */}
      {sublabel && (
        <div className="mt-1 text-[9px] text-[#787B86] text-center max-w-[80px] leading-tight">
          {sublabel}
        </div>
      )}
    </div>
  );
}
