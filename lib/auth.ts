// Better Auth is now running on Convex via @convex-dev/better-auth
// This file re-exports from the server-specific auth module for compatibility

export { handler, getToken, isAuthenticated } from "./auth-server";
