# Amplify FE + EC2 API setup checklist

Frontend: AWS Amplify Hosting  
Backend: EC2 Docker (`server` + `api-proxy` only)  
API host: `https://api.devcollab.space`  
App host (until custom domain is Available): `https://main.d26xua693trmrm.amplifyapp.com`

## 1. EC2 `server/.env`

```bash
CLIENT_URL=https://main.d26xua693trmrm.amplifyapp.com
COOKIE_SECURE=true
# cookie SameSite=None is automatic when COOKIE_SECURE/https CLIENT_URL
```

Restart after edit: `docker compose up --build -d`

## 2. DNS

| Record | Type | Value |
|--------|------|--------|
| `api.devcollab.space` | A | EC2 Elastic IP |
| `devcollab.space` / `www` | Amplify custom domain | Amplify DNS instructions |

## 3. TLS for API (on EC2)

Include `api` in the cert used by `deploy/api-nginx.conf` (paths under `/etc/letsencrypt/live/devcollab.space/`):

```bash
sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d api.devcollab.space
```

Cert files must be `/etc/letsencrypt/live/api.devcollab.space/` (see `deploy/api-nginx.conf`). Do not include apex/www — those names are not on this server.

Security group: allow 80/443 to EC2.

## 4. Amplify Hosting

1. AWS Console → Amplify → Host web app → GitHub → this repo  
2. App root: `client`  
3. Build uses `client/amplify.yml`  
4. Environment variables:

```text
VITE_API_URL=https://api.devcollab.space/api
VITE_GOOGLE_CLIENT_ID=<same as server GOOGLE_CLIENT_ID>
```

5. Hosting → Custom domains → add `devcollab.space` and `www`

## 5. Google Cloud Console

Authorized JavaScript origins:

- `https://main.d26xua693trmrm.amplifyapp.com`
- `https://devcollab.space`
- `https://www.devcollab.space`

## 6. Verify

- Open Amplify URL → login  
- Network: API calls go to `https://api.devcollab.space/api/...`  
- Refresh cookie set with `Secure; SameSite=None`  
- Socket.IO connects to `https://api.devcollab.space`
