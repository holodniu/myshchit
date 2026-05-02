"use client";

import { useState, useTransition } from "react";
import { duplicateProject } from "@/app/constructor/actions";
import { Copy, Loader2, CheckCircle2 } from "lucide-react";

export default function DuplicateProjectButton({
  projectId,
}: {
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        await duplicateProject(projectId);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      } catch {
        // Ошибки игнорируем — revalidate обновит список
      }
    });
  };

  return (
    <button
      onClick={handleDuplicate}
      disabled={isPending || done}
      title="Дублировать проект"
      className="p-1.5 text-[#787B86] hover:text-[#2962FF] hover:bg-[#2962FF]/10 rounded transition"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="w-4 h-4 text-[#26A69A]" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}
