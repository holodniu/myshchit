import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Mail, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { projects: true },
      },
    },
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    pro: users.filter((u) => u.role === "PRO").length,
    regular: users.filter((u) => u.role === "USER").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#2962FF]" />
            Пользователи
          </h1>
          <p className="text-[#787B86] mt-1">
            Всего: {stats.total} · Админов: {stats.admins} · PRO: {stats.pro} ·
            USER: {stats.regular}
          </p>
        </div>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RoleCard label="Всего" count={stats.total} color="#D1D4DC" />
        <RoleCard label="Админы" count={stats.admins} color="#FF9800" />
        <RoleCard label="PRO" count={stats.pro} color="#2962FF" />
        <RoleCard label="Обычные" count={stats.regular} color="#787B86" />
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="py-12 text-center text-[#787B86]">
              <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Пока нет зарегистрированных пользователей</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#363A45] text-left">
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Пользователь
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Роль
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Подписка
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs text-center">
                      Проектов
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Регистрация
                    </th>
                    <th className="py-3 px-2 text-[#787B86] font-semibold uppercase text-xs">
                      Последний вход
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#2A2E39] hover:bg-[#1E222D]/60 transition"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#2962FF]/20 rounded-full flex items-center justify-center text-[#2962FF] font-bold shrink-0">
                            {(user.name || user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#D1D4DC] truncate">
                              {user.name || "Без имени"}
                            </div>
                            <div className="text-xs text-[#787B86] flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            user.subscription === "PRO"
                              ? "bg-[#FF9800]/20 text-[#FF9800]"
                              : user.subscription === "ONCE"
                              ? "bg-[#2962FF]/20 text-[#2962FF]"
                              : "bg-[#363A45] text-[#787B86]"
                          }`}
                        >
                          {user.subscription}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#26A69A]/10 rounded">
                          <ClipboardList className="w-3 h-3 text-[#26A69A]" />
                          <span className="font-mono text-[#26A69A]">
                            {user._count.projects}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[#787B86] text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.createdAt.toLocaleDateString("ru-RU")}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[#787B86] text-xs">
                        {user.lastLoginAt
                          ? user.lastLoginAt.toLocaleDateString("ru-RU")
                          : "—"}
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

function RoleCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-[#787B86]">{label}</div>
        <div className="text-2xl font-bold mt-1" style={{ color }}>
          {count}
        </div>
      </CardContent>
    </Card>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles = {
    ADMIN: "bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/30",
    PRO: "bg-[#2962FF]/20 text-[#2962FF] border border-[#2962FF]/30",
    USER: "bg-[#363A45] text-[#787B86] border border-[#363A45]",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
        styles[role as keyof typeof styles] || styles.USER
      }`}
    >
      {role}
    </span>
  );
}
