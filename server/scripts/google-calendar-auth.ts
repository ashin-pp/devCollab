/**
 * One-time Google Calendar + Meet OAuth (loopback).
 *
 * Usage (from server/):
 *   npm run google:auth
 *
 * Opens the browser, captures the auth code on localhost, writes src/config/token.json.
 */
import fs from "fs";
import http from "http";
import { exec } from "child_process";
import { URL } from "url";
import { google } from "googleapis";
import { GoogleAuthService } from "../src/infrastructure/services/google-auth.service";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function loadClientSecrets(): { client_id: string; client_secret: string } {
  const raw = JSON.parse(fs.readFileSync(GoogleAuthService.credentialsPath, "utf-8"));
  const block = raw.installed || raw.web;
  if (!block?.client_id || !block?.client_secret) {
    throw new Error(`Invalid credentials.json at ${GoogleAuthService.credentialsPath}`);
  }
  return { client_id: block.client_id, client_secret: block.client_secret };
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

async function waitForCode(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url || "/", `http://localhost:${port}`);
        const code = url.searchParams.get("code");
        const err = url.searchParams.get("error");

        if (err) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`<h2>Auth failed: ${err}</h2><p>You can close this tab.</p>`);
          server.close();
          reject(new Error(`Google OAuth error: ${err}`));
          return;
        }

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h2>Missing code</h2><p>You can close this tab.</p>");
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h2>DevCollab connected to Google Calendar</h2><p>You can close this tab and return to the terminal.</p>"
        );
        server.close();
        resolve(code);
      } catch (e) {
        server.close();
        reject(e);
      }
    });

    server.listen(port, "127.0.0.1");
    server.on("error", reject);

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for Google login (5 minutes)."));
    }, 5 * 60_000);
  });
}

async function main(): Promise<void> {
  console.log("Connecting Google Calendar for DevCollab Meet links…");
  console.log(`credentials: ${GoogleAuthService.credentialsPath}`);
  console.log(`token file:  ${GoogleAuthService.tokenPath}`);

  if (!fs.existsSync(GoogleAuthService.credentialsPath)) {
    throw new Error(`Missing credentials.json at ${GoogleAuthService.credentialsPath}`);
  }

  GoogleAuthService.clearSavedAuth();

  const { client_id, client_secret } = loadClientSecrets();
  // Free port on loopback — Desktop OAuth clients allow http://localhost:<any>
  const port = 53682;
  const redirectUri = `http://localhost:${port}`;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("\nOpening browser for Google login…");
  console.log("If it does not open, visit this URL:\n");
  console.log(authUrl);
  console.log("");

  openBrowser(authUrl);
  const code = await waitForCode(port);

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Persist via the same path authorize() uses
  fs.writeFileSync(GoogleAuthService.tokenPath, JSON.stringify(tokens, null, 2));
  console.log(`[GoogleAuth] Token stored at ${GoogleAuthService.tokenPath}`);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Smoke-test Meet creation (same path as /schedule)
  const starts = new Date(Date.now() + 60 * 60_000);
  const ends = new Date(starts.getTime() + 15 * 60_000);
  const insert = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: "DevCollab Meet auth check (safe to delete)",
      start: { dateTime: starts.toISOString() },
      end: { dateTime: ends.toISOString() },
      conferenceData: {
        createRequest: {
          requestId: `devcollab-auth-check-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink =
    insert.data.hangoutLink ||
    insert.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;

  if (insert.data.id) {
    await calendar.events.delete({ calendarId: "primary", eventId: insert.data.id }).catch(() => undefined);
  }

  if (!meetLink) {
    throw new Error("Calendar auth worked but Google did not return a Meet link. Ensure Meet is enabled on this Google account.");
  }

  console.log("\nSuccess! Google Meet link works:");
  console.log(meetLink);
  console.log("Restart `npm run dev`, then use /schedule — Meet links will be created.\n");
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("\nGoogle Calendar auth failed:", msg);
  process.exit(1);
});
