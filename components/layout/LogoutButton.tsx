"use client";

import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-[#787B86] hover:text-[#EF5350]"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </form>
  );
}
