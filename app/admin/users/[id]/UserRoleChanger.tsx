"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/admin/actions";
import { UserRole } from "@prisma/client";
import { ChevronDown, Loader2 } from "lucide-react";

export default function UserRoleChanger({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(currentRole);

  const handleChange = (newRole: UserRole) => {
    if (newRole === role) {
      setIsOpen(false);
      return;
    }

    if (
      !confirm(
        `Изменить роль пользователя на ${newRole}?${
          newRole === "ADMIN" ? "\n\n⚠️ Админ получает доступ к админке!" : ""
        }`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        setRole(newRole);
        setIsOpen(false);
      } catch (e) {
        alert(
          "Ошибка: " + (e instanceof Error ? e.message : "Неизвестная ошибка")
        );
      }
    });
  };

  const roleStyles = {
    ADMIN: "bg-[#FF9800]/20 text-[#FF9800] border-[#FF9800]/30",
    PRO: "bg-[#2962FF]/20 text-[#2962FF] border-[#2962FF]/30",
    USER: "bg-[#363A45] text-[#787B86] border-[#363A45]",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-md border font-semibold transition ${roleStyles[role]}`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span className="text-xs opacity-70">Роль:</span>
            <span>{role}</span>
            <ChevronDown
              className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {isOpen && !isPending && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1E222D] border border-[#363A45] rounded-md shadow-2xl z-10">
          {(["USER", "PRO", "ADMIN"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleChange(r)}
              className={`w-full text-left px-4 py-2 hover:bg-[#2A2E39] transition flex items-center justify-between ${
                r === role ? "opacity-50" : ""
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  r === "ADMIN"
                    ? "text-[#FF9800]"
                    : r === "PRO"
                    ? "text-[#2962FF]"
                    : "text-[#D1D4DC]"
                }`}
              >
                {r}
              </span>
              {r === role && <span className="text-xs text-[#26A69A]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
