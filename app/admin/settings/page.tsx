import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { getSettings } from "./data";
import SettingsForm from "./SettingsForm";

export const metadata = {
  title: "Настройки системы — Админка",
};

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#787B86]" />
          Настройки системы
        </h1>
        <p className="text-[#787B86] mt-1">Глобальные параметры приложения</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <SettingsForm initialSettings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
