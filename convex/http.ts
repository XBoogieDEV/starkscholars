import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// CORS preflight handler for all auth routes
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Will be restricted by trustedOrigins in Better Auth
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
};

// Handle OPTIONS preflight for /api/auth/* routes
http.route({
    path: "/api/auth/sign-up/email",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

http.route({
    path: "/api/auth/sign-in/email",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

http.route({
    path: "/api/auth/get-session",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

http.route({
    path: "/api/auth/sign-out",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
    }),
});

// Register Better Auth routes (handles actual POST/GET requests)
authComponent.registerRoutes(http, createAuth);

export default http;
