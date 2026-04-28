"use client";

import { useState, useTransition } from "react";
import {
  updateBreakerPrice,
  updateRcdPrice,
  updateCablePrice,
} from "@/app/admin/actions";
import { Check, X, Edit2, Loader2 } from "lucide-react";

export default function PriceEditor({
  id,
  price,
  type,
  unit = "₽",
}: {
  id: string;
  price: number;
  type: "breaker" | "rcd" | "cable";
  unit?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(price.toString());
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      alert("Введите корректную цену");
      return;
    }

    startTransition(async () => {
      try {
        if (type === "breaker") await updateBreakerPrice(id, num);
        else if (type === "rcd") await updateRcdPrice(id, num);
        else await updateCablePrice(id, num);
        setIsEditing(false);
      } catch (e) {
        alert("Ошибка: " + (e instanceof Error ? e.message : "Неизвестная"));
      }
    });
  };

  const handleCancel = () => {
    setValue(price.toString());
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#363A45] transition group"
      >
        <span className="font-mono text-[#26A69A] font-semibold">
          {price.toLocaleString("ru-RU")} {unit}
        </span>
        <Edit2 className="w-3 h-3 text-[#50535E] group-hover:text-[#D1D4DC]" />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") handleCancel();
        }}
        autoFocus
        className="w-24 px-2 py-1 bg-[#131722] border border-[#2962FF] rounded text-sm text-[#D1D4DC] font-mono text-right"
        disabled={isPending}
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="p-1 rounded bg-[#26A69A] hover:bg-[#1E8179] text-white"
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Check className="w-3 h-3" />
        )}
      </button>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="p-1 rounded bg-[#363A45] hover:bg-[#EF5350] text-[#D1D4DC]"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
