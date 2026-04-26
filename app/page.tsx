import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 🏠 Хедер */}
      <header className="border-b border-[#363A45] bg-[#1E222D]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2962FF] rounded-lg flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#D1D4DC]">МОЙ ЩИТ</h1>
              <p className="text-xs text-[#787B86]">
                Конструктор электрощитов
              </p>
            </div>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[#D1D4DC] hover:text-[#2962FF] transition">
              Возможности
            </a>
            <a href="#pricing" className="text-[#D1D4DC] hover:text-[#2962FF] transition">
              Тарифы
            </a>
            <a href="#contact" className="text-[#D1D4DC] hover:text-[#2962FF] transition">
              Контакты
            </a>
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

      {/* 🎯 Hero-секция */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl text-center">
          <div className="inline-block px-4 py-1 mb-6 bg-[#1E222D] border border-[#363A45] rounded-full text-sm text-[#26A69A]">
            ⚡ Онлайн расчёт • Мгновенный результат
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-[#D1D4DC] mb-6 leading-tight">
            Соберите электрощит
            <br />
            <span className="text-[#2962FF]">за 5 минут</span>
          </h2>

          <p className="text-xl text-[#787B86] mb-10 max-w-2xl mx-auto">
            Укажите комнаты, розетки, светильники и бытовую технику — 
            мы автоматически подберём автоматы, УЗО, кабели и визуализируем щит.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/constructor"
              className="px-8 py-4 bg-[#2962FF] hover:bg-[#1E53E5] text-white rounded-lg font-semibold text-lg transition shadow-lg shadow-[#2962FF]/30"
            >
              🚀 Начать расчёт — бесплатно
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-[#1E222D] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#363A45] rounded-lg font-semibold text-lg transition"
            >
              ▶ Посмотреть демо
            </Link>
          </div>
        </div>
      </section>

      {/* 📊 Блок с преимуществами */}
      <section id="features" className="px-6 py-20 bg-[#1E222D] border-t border-[#363A45]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#D1D4DC] mb-12">
            Что умеет «Мой Щит»
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Карточка 1 */}
            <div className="p-6 bg-[#131722] border border-[#363A45] rounded-lg hover:border-[#2962FF] transition">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-xl font-bold text-[#D1D4DC] mb-2">
                Подбор автоматов
              </h4>
              <p className="text-[#787B86]">
                Автоматически рассчитываем номиналы автоматов и УЗО по нагрузке
                и потребителям.
              </p>
            </div>

            {/* Карточка 2 */}
            <div className="p-6 bg-[#131722] border border-[#363A45] rounded-lg hover:border-[#2962FF] transition">
              <div className="text-3xl mb-4">🔌</div>
              <h4 className="text-xl font-bold text-[#D1D4DC] mb-2">
                Расчёт кабелей
              </h4>
              <p className="text-[#787B86]">
                Подбираем правильное сечение провода для каждой линии с запасом
                по ПУЭ.
              </p>
            </div>

            {/* Карточка 3 */}
            <div className="p-6 bg-[#131722] border border-[#363A45] rounded-lg hover:border-[#2962FF] transition">
              <div className="text-3xl mb-4">📄</div>
              <h4 className="text-xl font-bold text-[#D1D4DC] mb-2">
                PDF-проект
              </h4>
              <p className="text-[#787B86]">
                Готовая схема щита со спецификацией и ценами оборудования в PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📞 Футер */}
      <footer className="bg-[#131722] border-t border-[#363A45] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[#787B86] text-sm">
            © 2025 МОЙ ЩИТ. Все права защищены.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-[#787B86] hover:text-[#D1D4DC] transition">
              Оферта
            </a>
            <a href="#" className="text-[#787B86] hover:text-[#D1D4DC] transition">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-[#787B86] hover:text-[#D1D4DC] transition">
              Контакты
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
