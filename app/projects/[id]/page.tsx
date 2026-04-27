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
import { Zap, Home, ArrowLeft } from "lucide-react";
import CalculationResultPanel from "./CalculationResult";
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

  // Если расчёт был — пересчитываем для показа из сохранённых
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
      initialResult = calculatePanel(consumers, project.networkType);
    } catch (e) {
      console.error(e);
    }
  }

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

          <div className="mb-8">
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
            </div>
          </div>

          {/* Комнаты (компактно) */}
          <div className="mb-8 space-y-3">
            {project.rooms.map((room) => {
              const roomPower = room.consumers.reduce(
                (s, c) => s + c.power * c.quantity,
                0
              );
              return (
                <Card key={room.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      <div className="flex gap-3 text-sm">
                        {room.area && (
                          <span className="text-[#787B86]">{room.area} м²</span>
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
                              <span className="text-[#787B86]"> × {c.quantity}</span>
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

          {/* 🧮 Блок расчёта */}
          <CalculationResultPanel projectId={project.id} initialResult={initialResult} />
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

