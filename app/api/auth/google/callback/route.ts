
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { oauth2Client } from "@/lib/google-calendar";
import { encryptToken } from "@/lib/token-encryption";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const storedState = request.cookies.get("google_oauth_state")?.value;

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set("google_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });
    return response;
  };

  if (error) {
    return clearStateCookie(
      NextResponse.json(
        { error: "Google authorization was denied." },
        { status: 400 }
      )
    );
  }

  if (!code || !state || !storedState || state !== storedState) {
    return clearStateCookie(
      NextResponse.json(
        { error: "Invalid OAuth callback or state mismatch." },
        { status: 400 }
      )
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return clearStateCookie(
        NextResponse.json(
          {
            error:
              "No refresh token received. Revoke the existing Google access and authorize again.",
          },
          { status: 400 }
        )
      );
    }

    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    await prisma.googleCalendarCredential.upsert({
      where: { id: "organizer" },
      create: {
        id: "organizer",
        email: null,
        refreshToken: encryptedRefreshToken,
      },
      update: {
       email: null,
        refreshToken: encryptedRefreshToken,
      },
    });

    return clearStateCookie(
      NextResponse.json({
        success: true,
        message: "Google Calendar connected successfully.",
      })
    );
  } catch (error) {
    console.error("Google OAuth callback failed:", error);

    return clearStateCookie(
      NextResponse.json(
        { error: "Failed to connect Google Calendar." },
        { status: 500 }
      )
    );
  }
}
