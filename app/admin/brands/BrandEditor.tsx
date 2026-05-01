"use client";

import { useState, useTransition } from "react";
import { updateBrand } from "@/app/admin/actions";
import { PriceClass } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Check, X, Loader2, Zap, Shield, Cable } from "lucide-react";

type Brand = {
  id: string;
  name: string;
  country: string;
  description: string;
  priceClass: PriceClass;
  website: string;
};

export default function BrandEditor({
  brand,
  counts,
}: {
  brand: Brand;
  counts: { breakers: number; rcds: number; cables: number };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(brand);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateBrand(brand.id, {
          name: form.name,
          country: form.country || undefined,
          description: form.description || undefined,
          priceClass: form.priceClass,
          website: form.website || undefined,
        });
        setIsEditing(false);
      } catch (e) {
        alert("Ошибка: " + (e instanceof Error ? e.message : "Неизвестная"));
      }
    });
  };

  const handleCancel = () => {
    setForm(brand);
    setIsEditing(false);
  };

  const priceClassColors: Record<PriceClass, string> = {
    BUDGET: "#26A69A",
    MID: "#2962FF",
    PREMIUM: "#FF9800",
  };

  const priceClassLabels: Record<PriceClass, string> = {
    BUDGET: "Бюджет",
    MID: "Средний",
    PREMIUM: "Премиум",
  };

  return (
    <div className="p-4 bg-[#131722] border border-[#363A45] rounded-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-[#D1D4DC]">
                  {brand.name}
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{
                    color: priceClassColors[brand.priceClass],
                    backgroundColor: `${priceClassColors[brand.priceClass]}20`,
                  }}
                >
                  {priceClassLabels[brand.priceClass]}
                </span>
                {brand.country && (
                  <span className="text-xs text-[#787B86]">
                    🌍 {brand.country}
                  </span>
                )}
              </div>
              {brand.description && (
                <p className="text-sm text-[#787B86] mt-2">{brand.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-[#787B86]">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {counts.breakers} автом.
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {counts.rcds} УЗО
                </span>
                <span className="flex items-center gap-1">
                  <Cable className="w-3 h-3" /> {counts.cables} кабелей
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Страна</Label>
                  <Input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    placeholder="Россия, Швейцария..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Ценовая категория</Label>
                <div className="flex gap-2 mt-1">
                  {(["BUDGET", "MID", "PREMIUM"] as PriceClass[]).map((pc) => (
                    <button
                      key={pc}
                      type="button"
                      onClick={() => setForm({ ...form, priceClass: pc })}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                        form.priceClass === pc
                          ? "ring-2"
                          : "opacity-50 hover:opacity-100"
                      }`}
                      style={{
                        color: priceClassColors[pc],
                        backgroundColor: `${priceClassColors[pc]}20`,
                        borderColor: priceClassColors[pc],
                      }}
                    >
                      {priceClassLabels[pc]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Премиум-бренд, лидер..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Сайт</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4 mr-1" /> Изменить
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="bg-[#26A69A] hover:bg-[#1E8179]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Сохранить
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
