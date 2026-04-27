import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConstructorForm from "./ConstructorForm";

export default function ConstructorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#D1D4DC] mb-2">
              Новый проект
            </h1>
            <p className="text-[#787B86]">
              Опишите вашу квартиру или дом — мы рассчитаем щит
            </p>
          </div>
          <ConstructorForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
