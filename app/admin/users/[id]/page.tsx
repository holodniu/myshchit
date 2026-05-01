import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Phone,
  ClipboardList,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserRoleChanger from "./UserRoleChanger";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { rooms: true } },
        },
      },
      _count: {
        select: { projects: true, payments: true },
      },
    },
  });

  if (!user) notFound();

  const totalPower = user.projects.reduce(
    (sum, p) => sum + (p.totalPower || 0),
    0
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-[#787B86] hover:text-[#D1D4DC]"
      >
        <ArrowLeft className="w-4 h-4" /> К списку пользователей
      </Link>

      {/* Профиль пользователя */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-20 h-20 bg-[#2962FF]/20 rounded-full flex items-center justify-center text-3xl text-[#2962FF] font-bold shrink-0">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-[#D1D4DC]">
                {user.name || "Без имени"}
              </h1>
              <div className="flex items-center gap-2 text-[#787B86] mt-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-[#787B86] mt-1">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="text-xs text-[#787B86]">
                  Регистрация: {user.createdAt.toLocaleDateString("ru-RU")}
                </div>
                {user.lastLoginAt && (
                  <div className="text-xs text-[#787B86]">
                    Последний вход:{" "}
                    {user.lastLoginAt.toLocaleDateString("ru-RU")}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <UserRoleChanger userId={user.id} currentRole={user.role} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Проектов"
          value={user._count.projects}
          color="#26A69A"
        />
        <StatCard
          label="Платежей"
          value={user._count.payments}
          color="#FF9800"
        />
        <StatCard
          label="Общая мощность"
          value={`${(totalPower / 1000).toFixed(1)}`}
          unit="кВт"
          color="#2962FF"
        />
        <StatCard
          label="Подписка"
          value={user.subscription}
          color={
            user.subscription === "PRO"
              ? "#FF9800"
              : user.subscription === "ONCE"
              ? "#2962FF"
              : "#787B86"
          }
        />
      </div>

      {/* Проекты пользователя */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#26A69A]" />
            Проекты пользователя ({user.projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.projects.length === 0 ? (
            <div className="py-12 text-center text-[#787B86]">
              <ClipboardList className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>У пользователя пока нет проектов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {user.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-[#131722] border border-[#363A45] rounded-md hover:border-[#2962FF] transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#D1D4DC] truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-[#787B86] flex items-center gap-3">
                      <span>{project._count.rooms} комнат</span>
                      {project.totalPower && (
                        <span className="text-[#FF9800]">
                          <Zap className="w-3 h-3 inline" />{" "}
                          {(project.totalPower / 1000).toFixed(1)} кВт
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.createdAt.toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        project.status === "CALCULATED"
                          ? "bg-[#26A69A]/20 text-[#26A69A]"
                          : "bg-[#363A45] text-[#787B86]"
                      }`}
                    >
                      {project.status === "CALCULATED"
                        ? "Рассчитан"
                        : "Черновик"}
                    </span>
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-xs text-[#2962FF] hover:underline"
                    >
                      Открыть →
                    </Link>
                  </div>
                </div>
              ))}
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
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
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
