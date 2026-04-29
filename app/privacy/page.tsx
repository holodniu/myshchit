import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Политика конфиденциальности — Мой Щит",
  description:
    "Политика обработки персональных данных в сервисе «Мой Щит»",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 prose prose-invert max-w-none">
              <h1 className="text-3xl font-bold text-[#D1D4DC] mb-2">
                Политика конфиденциальности
              </h1>
              <p className="text-[#787B86] mb-8">
                Редакция от {new Date().toLocaleDateString("ru-RU")}
              </p>

              <Section title="1. Общие положения">
                <p>
                  Настоящая Политика определяет порядок обработки и защиты
                  персональных данных пользователей сайта{" "}
                  <strong>myshchit.ru</strong> (далее — «Сервис»).
                </p>
                <p>
                  Используя Сервис, вы соглашаетесь с условиями настоящей
                  Политики.
                </p>
              </Section>

              <Section title="2. Какие данные мы собираем">
                <ul>
                  <li>
                    <strong>При регистрации:</strong> email, имя, пароль (в
                    зашифрованном виде)
                  </li>
                  <li>
                    <strong>При использовании:</strong> информация о ваших
                    проектах электрощитов (параметры, адрес, контакты, если вы
                    их указали)
                  </li>
                  <li>
                    <strong>Автоматически:</strong> IP-адрес, информация о
                    браузере, время посещения, действия на сайте
                  </li>
                </ul>
              </Section>

              <Section title="3. Цели обработки">
                <ul>
                  <li>Предоставление функций сервиса расчёта электрощитов</li>
                  <li>Аутентификация и идентификация пользователя</li>
                  <li>Связь с пользователем (уведомления, техподдержка)</li>
                  <li>Улучшение работы сервиса</li>
                  <li>Соблюдение требований законодательства РФ</li>
                </ul>
              </Section>

              <Section title="4. Правовые основания обработки">
                <p>Обработка персональных данных осуществляется на основании:</p>
                <ul>
                  <li>
                    Согласия пользователя, выраженного при регистрации на
                    Сервисе
                  </li>
                  <li>
                    Федерального закона от 27.07.2006 № 152-ФЗ «О персональных
                    данных»
                  </li>
                </ul>
              </Section>

              <Section title="5. Хранение данных">
                <p>
                  Персональные данные хранятся на серверах, расположенных на
                  территории Российской Федерации, в соответствии с
                  требованиями 152-ФЗ.
                </p>
                <p>
                  Срок хранения: до отзыва согласия пользователем или удаления
                  аккаунта.
                </p>
              </Section>

              <Section title="6. Передача данных третьим лицам">
                <p>
                  Мы не передаём ваши персональные данные третьим лицам, за
                  исключением случаев:
                </p>
                <ul>
                  <li>По требованию уполномоченных государственных органов</li>
                  <li>С вашего явного согласия</li>
                </ul>
              </Section>

              <Section title="7. Ваши права">
                <p>Вы имеете право:</p>
                <ul>
                  <li>Получить информацию о своих данных</li>
                  <li>Требовать уточнения или удаления данных</li>
                  <li>Отозвать согласие на обработку</li>
                  <li>Удалить свой аккаунт в любой момент</li>
                  <li>Обратиться в Роскомнадзор</li>
                </ul>
              </Section>

              <Section title="8. Файлы cookie">
                <p>
                  Сервис использует файлы cookie для обеспечения работы
                  аутентификации (сохранение сессии). Отключение cookie сделает
                  невозможным вход в личный кабинет.
                </p>
              </Section>

              <Section title="9. Безопасность">
                <p>
                  Мы применяем технические меры защиты: шифрование паролей
                  (bcrypt), защищённое соединение (HTTPS), ограничение доступа
                  к БД.
                </p>
              </Section>

              <Section title="10. Изменения политики">
                <p>
                  Мы можем периодически обновлять настоящую Политику. Актуальная
                  редакция всегда доступна на этой странице.
                </p>
              </Section>

              <Section title="11. Контакты">
                <p>
                  По вопросам обработки персональных данных:
                  <br />
                  Email: <strong>privacy@myshchit.ru</strong>
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
