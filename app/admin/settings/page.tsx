import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Info } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#D1D4DC] flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#787B86]" />
          Настройки системы
        </h1>
        <p className="text-[#787B86] mt-1">Глобальные параметры приложения</p>
      </div>

      <Card className="bg-[#2962FF]/10 border-[#2962FF]/30">
        <CardContent className="p-8 text-center">
          <Info className="w-16 h-16 mx-auto mb-4 text-[#2962FF]" />
          <h3 className="text-xl font-bold text-[#D1D4DC] mb-2">
            🚧 В разработке
          </h3>
          <p className="text-[#787B86] mb-4">
            Здесь появятся настройки: коэффициенты одновременности, дефолтные
            параметры, SEO-мета, email-шаблоны и другие системные параметры.
          </p>
          <p className="text-xs text-[#50535E]">Планируется в Этапе 8</p>
        </CardContent>
      </Card>
    </div>
  );
}
