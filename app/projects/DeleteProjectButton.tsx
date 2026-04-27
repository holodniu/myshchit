"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProject } from "@/app/constructor/actions";

export default function DeleteProjectButton({
  projectId,
}: {
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Удалить проект? Это действие нельзя отменить.")) return;

    startTransition(async () => {
      await deleteProject(projectId);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-[#EF5350] hover:text-[#EF5350] hover:bg-[#EF5350]/10"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
