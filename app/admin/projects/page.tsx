import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Home, Zap, User, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      _count: { select: { rooms: true } },
    },
  });

  const stats = {
    total: projects.length,
    calculated: projects.filter((p) => p.status === "CALCULATED").length,
    drafts: projects.filter((p) => p.status === "DRAFT").length,
    totalPower:
      projects.reduce((sum, p) => sum + (p.totalPower || 0), 0) / 1000,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-[#26A69A]" />
          Все проекты
        </h1>
        <p className="text-[#787B86] mt-1">
          {stats.total} проектов · {stats.calculated} рассчитано ·{" "}
          {stats.drafts} черновиков
        </p>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Всего" value={stats.total} color="#D1D4DC" />
        <StatCard label="Рассчитано" value={stats.calculated} color="#26A69A" />
        <StatCard label="Черновики" value={stats.drafts} color="#787B86" />
        <StatCard
          label="Суммарная мощность"
          value={stats.totalPower.toFixed(1)}
          unit="кВт"
          color="#FF9800"
        />
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>Список проектов</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="py-12 text-center text-[#787B86]">
              <ClipboardList className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Пока нет проектов в системе</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#363A45] text-left">
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Проект
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Владелец
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Комнат
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Мощность
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Сеть
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Статус
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Создан
                    </th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-[#2A2E39] hover:bg-[#1E222D]/60 transition"
                    >
                      <td className="py-3 px-2">
                        <div className="font-medium text-[#D1D4DC] truncate max-w-xs">
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-xs text-[#787B86] truncate max-w-xs">
                            {project.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#787B86]" />
                          <span className="text-[#D1D4DC]">
                            {project.user.name || project.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="inline-flex items-center gap-1 text-[#26A69A]">
                          <Home className="w-3 h-3" />
                          <span className="font-mono">
                            {project._count.rooms}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {project.totalPower ? (
                          <div className="inline-flex items-center gap-1 text-[#FF9800]">
                            <Zap className="w-3 h-3" />
                            <span className="font-mono">
                              {(project.totalPower / 1000).toFixed(1)} кВт
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#50535E]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs font-mono text-[#D1D4DC]">
                          {project.networkType === "SINGLE_PHASE"
                            ? "220В"
                            : "380В"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="py-3 px-2 text-[#787B86] text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.createdAt.toLocaleDateString("ru-RU")}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xs text-[#2962FF] hover:underline"
                        >
                          Открыть →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  unit,
}: {
  label: string;
  value: number | string;
  color: string;
  unit?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-[#787B86]">{label}</div>
        <div className="text-2xl font-bold mt-1" style={{ color }}>
          {value} {unit && <span className="text-sm">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CALCULATED: "bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/30",
    DRAFT: "bg-[#363A45] text-[#787B86] border border-[#363A45]",
    EXPORTED: "bg-[#2962FF]/20 text-[#2962FF] border border-[#2962FF]/30",
    ARCHIVED: "bg-[#787B86]/20 text-[#787B86] border border-[#787B86]/30",
  };
  const labels: Record<string, string> = {
    CALCULATED: "Рассчитан",
    DRAFT: "Черновик",
    EXPORTED: "Экспорт",
    ARCHIVED: "Архив",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-semibold ${
        styles[status] || styles.DRAFT
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
