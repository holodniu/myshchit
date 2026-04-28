"use client";

import { useTransition } from "react";
import {
  toggleBreakerActive,
  toggleRcdActive,
  toggleCableActive,
} from "@/app/admin/actions";
import { Loader2 } from "lucide-react";

export default function ActiveToggle({
  id,
  isActive,
  type,
}: {
  id: string;
  isActive: boolean;
  type: "breaker" | "rcd" | "cable";
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (type === "breaker") await toggleBreakerActive(id, !isActive);
        else if (type === "rcd") await toggleRcdActive(id, !isActive);
        else await toggleCableActive(id, !isActive);
      } catch (e) {
        alert("Ошибка: " + (e instanceof Error ? e.message : "Неизвестная"));
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        isActive ? "bg-[#26A69A]" : "bg-[#363A45]"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin mx-auto text-white" />
      ) : (
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
            isActive ? "translate-x-5" : "translate-x-1"
          }`}
        />
      )}
    </button>
  );
}
