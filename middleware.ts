import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/projects", "/constructor"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isProtected = PROTECTED_ROUTES.some((p) =>
    nextUrl.pathname.startsWith(p)
  );
  const isAuth = AUTH_ROUTES.includes(nextUrl.pathname);
  const isAdmin = ADMIN_ROUTES.some((p) => nextUrl.pathname.startsWith(p));

  // На auth-страницах и уже залогинен → на проекты
  if (isAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/projects", nextUrl));
  }

  // На защищённой странице, но не залогинен → на логин
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // На админке — нужна роль ADMIN
  if (isAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/projects", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

