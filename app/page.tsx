import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* 🎯 Hero-секция */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
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

        {/* 📊 Преимущества */}
        <section id="features" className="px-6 py-20 bg-[#1E222D] border-t border-[#363A45]">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-[#D1D4DC] mb-12">
              Что умеет «Мой Щит»
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon="⚡"
                title="Подбор автоматов"
                description="Автоматически рассчитываем номиналы автоматов и УЗО по нагрузке и потребителям."
              />
              <FeatureCard
                icon="🔌"
                title="Расчёт кабелей"
                description="Подбираем правильное сечение провода для каждой линии с запасом по ПУЭ."
              />
              <FeatureCard
                icon="📄"
                title="PDF-проект"
                description="Готовая схема щита со спецификацией и ценами оборудования в PDF."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// 🧩 Компонент карточки-преимущества (объявлен в этом же файле)
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-[#131722] border border-[#363A45] rounded-lg hover:border-[#2962FF] transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-xl font-bold text-[#D1D4DC] mb-2">{title}</h4>
      <p className="text-[#787B86]">{description}</p>
    </div>
  );
}
