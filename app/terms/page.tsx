import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Пользовательское соглашение — Мой Щит",
  description: "Правила использования сервиса «Мой Щит»",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-[#D1D4DC] mb-2">
                Пользовательское соглашение
              </h1>
              <p className="text-[#787B86] mb-8">
                Редакция от {new Date().toLocaleDateString("ru-RU")}
              </p>

              <Section title="1. Термины">
                <ul>
                  <li>
                    <strong>Сервис</strong> — онлайн-сервис «Мой Щит», размещённый
                    на домене myshchit.ru
                  </li>
                  <li>
                    <strong>Пользователь</strong> — лицо, использующее Сервис
                  </li>
                  <li>
                    <strong>Проект</strong> — данные электрощита, созданные
                    Пользователем в Сервисе
                  </li>
                </ul>
              </Section>

              <Section title="2. Права и обязанности пользователя">
                <p>Пользователь имеет право:</p>
                <ul>
                  <li>Бесплатно пользоваться базовыми функциями Сервиса</li>
                  <li>Создавать, редактировать и удалять свои проекты</li>
                  <li>Удалить свой аккаунт в любое время</li>
                </ul>
                <p>Пользователь обязуется:</p>
                <ul>
                  <li>Не передавать свои учётные данные третьим лицам</li>
                  <li>Не нарушать работу Сервиса (DDoS, взлом, спам)</li>
                  <li>Не использовать Сервис в противоправных целях</li>
                </ul>
              </Section>

              <Section title="3. Права и обязанности администрации">
                <p>Администрация имеет право:</p>
                <ul>
                  <li>Заблокировать учётную запись при нарушении правил</li>
                  <li>
                    Проводить технические работы, приводящие к временной
                    недоступности Сервиса
                  </li>
                  <li>Изменять функционал Сервиса</li>
                </ul>
              </Section>

              <Section title="4. Отказ от гарантий">
                <p>
                  Сервис предоставляется «как есть». Администрация не гарантирует
                  бесперебойную работу и отсутствие ошибок.
                </p>
                <p>
                  Расчёты Сервиса имеют{" "}
                  <strong>ориентировочный характер</strong>. Финальное решение о
                  составе электрощита принимает квалифицированный электрик.
                </p>
              </Section>

              <Section title="5. Заключительные положения">
                <p>
                  Все споры регулируются законодательством Российской Федерации.
                </p>
                <p>
                  Email для связи: <strong>info@myshchit.ru</strong>
                </p>
              </Section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-[#D1D4DC] mb-3 mt-6">{title}</h2>
      <div className="text-[#787B86] space-y-2 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
