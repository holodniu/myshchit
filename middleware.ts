import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/projects", "/constructor"];
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtected = PROTECTED_ROUTES.some((p) =>
    nextUrl.pathname.startsWith(p)
  );
  const isAuth = AUTH_ROUTES.includes(nextUrl.pathname);

  // Если на auth-странице и уже залогинен — на /projects
  if (isAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/projects", nextUrl));
  }

  // Если на защищённой и НЕ залогинен — на /login
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
