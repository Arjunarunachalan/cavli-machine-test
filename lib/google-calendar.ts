
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/token-encryption";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectUri) {
  throw new Error("Google OAuth environment variables are missing");
}

export const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
];

export async function getOrganizerCalendar() {
  const credential = await prisma.googleCalendarCredential.findUnique({
    where: { id: "organizer" },
  });

  if (!credential) {
    throw new Error("Google Calendar organizer is not connected");
  }

  const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  auth.setCredentials({
    refresh_token: decryptToken(credential.refreshToken),
  });

  return google.calendar({
    version: "v3",
    auth,
  });
}
