import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#131722] border-t border-[#363A45] px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Колонка 1: О проекте */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#2962FF] rounded-md flex items-center justify-center">
                🛡️
              </div>
              <span className="font-bold text-[#D1D4DC]">МОЙ ЩИТ</span>
            </div>
            <p className="text-sm text-[#787B86] mb-3">
              Конструктор электрощитов онлайн. Расчёт за 5 минут.
            </p>
            <p className="text-xs text-[#50535E]">
              © 2025–{new Date().getFullYear()} МОЙ ЩИТ
            </p>
          </div>

          {/* Колонка 2: Продукт */}
          <div>
            <h4 className="font-semibold text-[#D1D4DC] mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/constructor"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Конструктор
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Демо
                </Link>
              </li>
              <li>
                <Link
                  href="/brands"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Бренды
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Возможности
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Аккаунт */}
          <div>
            <h4 className="font-semibold text-[#D1D4DC] mb-4">Аккаунт</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Войти
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Регистрация
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Мои проекты
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Правовая */}
          <div>
            <h4 className="font-semibold text-[#D1D4DC] mb-4">Юридическое</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/offer"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Публичная оферта
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@myshchit.ru"
                  className="text-[#787B86] hover:text-[#D1D4DC] transition"
                >
                  Связаться с нами
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="pt-6 border-t border-[#363A45] flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-[#787B86]">
            Расчёты носят{" "}
            <span className="text-[#FF9800]">ориентировочный характер</span>.
            Перед монтажом — консультируйтесь с электриком.
          </div>
          <div className="text-[#50535E] text-xs">
            Сделано с ⚡ в России
          </div>
        </div>
      </div>
    </footer>
  );
}
