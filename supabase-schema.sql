-- HW Dev blog/admin schema for Supabase
create table if not exists public.posts (
  id text primary key,
  title text not null,
  category text not null,
  author text not null,
  date date not null,
  excerpt text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.posts enable row level security;

-- Public read access for blog pages
create policy if not exists "Public can read posts"
on public.posts
for select
using (true);

-- Authenticated users can manage posts
create policy if not exists "Authenticated users can insert posts"
on public.posts
for insert
with check (auth.role() = 'authenticated');

create policy if not exists "Authenticated users can update posts"
on public.posts
for update
using (auth.role() = 'authenticated');

create policy if not exists "Authenticated users can delete posts"
on public.posts
for delete
using (auth.role() = 'authenticated');

insert into public.posts (id, title, category, author, date, excerpt, content)
values
('1', 'How to Choose the Right Study Destination in 2026', 'Destinations', 'HW Dev Team', '2026-03-10', 'A simple framework for comparing countries by cost, career opportunities, visa pathways, and academic fit.', 'Choosing the right destination means balancing career outcomes, course quality, affordability, work opportunities, and long-term fit. Start with your goals, then compare realistic destinations instead of following trends blindly.'),
('2', 'SOP Tips That Make Your Application Stronger', 'Applications', 'HW Dev Team', '2026-03-08', 'A better SOP is less about sounding fancy and more about clarity, intent, and evidence.', 'A strong SOP should explain your background, why this course matters, why this university fits, and what outcome you want after graduation. Avoid clichés and stay specific.'),
('3', 'Visa Preparation Checklist for Study Abroad Students', 'Visa', 'HW Dev Team', '2026-03-05', 'Documents, financials, timelines, and interview readiness — the essentials in one place.', 'Visa prep is easier when broken down into timelines, proof of funds, academic records, offer letters, and interview preparation. Keep your documentation organized early.')
on conflict (id) do nothing;