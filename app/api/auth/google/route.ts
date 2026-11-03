
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { oauth2Client, GOOGLE_SCOPES } from "@/lib/google-calendar";

export async function GET() {
  const state = randomBytes(32).toString("hex");

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state,
    include_granted_scopes: true,
  });

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
