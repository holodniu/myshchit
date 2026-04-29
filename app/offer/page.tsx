import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Публичная оферта — Мой Щит",
  description: "Публичная оферта сервиса «Мой Щит»",
};

export default function OfferPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-[#D1D4DC] mb-2">
                Публичная оферта
              </h1>
              <p className="text-[#787B86] mb-8">
                Редакция от {new Date().toLocaleDateString("ru-RU")}
              </p>

              <Section title="1. Предмет оферты">
                <p>
                  Настоящий документ является публичной офертой (предложением)
                  сервиса <strong>«Мой Щит»</strong> (далее — «Сервис»),
                  расположенного по адресу <strong>myshchit.ru</strong>.
                </p>
                <p>
                  Акцептом настоящей оферты является регистрация на Сервисе или
                  использование его функций.
                </p>
              </Section>

              <Section title="2. Описание услуг">
                <p>Сервис предоставляет следующие возможности:</p>
                <ul>
                  <li>Расчёт электрощитов онлайн</li>
                  <li>Подбор автоматов, УЗО, кабелей</li>
                  <li>Визуализация схемы щита</li>
                  <li>Формирование спецификации и сметы</li>
                  <li>Экспорт проекта в PDF</li>
                </ul>
              </Section>

              <Section title="3. Условия использования">
                <ul>
                  <li>
                    Базовый функционал Сервиса предоставляется{" "}
                    <strong>бесплатно</strong>
                  </li>
                  <li>
                    Пользователь обязуется предоставлять достоверную информацию
                    при регистрации
                  </li>
                  <li>
                    Пользователь несёт ответственность за сохранность своего
                    пароля
                  </li>
                </ul>
              </Section>

              <Section title="4. Ограничение ответственности">
                <p>
                  <strong>ВАЖНО:</strong> Сервис предоставляет{" "}
                  <strong>ориентировочные расчёты</strong>. Результаты расчётов
                  не являются проектной документацией.
                </p>
                <p>
                  Перед монтажом электрощита пользователь обязан:
                </p>
                <ul>
                  <li>Проконсультироваться с профессиональным электриком</li>
                  <li>Согласовать параметры с энергосбытовой компанией</li>
                  <li>Соблюдать требования ПУЭ и других нормативов</li>
                </ul>
                <p>
                  Администрация Сервиса не несёт ответственности за последствия
                  самостоятельного монтажа на основании расчётов Сервиса.
                </p>
              </Section>

              <Section title="5. Интеллектуальная собственность">
                <p>
                  Все материалы Сервиса (дизайн, код, база данных) являются
                  интеллектуальной собственностью администрации Сервиса.
                </p>
                <p>
                  Проекты, созданные пользователем, принадлежат пользователю.
                </p>
              </Section>

              <Section title="6. Изменения условий">
                <p>
                  Администрация Сервиса оставляет за собой право изменять
                  условия настоящей оферты. Актуальная версия всегда доступна на
                  этой странице.
                </p>
              </Section>

              <Section title="7. Контакты">
                <p>
                  Email: <strong>info@myshchit.ru</strong>
                  <br />
                  Сайт: <strong>myshchit.ru</strong>
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
