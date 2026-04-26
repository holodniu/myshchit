import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-[#D1D4DC] mb-6">
            Демо-проект
          </h1>

          <p className="text-xl text-[#787B86] mb-10">
            Пример расчёта щита для 2-комнатной квартиры 60 м²
          </p>

          <div className="p-12 bg-[#1E222D] border border-[#363A45] rounded-lg">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-[#787B86] mb-6">
              Демо появится на <strong className="text-[#2962FF]">Этапе 6</strong>
            </p>
            <Link
              href="/constructor"
              className="inline-block px-6 py-3 bg-[#2962FF] hover:bg-[#1E53E5] text-white rounded-md font-medium transition"
            >
              Или соберите свой прямо сейчас →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}