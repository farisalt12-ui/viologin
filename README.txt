FULL VERCEL VERSION

This project is meant to be deployed as a full Vercel site.

What it does:
- Serves the VioletBot site from /site
- Uses a Vercel serverless function at /api/login
- The function forwards login to https://violetbot.net:6963/check/
- It sends:
  u = username
  p = md5(password uppercase)

How to deploy:
1. Upload this whole folder to a GitHub repo.
2. Import that repo into Vercel.
3. Deploy.
4. Your site will work from the Vercel domain directly.

Quick checks after deploy:
- Open /api/login in browser -> should show {"ok":false,"error":"method_not_allowed"}
- Open the main Vercel URL -> site should load

Notes:
- auth-config.js already points to /api/login
- no Netlify needed
- no PHP needed
