"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectSettings } from "@/app/constructor/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Shield, MapPin, User, Wrench, Cable } from "lucide-react";
import type { ProtectionLevel } from "@prisma/client";

type Props = {
  projectId: string;
  initialSettings: {
    protectionLevel: ProtectionLevel;
    address: string;
    clientName: string;
    clientPhone: string;
    installerName: string;
    cableLengthAvg: number;
  };
};

const PROTECTION_LEVELS: Array<{
  value: ProtectionLevel;
  label: string;
  description: string;
  color: string;
  icon: string;
}> = [
  {
    value: "MINIMAL",
    label: "Минимальная",
    description: "Только мокрые зоны + улица (по ПУЭ минимум)",
    color: "#FF9800",
    icon: "⚡",
  },
  {
    value: "BASIC",
    label: "Базовая",
    description: "+ УЗО на все розеточные группы (рекомендуется)",
    color: "#26A69A",
    icon: "✅",
  },
  {
    value: "MAXIMUM",
    label: "Максимальная",
    description: "УЗО на все линии, кроме освещения",
    color: "#2962FF",
    icon: "🛡️",
  },
  {
    value: "PARANOID",
    label: "Параноидальная",
    description: "УЗО на абсолютно все линии, включая свет",
    color: "#EF5350",
    icon: "🔒",
  },
];

export default function SettingsForm({ projectId, initialSettings }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState(initialSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateProjectSettings(projectId, {
          protectionLevel: settings.protectionLevel,
          address: settings.address || undefined,
          clientName: settings.clientName || undefined,
          clientPhone: settings.clientPhone || undefined,
          installerName: settings.installerName || undefined,
          cableLengthAvg: settings.cableLengthAvg,
        });
        router.push(`/projects/${projectId}`);
        router.refresh();
      } catch (e) {
        alert(
          "Ошибка: " + (e instanceof Error ? e.message : "Неизвестная ошибка")
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🛡️ Уровень защиты */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#26A69A]" />
            Уровень защиты УЗО
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#787B86] mb-4">
            Определяет, где ставить УЗО. Чем выше уровень — тем больше УЗО и выше стоимость.
          </p>
          <div className="space-y-2">
            {PROTECTION_LEVELS.map((level) => (
              <label
                key={level.value}
                className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition ${
                  settings.protectionLevel === level.value
                    ? "bg-[#131722]"
                    : "bg-[#1E222D]/50 hover:bg-[#131722]"
                }`}
                style={{
                  borderColor:
                    settings.protectionLevel === level.value
                      ? level.color
                      : "#363A45",
                }}
              >
                <input
                  type="radio"
                  name="protectionLevel"
                  value={level.value}
                  checked={settings.protectionLevel === level.value}
                  onChange={() =>
                    setSettings({ ...settings, protectionLevel: level.value })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{level.icon}</span>
                    <span
                      className="font-bold"
                      style={{ color: level.color }}
                    >
                      {level.label}
                    </span>
                  </div>
                  <div className="text-sm text-[#787B86] mt-1">
                    {level.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[#FF9800]/10 border border-[#FF9800]/30 rounded-md text-xs text-[#FF9800]">
            ⚠️ При изменении уровня защиты нужно будет <strong>пересчитать щит</strong> —
            расчёт автоматически сбросится.
          </div>
        </CardContent>
      </Card>

      {/* 📍 Адрес объекта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2962FF]" />
            Адрес объекта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Адрес монтажа</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              placeholder="г. Москва, ул. Ленина 42, кв. 15"
              className="mt-1"
            />
            <p className="text-xs text-[#787B86] mt-1">
              Будет указан в PDF-проекте
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 👤 Заказчик */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#FF9800]" />
            Заказчик
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientName">ФИО</Label>
            <Input
              id="clientName"
              value={settings.clientName}
              onChange={(e) =>
                setSettings({ ...settings, clientName: e.target.value })
              }
              placeholder="Иванов Иван Иванович"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Телефон</Label>
            <Input
              id="clientPhone"
              value={settings.clientPhone}
              onChange={(e) =>
                setSettings({ ...settings, clientPhone: e.target.value })
              }
              placeholder="+7 (999) 123-45-67"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 🧑‍🔧 Монтажник */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#26A69A]" />
            Монтажник / Электрик
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="installerName">ФИО специалиста</Label>
            <Input
              id="installerName"
              value={settings.installerName}
              onChange={(e) =>
                setSettings({ ...settings, installerName: e.target.value })
              }
              placeholder="Петров Пётр Петрович"
              className="mt-1"
            />
            <p className="text-xs text-[#787B86] mt-1">
              Для идентификации автора монтажа
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 📏 Параметры расчёта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cable className="w-5 h-5 text-[#EF5350]" />
            Параметры сметы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="cableLengthAvg">
              Средняя длина кабеля на линию, м
            </Label>
            <Input
              id="cableLengthAvg"
              type="number"
              min={1}
              max={100}
              step={1}
              value={settings.cableLengthAvg}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cableLengthAvg: parseFloat(e.target.value) || 15,
                })
              }
              className="mt-1 max-w-xs"
            />
            <p className="text-xs text-[#787B86] mt-1">
              Используется для расчёта стоимости кабеля. По умолчанию 15м —
              типично для квартиры 60-80 м².
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}`)}
          disabled={isPending}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#2962FF] hover:bg-[#1E53E5]"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохраняем...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
