import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    home: "/",
    signIn: "/auth",           // login normal
    signUp: "/onboarding",     // SOLO registro institución + super admin
    afterSignIn: "/post-auth",
    afterSignUp: "/post-auth",
  },
});

