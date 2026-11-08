# Pawly Architecture

## Overview

Pawly is a Vite-built multi-page frontend using vanilla JavaScript ES modules.
Each HTML file is a Vite entry point. `src/main.js` creates the shared
navigation and page shell, then selects the page renderer from
`body[data-page]`.

## Frontend navigation

The configured entry points are:

`index`, `login`, `register`, `dashboard`, `pets`, `pet-details`,
`health-record`, `profile`, `admin`, `article`, `moments`, and `demo`.

The shared navigation is rendered in `src/main.js` after the Supabase session
is checked:

- Logged-out visitors see public links and **Демо**.
- Authenticated users see the private workspace links and **Pawly Moments**.
- **Администрация** is shown only when the current user has the `admin` role.
- The public homepage keeps the Pawly Moments promotional card. Guests
  receive a registration/login modal instead of direct editor access.

## Page modules

Page-specific UI is implemented in `src/js/pages/`:

- `auth.js` — registration and login forms.
- `dashboard.js` — authenticated overview.
- `pets.js` and `pet-details.js` — pet CRUD and digital passport.
- `health-records.js` — health-record CRUD.
- `profile.js` — profile metadata and logout.
- `admin.js` — protected article administration.
- `article.js` and `home.js` — public article views.
- `moments.js` — protected client-side collage editor and PNG export.
- `demo.js` — public read-only demo.

Pawly-specific CSS is kept in `src/style.css`; Bootstrap supplies the layout
utilities and components.

## Authentication and sessions

`src/js/services/supabase.js` creates one Supabase client from the Vite
environment variables. `src/js/services/auth.js` provides:

- `requireUser()` — verifies an active session and authenticated user,
  otherwise redirects to login.
- `signOut()` — signs out through Supabase Auth.
- `updateUserProfile()` — updates first and last name metadata.

Registration calls `auth.signUp()`. If Supabase returns a usable session, the
client verifies it and redirects to `/dashboard.html`. If email confirmation
is required and no session is returned, the registration page asks the user
to confirm the email and provides a login link. Login uses
`signInWithPassword()`.

## Data access and authorization

Domain services in `src/js/services/` isolate Supabase queries:

- `pets.js`
- `health-records.js`
- `articles.js`
- `authorization.js`

Private page modules call `requireUser()` before loading personal data.
`admin.js` calls `requireAdmin()`, which checks both the session and
`public.user_roles`. The client does not assign roles; Supabase RLS and the
`public.is_admin()` function enforce authorization at the database layer.

## Database structure

The current application database contains:

- `public.user_roles` — role assignment for authenticated user IDs.
- `public.pets` — pet profiles owned by authenticated users.
- `public.health_records` — health and care records linked to users and pets.
- `public.articles` — published and administrative article content.

All foreign keys and migration-derived fields are documented in
[DATABASE.md](./DATABASE.md).

## Supabase Storage

`pet-photos` is a private bucket. Uploads use a path containing the
authenticated user ID and pet ID. Storage policies verify both the
authenticated user and the related pet.

Article covers use the separate `article-covers` bucket. The bucket is
created manually according to
[ARTICLE_STORAGE_SETUP.md](../supabase/ARTICLE_STORAGE_SETUP.md).
Administrators upload covers; published cover objects are returned through
signed URLs subject to Storage policies.

## Security boundaries

- Authentication is handled by Supabase Auth.
- Database access is restricted by RLS policies in the migrations.
- User records are scoped by `auth.uid()`.
- Admin actions require `public.is_admin()`.
- The public demo uses a separate local dataset and does not write to
  Supabase.
- Dynamic pet values are escaped before insertion into rendered HTML.
