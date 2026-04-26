import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ConstructorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1 mb-6 bg-[#1E222D] border border-[#363A45] rounded-full text-sm text-[#FF9800]">
            🚧 В разработке
          </div>

          <h1 className="text-5xl font-bold text-[#D1D4DC] mb-6">
            Конструктор электрощита
          </h1>

          <p className="text-xl text-[#787B86] mb-10">
            Здесь будет интерактивный конструктор. Пока что — заглушка, 
            но скоро вы сможете собирать свой щит здесь!
          </p>

          <div className="p-8 bg-[#1E222D] border border-[#363A45] rounded-lg">
            <p className="text-[#787B86]">
              🛠 Страница появится на <strong className="text-[#2962FF]">Этапе 4–6</strong>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}