import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    home: "/",
    signIn: "/auth?mode=login",
    signUp: "/auth?mode=register",
    afterSignIn: "/api/auth/post-auth",
    afterSignUp: "/api/auth/post-auth/",
  },
});