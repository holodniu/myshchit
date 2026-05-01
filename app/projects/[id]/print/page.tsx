import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import {
  calculatePanel,
  type InputConsumer,
} from "@/lib/calculator/calculator";
import { fetchPriceEstimate } from "@/app/constructor/actions";
import { getBrandDisplayName } from "@/lib/calculator/panel-layout";
import PrintTrigger from "./PrintTrigger";

const CONSUMER_LABELS: Record<string, string> = {
  LIGHT: "Свет",
  SOCKET: "Розетки",
  COOKTOP: "Варочная панель",
  OVEN: "Духовой шкаф",
  WATER_HEATER: "Бойлер",
  ELECTRIC_BOILER: "Электрокотёл",
  AIR_CONDITIONER: "Кондиционер",
  REFRIGERATOR: "Холодильник",
  WASHING_MACHINE: "Стиральная машина",
  EV_CHARGER: "Зарядка ЭМ",
  WARM_FLOOR: "Тёплый пол",
  WORKSHOP: "Мастерская",
  OUTDOOR: "Уличная линия",
  OTHER: "Прочее",
};

export default async function PrintProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      rooms: {
        orderBy: { order: "asc" },
        include: { consumers: true },
      },
    },
  });

  if (!project) notFound();
  if (project.userId !== userId && userRole !== "ADMIN") {
    redirect("/projects");
  }

  // Расчёт
  const inputConsumers: InputConsumer[] = project.rooms.flatMap((room) =>
    room.consumers.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      power: c.power,
      quantity: c.quantity,
      dedicatedLine: c.dedicatedLine,
      voltage: c.voltage,
      powerFactor: c.powerFactor,
      roomId: room.id,
      roomName: room.name,
    }))
  );

  if (inputConsumers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Добавьте потребителей для расчёта</p>
      </div>
    );
  }

  const result = calculatePanel(inputConsumers, project.networkType);
  const brandSlug = "abb";
  const estimate = await fetchPriceEstimate(result, brandSlug);
  const brand = getBrandDisplayName(brandSlug);

  const totalModules =
    result.lines.reduce(
      (s, l) => s + l.breaker.poles + (l.rcd?.poles || 0),
      0
    ) + result.inputBreaker.poles;

  const enclosureName =
    totalModules <= 12
      ? "ЩРН-12"
      : totalModules <= 24
      ? "ЩРН-24"
      : totalModules <= 36
      ? "ЩРН-36"
      : totalModules <= 48
      ? "ЩРН-48"
      : totalModules <= 72
      ? "ЩРН-72"
      : "ЩРН-96";

  const totalPower = result.totalPower;
  const totalConsumers = project.rooms.reduce(
    (s, r) => s + r.consumers.length,
    0
  );

  // Собираем все модули для спецификации
  let qfCount = 1;
  let qdCount = 0;
  const allModules: Array<{
    qf: string;
    type: string;
    rating: string;
    brand: string;
    purpose: string;
    poles: number;
  }> = [
    {
      qf: `QF${qfCount}`,
      type: "INPUT",
      rating: `C${result.inputBreaker.current}A, ${result.inputBreaker.poles}P`,
      brand,
      purpose: "Ввод",
      poles: result.inputBreaker.poles,
    },
  ];

  // Сортируем линии: сначала УЗО, потом автоматы по току
  const sortedLines = [...result.lines].sort((a, b) => {
    const aSens = a.rcd?.sensitivity || 999;
    const bSens = b.rcd?.sensitivity || 999;
    if (aSens !== bSens) return aSens - bSens;
    return b.breaker.current - a.breaker.current;
  });

  // УЗО сначала
  sortedLines.forEach((line) => {
    if (line.rcd) {
      qdCount++;
      allModules.push({
        qf: `QD${qdCount}`,
        type: "RCD",
        rating: `${line.rcd.current}A / ${line.rcd.sensitivity}мА, тип ${line.rcd.type}`,
        brand,
        purpose: `УЗО ${line.rcd.sensitivity}мА`,
        poles: line.rcd.poles,
      });
    }
  });

  // Потом автоматы
  sortedLines.forEach((line) => {
    qfCount++;
    allModules.push({
      qf: `QF${qfCount}`,
      type: "BREAKER",
      rating: `${line.breaker.characteristic}${line.breaker.current}A, ${line.breaker.poles}P`,
      brand,
      purpose: line.name,
      poles: line.breaker.poles,
    });
  });

  return (
    <>
      <PrintTrigger />
      <style>{`
        @page {
          size: A4;
          margin: 15mm;
        }
        @media print {
          body { 
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        .print-root {
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          color: #000;
          background: white;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-size: 11pt;
          line-height: 1.4;
        }
        .print-root h1 {
          font-size: 22pt;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        .print-root h2 {
          font-size: 14pt;
          font-weight: bold;
          margin: 20px 0 10px 0;
          padding-bottom: 5px;
          border-bottom: 2px solid #2962FF;
        }
        .print-root h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 15px 0 8px 0;
        }
        .print-root table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10pt;
        }
        .print-root th {
          background: #E3F2FD;
          border: 1px solid #90CAF9;
          padding: 6px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 9pt;
          text-transform: uppercase;
          color: #0D47A1;
        }
        .print-root td {
          border: 1px solid #CFD8DC;
          padding: 6px 8px;
        }
        .print-root .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 15px 0;
        }
        .print-root .metric-box {
          border: 1px solid #CFD8DC;
          border-left: 3px solid #2962FF;
          padding: 8px 10px;
          background: #F5F7F9;
        }
        .print-root .metric-label {
          font-size: 8pt;
          color: #607D8B;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .print-root .metric-value {
          font-size: 14pt;
          font-weight: bold;
        }
        .print-root .room {
          margin-bottom: 12px;
          padding: 8px;
          background: #F8F9FA;
          border-left: 3px solid #FF9800;
        }
        .print-root .room-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        .print-root .room-name {
          font-weight: bold;
          font-size: 12pt;
        }
        .print-root .consumer {
          display: flex;
          justify-content: space-between;
          padding: 2px 0 2px 15px;
          font-size: 10pt;
        }
        .print-root .total-box {
          background: #E0F2F1;
          border: 2px solid #26A69A;
          padding: 15px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .print-root .total-box .label {
          font-size: 12pt;
          color: #004D40;
        }
        .print-root .total-box .value {
          font-size: 22pt;
          font-weight: bold;
          color: #00695C;
        }
        .print-root .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 8pt;
          font-weight: bold;
          background: #FFF9C4;
          color: #F57F17;
          border: 1px solid #F9A825;
        }
        .print-root .badge-input {
          background: #E0F2F1;
          color: #004D40;
          border-color: #26A69A;
        }
        .print-root .badge-rcd {
          background: #FFF3E0;
          color: #E65100;
          border-color: #FF9800;
        }
        .print-root .disclaimer {
          margin-top: 20px;
          padding: 10px;
          background: #FFF8E1;
          border-left: 3px solid #FF9800;
          font-size: 9pt;
          color: #424242;
          line-height: 1.5;
        }
        .print-root .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #CFD8DC;
          text-align: center;
          font-size: 9pt;
          color: #607D8B;
        }
        .print-root .warnings {
          background: #FFF3E0;
          border: 1px solid #FF9800;
          padding: 10px;
          margin: 10px 0;
          font-size: 10pt;
        }
      `}</style>



      <div className="print-root">
        {/* Шапка */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 10, borderBottom: "2px solid #2962FF" }}>
          <div>
            <div style={{ fontSize: "10pt", color: "#607D8B" }}>ПРОЕКТ ЭЛЕКТРОЩИТА</div>
            <h1>{project.name}</h1>
            {project.description && (
              <div style={{ color: "#607D8B", marginTop: 3 }}>{project.description}</div>
            )}
          </div>
          <div style={{ textAlign: "right", fontSize: "10pt" }}>
            <div style={{ fontWeight: "bold", color: "#2962FF", fontSize: "14pt" }}>🛡️ МОЙ ЩИТ</div>
            <div style={{ color: "#607D8B" }}>myshchit.ru</div>
            <div style={{ marginTop: 5 }}>
              <strong>Дата:</strong> {new Date(project.createdAt).toLocaleDateString("ru-RU")}
            </div>
            <div>
              <strong>Автор:</strong> {project.user.name || project.user.email}
            </div>
          </div>
        </div>

        {/* Метрики */}
        <h2>📊 Основные параметры</h2>
        <div className="metric-grid">
          <div className="metric-box">
            <div className="metric-label">Тип сети</div>
            <div className="metric-value">
              {project.networkType === "SINGLE_PHASE" ? "220В (1ф)" : "380В (3ф)"}
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Мощность</div>
            <div className="metric-value">{(totalPower / 1000).toFixed(2)} кВт</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Вводной ток</div>
            <div className="metric-value">{result.inputCurrent.toFixed(1)} А</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Вводной автомат</div>
            <div className="metric-value">
              C{result.inputBreaker.current} / {result.inputBreaker.poles}P
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Корпус</div>
            <div className="metric-value">{enclosureName}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Линий в щите</div>
            <div className="metric-value">{result.lines.length}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Потребителей</div>
            <div className="metric-value">{totalConsumers}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Бренд</div>
            <div className="metric-value" style={{ color: "#2962FF" }}>{brand}</div>
          </div>
        </div>

        {/* Предупреждения */}
        {result.warnings.length > 0 && (
          <div className="warnings">
            <strong>⚠️ Предупреждения:</strong>
            <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Итого */}
        <div className="total-box avoid-break">
          <div>
            <div className="label">Итоговая стоимость оборудования</div>
            <div style={{ fontSize: "9pt", color: "#00796B", marginTop: 3 }}>
              Автоматы · УЗО · Кабели · Корпус
            </div>
          </div>
          <div className="value">{estimate.total.toLocaleString("ru-RU")} ₽</div>
        </div>

        {/* Комнаты */}
        <h2 className="page-break">🏠 Комнаты и потребители</h2>
        {project.rooms.map((room) => {
          const roomPower = room.consumers.reduce(
            (s, c) => s + c.power * c.quantity,
            0
          );
          return (
            <div key={room.id} className="room avoid-break">
              <div className="room-header">
                <div className="room-name">
                  {room.name} {room.area && <span style={{ fontWeight: "normal", color: "#607D8B" }}>({room.area} м²)</span>}
                </div>
                <div style={{ color: "#FF9800", fontWeight: "bold" }}>
                  {(roomPower / 1000).toFixed(2)} кВт
                </div>
              </div>
              {room.consumers.map((c) => (
                <div key={c.id} className="consumer">
                  <span>
                    • {CONSUMER_LABELS[c.type] || c.type} — {c.name}
                    {c.quantity > 1 && ` × ${c.quantity}`}
                    {c.dedicatedLine && (
                      <span style={{ color: "#2962FF", marginLeft: 6, fontSize: "9pt" }}>
                        ● отдельная линия
                      </span>
                    )}
                  </span>
                  <span style={{ color: "#607D8B" }}>{c.power * c.quantity} Вт</span>
                </div>
              ))}
            </div>
          );
        })}

        {/* Спецификация */}
        <h2 className="page-break">📋 Спецификация оборудования</h2>
        <table>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Поз.</th>
              <th style={{ width: "28%" }}>Номинал</th>
              <th style={{ width: "20%" }}>Бренд</th>
              <th style={{ width: "35%" }}>Назначение</th>
              <th style={{ width: "7%", textAlign: "center" }}>Мод.</th>
            </tr>
          </thead>
          <tbody>
            {allModules.map((mod, idx) => (
              <tr key={idx}>
                <td>
                  <span
                    className={`badge ${
                      mod.type === "INPUT"
                        ? "badge-input"
                        : mod.type === "RCD"
                        ? "badge-rcd"
                        : ""
                    }`}
                  >
                    {mod.qf}
                  </span>
                </td>
                <td style={{ fontFamily: "monospace" }}>{mod.rating}</td>
                <td>{mod.brand}</td>
                <td>{mod.purpose}</td>
                <td style={{ textAlign: "center" }}>{mod.poles}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Детализация сметы */}
        <h2>💰 Детализация сметы</h2>
        <table>
          <tbody>
            <tr>
              <td>⚡ Автоматические выключатели</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontFamily: "monospace" }}>
                {estimate.breakdown.breakers.toLocaleString("ru-RU")} ₽
              </td>
            </tr>
            <tr>
              <td>🛡️ УЗО и дифавтоматы</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontFamily: "monospace" }}>
                {estimate.breakdown.rcds.toLocaleString("ru-RU")} ₽
              </td>
            </tr>
            <tr>
              <td>🔌 Кабели ВВГнг-LS</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontFamily: "monospace" }}>
                {estimate.breakdown.cables.toLocaleString("ru-RU")} ₽
              </td>
            </tr>
            <tr>
              <td>📦 Корпус щита {enclosureName}</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontFamily: "monospace" }}>
                {estimate.breakdown.enclosure.toLocaleString("ru-RU")} ₽
              </td>
            </tr>
            <tr style={{ background: "#E0F2F1" }}>
              <td style={{ fontWeight: "bold", fontSize: "12pt" }}>ИТОГО</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "14pt", color: "#00695C", fontFamily: "monospace" }}>
                {estimate.total.toLocaleString("ru-RU")} ₽
              </td>
            </tr>
          </tbody>
        </table>

        {/* Дисклеймер */}
        <div className="disclaimer avoid-break">
          <strong>⚠️ ВАЖНО:</strong> Данный документ является ориентировочным расчётом.
          Перед монтажом электрощита обязательно проконсультируйтесь с профессиональным
          электриком. Проверьте соответствие ПУЭ, согласуйте мощность с энергосбытом.
          Цены актуальны на дату создания проекта и могут отличаться в магазинах.
        </div>

        {/* Футер */}
        <div className="footer">
          Проект создан в системе <strong style={{ color: "#2962FF" }}>МОЙ ЩИТ</strong> · myshchit.ru ·{" "}
          {new Date().toLocaleDateString("ru-RU")}
        </div>
      </div>
    </>
  );
}
