# HW Dev

Production URL: https://hw-dev.vercel.app
Fallback URL: https://devanshusgit.github.io/hw-dev/
Repo: https://github.com/devanshusgit/hw-dev

## Stack
- Static HTML/CSS/JS
- Supabase for blog data and admin auth
- Vercel for primary production hosting

## Admin Login
Use the email/password created in Supabase Auth.

## Blog Backend
The site reads posts from the `public.posts` table in Supabase.

## Notes
- Vercel is the primary production target.
- GitHub Pages can remain as a backup/static mirror.
- Do not expose any Supabase service role key in frontend code.
