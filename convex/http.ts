import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// Register Better Auth routes with CORS enabled
// This uses trustedOrigins from Better Auth config automatically
authComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
