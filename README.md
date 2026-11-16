# Shopanow frontend

The Next.js storefront connects to the separate Shopanow Express/PostgreSQL backend. API routes, database access, authentication, and authorization belong to the backend project.

## Configure and run

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend origin (for example `http://localhost:5000`). This is a public service URL, not a secret.

Run the backend first from the `shopanow-backend` project, then start this frontend:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. Configure the backend's `FRONTEND_URL` to allow this frontend origin through CORS.

Customers register and log in at `/auth/register` and `/auth/login`. Administrators sign in through the same login and are directed to `/dean/dashboard`. Admin API authorization is enforced by the backend, not by frontend route checks.

For backend database, Paystack, and administrator-seeding setup, see the README in the separate `shopanow-backend` project.
