import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LogoutButton from "@/components/layout/LogoutButton";
import { Shield, User } from "lucide-react";

export const metadata = {
  title: "Админка — Мой Щит",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session?.user || userRole !== "ADMIN") {
    redirect("/projects");
  }

  return (
    <div className="flex min-h-screen bg-[#131722]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Верхняя полоса */}
        <header className="bg-[#1E222D] border-b border-[#363A45] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-[#FF9800]" />
            <span className="text-[#FF9800] font-semibold">
              Режим администратора
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-[#787B86]" />
              <span className="text-[#D1D4DC]">
                {session.user.name || session.user.email}
              </span>
              <span className="text-xs px-2 py-0.5 bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/30 rounded">
                ADMIN
              </span>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
