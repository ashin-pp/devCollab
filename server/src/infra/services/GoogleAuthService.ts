import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import { logger } from '../../container';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const CONFIG_DIR = path.resolve(process.cwd(), 'src/infra/config');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');

export class GoogleAuthService {
  private static authClient: OAuth2Client | null = null;

  /**
   * Reads previously authorized credentials from the save file.
   */
  private static async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
      const credentials = JSON.parse(content);
      const parsedCreds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      const { client_secret, client_id, redirect_uris } = parsedCreds.installed || parsedCreds.web;
      const client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || 'http://localhost:3000');
      client.setCredentials(credentials);
      return client as any;
    } catch (err) {
      return null;
    }
  }

  /**
   * Prompts the user to authorize the app by visiting a URL.
   */
  private static async getNewToken(client: OAuth2Client): Promise<OAuth2Client> {
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    logger.info('\n\n======================================================');
    logger.info('🚨 ACTION REQUIRED FOR GOOGLE CALENDAR 🚨');
    logger.info('Authorize this app by visiting this url:');
    logger.info(authUrl);
    logger.info('======================================================\n\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        client.getToken(code, (err, token) => {
          if (err || !token) {
            logger.error('Error retrieving access token', { error: err });
            return reject(err);
          }
          client.setCredentials(token);
          
          if (!fs.existsSync(CONFIG_DIR)) {
              fs.mkdirSync(CONFIG_DIR, { recursive: true });
          }
          
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
          logger.info(`Token stored to ${TOKEN_PATH}`);
          resolve(client);
        });
      });
    });
  }

  /**
   * Initializes and returns the authenticated Google OAuth2 client.
   */
  public static async authorize(): Promise<OAuth2Client> {
    if (this.authClient) return this.authClient;

    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(`Google Calendar credentials.json not found at ${CREDENTIALS_PATH}. Please download it from Google Cloud Console.`);
    }

    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      this.authClient = client;
      return client;
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || 'http://localhost:3000');
    
    this.authClient = await this.getNewToken(oAuth2Client as any);
    return this.authClient;
  }
}
