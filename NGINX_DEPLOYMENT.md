# Deploying tools.tanvirsoft.com on Nginx

This guide assumes you already have another site running on the same Nginx server. The steps below focus only on deploying this Next.js app (`tools.tanvirsoft.com`) alongside your existing configuration.

## 1. Prerequisites
- Ubuntu 22.04+ or another Linux distro with `nginx` and `systemd`.
- Node.js 20 LTS (Next.js 16 requires Node 18.18+, but 20 LTS is recommended).
- Build toolchain: `build-essential`, `git`, `curl`.
- A DNS `A` record pointing `tools.tanvirsoft.com` to your server IP.

## 2. Clone and Install
```bash
# SSH into your box
ssh user@your-server

# Clone into /var/www (or any app directory)
cd /var/www
sudo git clone https://github.com/<your-org>/my-app.git tools.tanvirsoft
cd tools.tanvirsoft

# Copy production env values
cp .env.example .env
nano .env          # set OPENAI_API_KEY, etc.

# Install dependencies with pnpm or npm
yarn install       # or: npm install / pnpm install
```

## 3. Build and Start with PM2 (recommended)
```bash
# Build optimized bundle
npm run build

# Install pm2 globally if not already
yarn global add pm2   # or: npm i -g pm2

# Start in production mode on an open port (example: 3100 since 3000 is already taken)
pm2 start "npm run start -- -p 3100" --name tools-tanvirsoft

# Persist across restarts
pm2 save
pm2 startup systemd
```
PM2 keeps the Node process alive, restarts on crashes, and exposes logs via `pm2 logs tools-tanvirsoft`.

## 4. Configure Nginx Reverse Proxy
Create a new site file (keep your other site untouched):
```bash
sudo nano /etc/nginx/sites-available/tools.tanvirsoft.com
```
Paste:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tools.tanvirsoft.com;

    # Optional: redirect HTTP -> HTTPS once TLS is enabled
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20m; # matches Next.js serverActions limit
}
```
Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/tools.tanvirsoft.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. HTTPS with Certbot (optional but recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tools.tanvirsoft.com
```
Certbot will rewrite the server block to use TLS automatically.

## 6. Deploy Updates
```bash
cd /var/www/tools.tanvirsoft
sudo git pull
npm install --production
npm run build
pm2 restart tools-tanvirsoft
```

## 7. Logs & Monitoring
- App logs: `pm2 logs tools-tanvirsoft`
- Nginx access/error logs: `/var/log/nginx/tools.tanvirsoft.com.access.log` and `.error.log` (configure `access_log` and `error_log` if desired).

## 8. Troubleshooting
- 502/504 errors usually mean the Node process is down. Check `pm2 status`.
- If uploads above 20 MB fail, increase both `client_max_body_size` (Nginx) and `experimental.serverActions.bodySizeLimit` (Next config).
- When running multiple sites, ensure each Nginx server block has a unique `server_name` and that only one listens on port 80/443 for that host.

With this setup, `tools.tanvirsoft.com` proxies through Nginx to the Next.js server running on localhost:3100 while leaving your other hosted site untouched.
