import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="bg-[#1E222D] border border-[#363A45] rounded-lg p-8">
            <h1 className="text-2xl font-bold text-[#D1D4DC] mb-2">
              Вход в личный кабинет
            </h1>
            <p className="text-[#787B86] mb-6 text-sm">
              Форма входа появится на Этапе 7
            </p>

            <form className="space-y-4 opacity-50 pointer-events-none">
              <div>
                <label className="block text-sm text-[#D1D4DC] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-[#131722] border border-[#363A45] rounded-md text-[#D1D4DC] focus:outline-none focus:border-[#2962FF]"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm text-[#D1D4DC] mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-[#131722] border border-[#363A45] rounded-md text-[#D1D4DC] focus:outline-none focus:border-[#2962FF]"
                  disabled
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white rounded-md font-medium transition"
                disabled
              >
                Войти
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#787B86]">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-[#2962FF] hover:underline">
                Зарегистрироваться
              </Link>
            </div>
          </div>

          <Link
            href="/"
            className="block text-center mt-6 text-[#787B86] hover:text-[#D1D4DC] transition"
          >
            ← На главную
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}