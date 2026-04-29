"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function DownloadPDFButton({
  projectId,
}: {
  projectId: string;
}) {
  const handleClick = () => {
    // Открываем специальную print-страницу в новой вкладке
    window.open(`/projects/${projectId}/print`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="bg-[#26A69A] hover:bg-[#1E8179] text-white"
    >
      <FileDown className="w-5 h-5 mr-2" />
      Скачать PDF-проект
    </Button>
  );
}
