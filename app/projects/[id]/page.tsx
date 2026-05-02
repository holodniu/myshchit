import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Home, ArrowLeft, Pencil, Settings } from "lucide-react";
import CalculationResultPanel from "./CalculationResult";
import DownloadPDFButton from "./DownloadPDFButton";
import {
  calculatePanel,
  type InputConsumer,
  type CalculationResult,
} from "@/lib/calculator/calculator";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: { order: "asc" },
        include: { consumers: true },
      },
      panels: {
        include: {
          lines: {
            orderBy: { order: "asc" },
            include: { consumers: true },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const totalPower = project.rooms.reduce(
    (sum, room) =>
      sum + room.consumers.reduce((s, c) => s + c.power * c.quantity, 0),
    0
  );

  const totalConsumers = project.rooms.reduce(
    (sum, r) => sum + r.consumers.length,
    0
  );

  let initialResult: CalculationResult | null = null;
  if (project.panels.length > 0 && totalConsumers > 0) {
    const consumers: InputConsumer[] = project.rooms.flatMap((room) =>
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
    try {
      initialResult = calculatePanel(
        consumers,
        project.networkType,
        project.protectionLevel
      );
    } catch (e) {
      console.error(e);
    }
  }

  const isCalculated = initialResult !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[#787B86] hover:text-[#D1D4DC] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> К списку проектов
          </Link>

          {/* Заголовок + кнопки */}
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-[#D1D4DC] mb-2">
                {project.name}
              </h1>
              <div className="flex gap-2 flex-wrap text-sm">
                <Badge color="#D1D4DC">
                  {project.networkType === "SINGLE_PHASE" ? "220В" : "380В"}
                </Badge>
                <Badge color="#FF9800">
                  <Zap className="w-3 h-3 inline mr-1" />
                  {(totalPower / 1000).toFixed(2)} кВт
                </Badge>
                <Badge color="#26A69A">
                  <Home className="w-3 h-3 inline mr-1" />
                  {project.rooms.length} комнат
                </Badge>
                <Badge color="#2962FF">
                  🔌 {totalConsumers} потребителей
                </Badge>
                <Badge color="#9C27B0">
                  🛡️ {getProtectionLabel(project.protectionLevel)}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {isCalculated && <DownloadPDFButton projectId={project.id} />}

              <Link
                href={`/projects/${project.id}/settings`}
                className="px-4 py-2 bg-[#1E222D] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#363A45] rounded-md transition flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Настройки
              </Link>

              <Link
                href={`/projects/${project.id}/edit`}
                className="px-4 py-2 bg-[#1E222D] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#363A45] rounded-md transition flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Редактировать
              </Link>
            </div>
          </div>

          {/* Комнаты — группировка по этажам */}
          <div className="mb-8 space-y-6">
            {Array.from(
              new Map(project.rooms.map((r) => [r.floor, r])).entries()
            )
              .sort(([a], [b]) => (a as number) - (b as number))
              .map(([floor]) => {
                const floorRooms = project.rooms.filter(
                  (r) => r.floor === floor
                );
                const floorPower = floorRooms.reduce(
                  (sum, room) =>
                    sum +
                    room.consumers.reduce((s, c) => s + c.power * c.quantity, 0),
                  0
                );
                return (
                  <div key={floor}>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-[#D1D4DC]">
                        🏢 {floor}-й этаж
                      </h3>
                      <div className="flex-1 h-px bg-[#363A45]" />
                      <span className="text-sm text-[#FF9800]">
                        {(floorPower / 1000).toFixed(2)} кВт
                      </span>
                      <span className="text-xs text-[#787B86]">
                        {floorRooms.length} комнат
                      </span>
                    </div>
                    <div className="space-y-3">
                      {floorRooms.map((room) => {
                        const roomPower = room.consumers.reduce(
                          (s, c) => s + c.power * c.quantity,
                          0
                        );
                        return (
                          <Card key={room.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  {room.name}
                                </CardTitle>
                                <div className="flex gap-3 text-sm">
                                  {room.area && (
                                    <span className="text-[#787B86]">
                                      {room.area} м²
                                    </span>
                                  )}
                                  <span className="text-[#FF9800]">
                                    {(roomPower / 1000).toFixed(2)} кВт
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1 text-sm">
                                {room.consumers.map((c) => (
                                  <div
                                    key={c.id}
                                    className="flex items-center justify-between py-1"
                                  >
                                    <span className="text-[#D1D4DC]">
                                      {c.name}
                                      {c.quantity > 1 && (
                                        <span className="text-[#787B86]">
                                          {" "}
                                          × {c.quantity}
                                        </span>
                                      )}
                                      {c.dedicatedLine && (
                                        <span className="ml-2 text-xs text-[#2962FF]">
                                          ● отдельная линия
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[#787B86]">
                                      {c.power * c.quantity} Вт
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Блок расчёта */}
          <CalculationResultPanel
            projectId={project.id}
            initialResult={initialResult}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="px-3 py-1 bg-[#1E222D] border rounded-full"
      style={{ borderColor: `${color}40`, color }}
    >
      {children}
    </div>
  );
}

function getProtectionLabel(level: string): string {
  switch (level) {
    case "MINIMAL":
      return "Минимальная защита";
    case "BASIC":
      return "Базовая защита";
    case "MAXIMUM":
      return "Максимальная защита";
    case "PARANOID":
      return "Параноидальная";
    default:
      return "Базовая защита";
  }
}
