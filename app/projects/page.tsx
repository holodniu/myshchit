import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Zap, Home, Calendar } from "lucide-react";
import DeleteProjectButton from "./DeleteProjectButton";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const projects = userId
    ? await prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { rooms: true } },
        },
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#D1D4DC] mb-2">
                Мои проекты
              </h1>
              <p className="text-[#787B86]">
                {projects.length === 0
                  ? "У вас пока нет проектов"
                  : `Всего проектов: ${projects.length}`}
              </p>
            </div>
            <Link href="/constructor">
              <Button className="bg-[#2962FF] hover:bg-[#1E53E5]">
                <Plus className="w-4 h-4 mr-2" /> Новый проект
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <Card className="py-16">
              <CardContent className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-[#D1D4DC] mb-2">
                  Создайте свой первый проект
                </h3>
                <p className="text-[#787B86] mb-6">
                  Опишите квартиру или дом — мы рассчитаем щит
                </p>
                <Link href="/constructor">
                  <Button className="bg-[#2962FF] hover:bg-[#1E53E5]">
                    <Plus className="w-4 h-4 mr-2" /> Создать проект
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:border-[#2962FF] transition"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:text-[#2962FF] transition"
                        >
                          {project.name}
                        </Link>
                      </CardTitle>
                      <DeleteProjectButton projectId={project.id} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-[#787B86]">
                      <span className="flex items-center gap-1">
                        <Home className="w-4 h-4" /> {project._count.rooms}
                      </span>
                      {project.totalPower && (
                        <span className="flex items-center gap-1 text-[#FF9800]">
                          <Zap className="w-4 h-4" />{" "}
                          {(project.totalPower / 1000).toFixed(1)} кВт
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#50535E]">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="block text-sm text-[#2962FF] hover:underline"
                    >
                      Открыть проект →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
