import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import readline from "readline";

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function resolveConfigDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'src/config'),
    path.resolve(process.cwd(), 'src/infrastructure/config'),
    path.resolve(process.cwd(), 'src/infra/config'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'credentials.json'))) return dir;
  }
  return candidates[0] as string;
}

const CONFIG_DIR = resolveConfigDir();
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');

function createOAuthClient(): OAuth2Client {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris?.[0] || 'http://localhost:3000'
  ) as unknown as OAuth2Client;
}

function persistToken(tokens: Record<string, unknown>): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  let existing: Record<string, unknown> = {};
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    } catch {
      existing = {};
    }
  }

  fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...existing, ...tokens }, null, 2));
  console.log(`[GoogleAuth] Token stored at ${TOKEN_PATH}`);
}

export class GoogleAuthService {
  private static _authClient: OAuth2Client | null = null;

  public static get credentialsPath(): string {
    return CREDENTIALS_PATH;
  }

  public static get tokenPath(): string {
    return TOKEN_PATH;
  }

  /** Drop in-memory client + delete token.json (used before interactive re-auth). */
  public static clearSavedAuth(): void {
    this._authClient = null;
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      console.log(`[GoogleAuth] Removed invalid token at ${TOKEN_PATH}`);
    }
  }

  private static attachTokenPersistence(client: OAuth2Client): void {
    client.on('tokens', (tokens) => {
      if (!tokens) return;
      persistToken(tokens as Record<string, unknown>);
    });
  }

  private static async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      if (!fs.existsSync(TOKEN_PATH)) return null;

      const credentials = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      if (!credentials.refresh_token && !credentials.access_token) {
        return null;
      }

      const client = createOAuthClient();
      client.setCredentials(credentials);
      this.attachTokenPersistence(client);
      return client;
    } catch (_err) {
      return null;
    }
  }

  private static async getNewToken(client: OAuth2Client): Promise<OAuth2Client> {
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
    });

    console.log('\nAuthorize this app for Google Calendar:');
    console.log(authUrl);
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('Paste the authorization code here: ', (code) => {
        rl.close();
        client.getToken(code.trim(), (err, token) => {
          if (err || !token) {
            console.error('[GoogleAuth] Error retrieving access token', err);
            return reject(err ?? new Error('No token returned from Google'));
          }
          client.setCredentials(token);
          persistToken(token as unknown as Record<string, unknown>);
          this.attachTokenPersistence(client);
          resolve(client);
        });
      });
    });
  }

  /**
   * Interactive OAuth (CLI). Deletes any existing token first.
   */
  public static async reauthorizeInteractively(): Promise<OAuth2Client> {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(
        `Google Calendar credentials.json not found at ${CREDENTIALS_PATH}. Download OAuth client credentials from Google Cloud Console.`
      );
    }

    this.clearSavedAuth();
    const oAuth2Client = createOAuthClient();
    this._authClient = await this.getNewToken(oAuth2Client);
    return this._authClient;
  }

  /**
   * Initializes and returns the authenticated Google OAuth2 client.
   */
  public static async authorize(): Promise<OAuth2Client> {
    if (this._authClient) return this._authClient;

    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(
        `Google Calendar credentials.json not found at ${CREDENTIALS_PATH}. Please download it from Google Cloud Console.`
      );
    }

    const client = await this.loadSavedCredentialsIfExist();
    if (client) {
      this._authClient = client;
      return client;
    }

    // Server runtime must not block on readline — require prior CLI auth.
    throw new Error(
      `Google Calendar is not connected. Run "npm run google:auth" in the server folder (used for AI reminders).`
    );
  }

  /** After Calendar API returns invalid_grant, clear cache so the next auth path is honest. */
  public static handleAuthFailure(error: unknown): void {
    const msg = error instanceof Error ? error.message : String(error);
    if (/invalid_grant|invalid_token|unauthorized/i.test(msg)) {
      this.clearSavedAuth();
    }
  }
}
