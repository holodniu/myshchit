import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  Factory,
  TrendingUp,
  Activity,
  Zap,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  // Параллельно загружаем статистику
  const [
    usersCount,
    projectsCount,
    brandsCount,
    breakersCount,
    calculatedProjects,
    last7daysProjects,
    last7daysUsers,
    recentUsers,
    recentProjects,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.brand.count(),
    prisma.breaker.count(),
    prisma.project.count({ where: { status: "CALCULATED" } }),
    prisma.project.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { rooms: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC]">Дашборд</h1>
        <p className="text-[#787B86] mt-1">
          Обзор активности системы «Мой Щит»
        </p>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Пользователи"
          value={usersCount}
          change={last7daysUsers}
          icon={<Users className="w-5 h-5" />}
          color="#2962FF"
          link="/admin/users"
        />
        <MetricCard
          title="Проекты"
          value={projectsCount}
          change={last7daysProjects}
          icon={<ClipboardList className="w-5 h-5" />}
          color="#26A69A"
          link="/admin/projects"
          subtitle={`${calculatedProjects} рассчитано`}
        />
        <MetricCard
          title="Бренды"
          value={brandsCount}
          icon={<Factory className="w-5 h-5" />}
          color="#FF9800"
          link="/admin/brands"
        />
        <MetricCard
          title="Оборудование"
          value={breakersCount}
          icon={<Zap className="w-5 h-5" />}
          color="#EF5350"
          link="/admin/breakers"
          subtitle="автоматов в каталоге"
        />
      </div>

      {/* Активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последние пользователи */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2962FF]" />
                Новые пользователи
              </span>
              <Link
                href="/admin/users"
                className="text-xs text-[#2962FF] hover:underline flex items-center gap-1"
              >
                Все <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUsers.length === 0 ? (
                <div className="py-4 text-center text-[#50535E] text-sm">
                  Пока нет пользователей
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 border-b border-[#2A2E39] last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#D1D4DC] truncate">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs text-[#787B86] truncate">
                        {user.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          user.role === "ADMIN"
                            ? "bg-[#FF9800]/20 text-[#FF9800]"
                            : user.role === "PRO"
                            ? "bg-[#2962FF]/20 text-[#2962FF]"
                            : "bg-[#363A45] text-[#787B86]"
                        }`}
                      >
                        {user.role}
                      </span>
                      <div className="text-xs text-[#787B86] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Последние проекты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#26A69A]" />
                Свежие проекты
              </span>
              <Link
                href="/admin/projects"
                className="text-xs text-[#26A69A] hover:underline flex items-center gap-1"
              >
                Все <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProjects.length === 0 ? (
                <div className="py-4 text-center text-[#50535E] text-sm">
                  Пока нет проектов
                </div>
              ) : (
                recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between py-2 border-b border-[#2A2E39] last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#D1D4DC] truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-[#787B86] truncate">
                        {project.user.name || project.user.email} ·{" "}
                        {project._count.rooms} комнат
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {project.totalPower && (
                        <span className="text-xs text-[#FF9800]">
                          {(project.totalPower / 1000).toFixed(1)} кВт
                        </span>
                      )}
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF9800]" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionLink
              href="/admin/users"
              icon={<Users className="w-5 h-5" />}
              label="Пользователи"
              description="Управление ролями"
            />
            <QuickActionLink
              href="/admin/brands"
              icon={<Factory className="w-5 h-5" />}
              label="Бренды"
              description="Каталог производителей"
            />
            <QuickActionLink
              href="/admin/breakers"
              icon={<Zap className="w-5 h-5" />}
              label="Автоматы"
              description="Управление ценами"
            />
            <QuickActionLink
              href="/admin/settings"
              icon={<TrendingUp className="w-5 h-5" />}
              label="Настройки"
              description="Параметры системы"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  color,
  link,
  subtitle,
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  link: string;
  subtitle?: string;
}) {
  return (
    <Link href={link}>
      <Card className="hover:border-[#2962FF] transition cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </div>
            {change !== undefined && change > 0 && (
              <span className="text-xs px-2 py-0.5 bg-[#26A69A]/20 text-[#26A69A] rounded-full">
                +{change} за неделю
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#D1D4DC]">{value}</div>
          <div className="text-sm text-[#787B86] mt-1">{title}</div>
          {subtitle && (
            <div className="text-xs text-[#50535E] mt-1">{subtitle}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickActionLink({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 bg-[#131722] border border-[#363A45] rounded-md hover:border-[#2962FF] transition"
    >
      <div className="w-10 h-10 rounded-md bg-[#2962FF]/10 flex items-center justify-center text-[#2962FF] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#D1D4DC]">{label}</div>
        <div className="text-xs text-[#787B86] truncate">{description}</div>
      </div>
    </Link>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString("ru-RU");
}
