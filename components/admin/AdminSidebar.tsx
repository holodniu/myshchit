"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Factory,
  Zap,
  Shield,
  Cable,
  Settings,
  ChevronRight,
  Home,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/projects", label: "Проекты", icon: ClipboardList },
  { type: "divider" as const },
  { href: "/admin/brands", label: "Бренды", icon: Factory },
  { href: "/admin/breakers", label: "Автоматы", icon: Zap },
  { href: "/admin/rcds", label: "УЗО", icon: Shield },
  { href: "/admin/cables", label: "Кабели", icon: Cable },
  { type: "divider" as const },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[#1E222D] border-r border-[#363A45] min-h-screen p-4 flex flex-col">
      {/* Лого */}
      <Link href="/admin" className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 bg-[#2962FF] rounded-lg flex items-center justify-center text-xl">
          🛡️
        </div>
        <div>
          <div className="font-bold text-[#D1D4DC]">МОЙ ЩИТ</div>
          <div className="text-xs text-[#FF9800] font-semibold">АДМИНКА</div>
        </div>
      </Link>

      {/* Навигация */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === "divider") {
            return (
              <div key={`div-${idx}`} className="h-px bg-[#363A45] my-3" />
            );
          }

          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition group ${
                isActive
                  ? "bg-[#2962FF]/20 text-[#2962FF] border border-[#2962FF]/30"
                  : "text-[#787B86] hover:bg-[#131722] hover:text-[#D1D4DC]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Футер sidebar */}
      <div className="mt-4 pt-4 border-t border-[#363A45] space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[#787B86] hover:bg-[#131722] hover:text-[#D1D4DC] transition text-sm"
        >
          <Home className="w-4 h-4" />
          <span>На сайт</span>
        </Link>
        <div className="px-3 py-2 text-xs text-[#50535E]">
          Версия 0.1.0
        </div>
      </div>
    </aside>
  );
}
