import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#363A45] bg-[#1E222D]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#2962FF] rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#D1D4DC]">МОЙ ЩИТ</h1>
            <p className="text-xs text-[#787B86]">
              Конструктор электрощитов
            </p>
          </div>
        </Link>

        {/* Навигация */}
<nav className="hidden md:flex items-center gap-6">
  <Link
    href="/projects"
    className="text-[#D1D4DC] hover:text-[#2962FF] transition"
  >
    Мои проекты
  </Link>
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
</nav>

        {/* Кнопка входа */}
        <Link
          href="/login"
          className="px-5 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white rounded-md font-medium transition"
        >
          Войти
        </Link>
      </div>
    </header>
  );
}