"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Percent, Settings2, CreditCard, Globe, Mail, Phone, ToggleLeft, ToggleRight } from "lucide-react";

type Settings = {
  id: string;
  lightingDemandFactor: number;
  socketDemandFactor: number;
  dedicatedDemandFactor: number;
  mixedDemandFactor: number;
  defaultProtectionLevel: string;
  defaultNetworkType: string;
  defaultCableLength: number;
  defaultBrandSlug: string;
  pdfPriceRub: number;
  subscriptionPriceRub: number;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  emailFrom: string;
  emailWelcomeSubject: string;
  emailWelcomeBody: string;
  emailPaymentSubject: string;
  emailPaymentBody: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactTelegram: string | null;
  registrationEnabled: boolean;
  paymentsEnabled: boolean;
  maintenanceMode: boolean;
};

const PROTECTION_LEVELS = [
  { value: "MINIMAL", label: "Минимальная", desc: "Только мокрые зоны + улица" },
  { value: "BASIC", label: "Базовая", desc: "+ все розетки (рекомендуется)" },
  { value: "MAXIMUM", label: "Максимальная", desc: "УЗО на все линии кроме света" },
  { value: "PARANOID", label: "Параноидальная", desc: "УЗО даже на свет" },
];

const NETWORK_TYPES = [
  { value: "SINGLE_PHASE", label: "Однофазная 220В" },
  { value: "THREE_PHASE", label: "Трёхфазная 380В" },
];

function NumberInput({ label, value, onChange, min, max, step = 0.01, suffix }:
  { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div>
      <Label className="text-sm text-[#787B86]">{label}</Label>
      <div className="relative mt-1">
        <Input type="number" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="bg-[#131722] border-[#363A45] text-[#D1D4DC] pr-8" />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#50535E]">{suffix}</span>}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-sm text-[#787B86]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 bg-[#131722] border-[#363A45] text-[#D1D4DC]" />
    </div>
  );
}

function TextareaInput({ label, value, onChange, placeholder, rows = 3 }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <Label className="text-sm text-[#787B86]">{label}</Label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="mt-1 w-full rounded-md border border-[#363A45] bg-[#131722] text-[#D1D4DC] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2962FF] focus:border-transparent resize-y" />
    </div>
  );
}

function Toggle({ label, checked, onChange, description }:
  { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm text-[#D1D4DC]">{label}</div>
        {description && <div className="text-xs text-[#787B86]">{description}</div>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} className="shrink-0">
        {checked ? <ToggleRight className="w-8 h-8 text-[#26A69A]" /> : <ToggleLeft className="w-8 h-8 text-[#50535E]" />}
      </button>
    </div>
  );
}

export default function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [form, setForm] = useState<Settings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await updateSettings({
          lightingDemandFactor: form.lightingDemandFactor,
          socketDemandFactor: form.socketDemandFactor,
          dedicatedDemandFactor: form.dedicatedDemandFactor,
          mixedDemandFactor: form.mixedDemandFactor,
          defaultProtectionLevel: form.defaultProtectionLevel as "MINIMAL" | "BASIC" | "MAXIMUM" | "PARANOID",
          defaultNetworkType: form.defaultNetworkType as "SINGLE_PHASE" | "THREE_PHASE",
          defaultCableLength: form.defaultCableLength,
          defaultBrandSlug: form.defaultBrandSlug,
          pdfPriceRub: form.pdfPriceRub,
          subscriptionPriceRub: form.subscriptionPriceRub,
          siteTitle: form.siteTitle,
          siteDescription: form.siteDescription,
          siteKeywords: form.siteKeywords,
          emailFrom: form.emailFrom,
          emailWelcomeSubject: form.emailWelcomeSubject,
          emailWelcomeBody: form.emailWelcomeBody,
          emailPaymentSubject: form.emailPaymentSubject,
          emailPaymentBody: form.emailPaymentBody,
          contactEmail: form.contactEmail || undefined,
          contactPhone: form.contactPhone || undefined,
          contactTelegram: form.contactTelegram || undefined,
          registrationEnabled: form.registrationEnabled,
          paymentsEnabled: form.paymentsEnabled,
          maintenanceMode: form.maintenanceMode,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        alert("Ошибка: " + (e instanceof Error ? e.message : "Неизвестная"));
      }
    });
  };

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>{saved && <span className="text-sm text-[#26A69A]">✓ Сохранено</span>}</div>
        <Button onClick={handleSubmit} disabled={isPending} className="bg-[#2962FF] hover:bg-[#1E53E5]">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Сохранить все настройки
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="w-5 h-5 text-[#FF9800]" />
            Коэффициенты одновременности (Ks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NumberInput label="Свет" value={form.lightingDemandFactor} onChange={(v) => updateField("lightingDemandFactor", v)} min={0} max={1} step={0.05} />
            <NumberInput label="Розетки" value={form.socketDemandFactor} onChange={(v) => updateField("socketDemandFactor", v)} min={0} max={1} step={0.05} />
            <NumberInput label="Отдельные линии" value={form.dedicatedDemandFactor} onChange={(v) => updateField("dedicatedDemandFactor", v)} min={0} max={1} step={0.05} />
            <NumberInput label="Смешанные" value={form.mixedDemandFactor} onChange={(v) => updateField("mixedDemandFactor", v)} min={0} max={1} step={0.05} />
          </div>
          <p className="mt-3 text-xs text-[#787B86]">
            💡 Коэффициент показывает, какая доля мощности потребителей работает одновременно.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="w-5 h-5 text-[#2962FF]" />
            Дефолтные параметры расчёта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-[#787B86]">Уровень защиты по умолчанию</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {PROTECTION_LEVELS.map((pl) => (
                  <button key={pl.value} type="button" onClick={() => updateField("defaultProtectionLevel", pl.value)}
                    className={`px-3 py-2 rounded-md text-xs text-left border transition ${form.defaultProtectionLevel === pl.value ? "border-[#2962FF] bg-[#2962FF]/10 text-[#D1D4DC]" : "border-[#363A45] text-[#787B86] hover:border-[#50535E]"}`}>
                    <div className="font-semibold">{pl.label}</div>
                    <div className="text-[10px] opacity-70">{pl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#787B86]">Тип сети по умолчанию</Label>
              <div className="space-y-2 mt-1">
                {NETWORK_TYPES.map((nt) => (
                  <button key={nt.value} type="button" onClick={() => updateField("defaultNetworkType", nt.value)}
                    className={`w-full px-3 py-2 rounded-md text-sm text-left border transition ${form.defaultNetworkType === nt.value ? "border-[#2962FF] bg-[#2962FF]/10 text-[#D1D4DC]" : "border-[#363A45] text-[#787B86] hover:border-[#50535E]"}`}>
                    {nt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput label="Средняя длина кабеля по умолчанию" value={form.defaultCableLength} onChange={(v) => updateField("defaultCableLength", v)} min={1} max={500} step={1} suffix="м" />
            <TextInput label="Бренд по умолчанию (slug)" value={form.defaultBrandSlug} onChange={(v) => updateField("defaultBrandSlug", v)} placeholder="abb, iek, schneider..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5 text-[#26A69A]" />
            Цены и монетизация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput label="Цена PDF-проекта" value={form.pdfPriceRub} onChange={(v) => updateField("pdfPriceRub", v)} min={0} max={10000} step={10} suffix="₽" />
            <NumberInput label="Цена подписки PRO" value={form.subscriptionPriceRub} onChange={(v) => updateField("subscriptionPriceRub", v)} min={0} max={10000} step={10} suffix="₽/мес" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-5 h-5 text-[#9C27B0]" />
            SEO и мета-данные
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextInput label="Заголовок сайта (title)" value={form.siteTitle} onChange={(v) => updateField("siteTitle", v)} />
          <TextareaInput label="Описание сайта (meta description)" value={form.siteDescription} onChange={(v) => updateField("siteDescription", v)} rows={2} />
          <TextInput label="Ключевые слова (meta keywords)" value={form.siteKeywords} onChange={(v) => updateField("siteKeywords", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="w-5 h-5 text-[#EF5350]" />
            Email-шаблоны
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextInput label="Email отправителя" value={form.emailFrom} onChange={(v) => updateField("emailFrom", v)} placeholder="noreply@myshchit.ru" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <TextInput label="Тема письма при регистрации" value={form.emailWelcomeSubject} onChange={(v) => updateField("emailWelcomeSubject", v)} />
              <TextareaInput label="Текст письма при регистрации" value={form.emailWelcomeBody} onChange={(v) => updateField("emailWelcomeBody", v)} rows={4} />
            </div>
            <div className="space-y-3">
              <TextInput label="Тема письма об оплате" value={form.emailPaymentSubject} onChange={(v) => updateField("emailPaymentSubject", v)} />
              <TextareaInput label="Текст письма об оплате" value={form.emailPaymentBody} onChange={(v) => updateField("emailPaymentBody", v)} rows={4} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="w-5 h-5 text-[#00BCD4]" />
            Контакты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput label="Email поддержки" value={form.contactEmail || ""} onChange={(v) => updateField("contactEmail", v || null)} placeholder="support@myshchit.ru" />
            <TextInput label="Телефон" value={form.contactPhone || ""} onChange={(v) => updateField("contactPhone", v || null)} placeholder="+7 (999) 123-45-67" />
            <TextInput label="Telegram" value={form.contactTelegram || ""} onChange={(v) => updateField("contactTelegram", v || null)} placeholder="@myshchit_support" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ToggleRight className="w-5 h-5 text-[#FF9800]" />
            Системные переключатели
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Toggle label="Регистрация новых пользователей" checked={form.registrationEnabled} onChange={(v) => updateField("registrationEnabled", v)} description="Разрешить создавать новые аккаунты" />
          <div className="h-px bg-[#363A45] my-1" />
          <Toggle label="Приём платежей" checked={form.paymentsEnabled} onChange={(v) => updateField("paymentsEnabled", v)} description="Включить оплату PDF и подписок" />
          <div className="h-px bg-[#363A45] my-1" />
          <Toggle label="Режим технического обслуживания" checked={form.maintenanceMode} onChange={(v) => updateField("maintenanceMode", v)} description="Показать заглушку для всех кроме админов" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending} className="bg-[#2962FF] hover:bg-[#1E53E5]">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Сохранить все настройки
        </Button>
      </div>
    </div>
  );
}
