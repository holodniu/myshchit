"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <Card>
      <CardContent className="p-8">
        <h1 className="text-2xl font-bold text-[#D1D4DC] mb-6">
          Вход в личный кабинет
        </h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#EF5350]/10 border border-[#EF5350]/30 rounded-md text-[#EF5350] text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#2962FF] hover:bg-[#1E53E5]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Входим...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#787B86]">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-[#2962FF] hover:underline">
            Зарегистрироваться
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
