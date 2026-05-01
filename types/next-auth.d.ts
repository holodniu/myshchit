import { DefaultSession } from "next-auth";
import { UserRole, SubscriptionTier } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      subscription: SubscriptionTier;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    subscription?: SubscriptionTier;
  }
}
