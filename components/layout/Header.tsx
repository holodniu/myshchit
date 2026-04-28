import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import { User, Shield } from "lucide-react";

export default async function Header() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-[#363A45] bg-[#1E222D]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#2962FF] rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#D1D4DC]">МОЙ ЩИТ</h1>
            <p className="text-xs text-[#787B86]">Конструктор электрощитов</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {session && (
            <Link
              href="/projects"
              className="text-[#D1D4DC] hover:text-[#2962FF] transition"
            >
              Мои проекты
            </Link>
          )}
          <Link
            href="/#features"
            className="text-[#D1D4DC] hover:text-[#2962FF] transition"
          >
            Возможности
          </Link>
          <Link
            href="/#pricing"
            className="text-[#D1D4DC] hover:text-[#2962FF] transition"
          >
            Тарифы
          </Link>
          <Link
            href="/brands"
            className="text-[#D1D4DC] hover:text-[#2962FF] transition"
          >
            Бренды
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-[#FF9800] hover:text-[#FFB74D] transition font-semibold"
            >
              <Shield className="w-4 h-4" />
              Админка
            </Link>
          )}
        </nav>

        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-[#787B86]" />
              <span className="text-[#D1D4DC]">
                {session.user.name || session.user.email}
              </span>
              {isAdmin && (
                <span className="text-xs px-2 py-0.5 bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/30 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="px-5 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white rounded-md font-medium transition"
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}

