# Khela Dekho — Frontend/Backend Integration Session Memory

Date: July 17, 2026
Project: Khela Dekho Sports Blog (Next.js frontend + FastAPI backend)

## What We Accomplished

Connected the `sports-blog-home` feature to the real backend API, restructured
data-fetching into a proper `actions/` layer, and built out the authentication
feature (login + registration) end to end.

## 1. Fixed `sports-blog-home` to Match the Real Backend

The feature already fetched from `/api/posts`, but the `Post` TypeScript type
was a stub (`id: number`, four fields) left over from early mock-data work. It
didn't match the backend's actual `PostResponse` (uuid `id`, `category`,
`tags[]`, `reaction_counts`, `image_url`/`video_url`, etc.) — checked
byte-for-byte against the live `/openapi.json`.

- `types/index.ts` — rewrote `Post` to match `PostResponse` exactly, added
  `Category`, `Tag`, `ReactionCounts`.
- `utils/postDisplay.ts` (new) — shared `formatDate`, `getReadTime`,
  `getTagColor`, `getPostGradient`. Replaced the old `(id - 1) % n` visual
  helpers (broke once `id` became a uuid string) with a deterministic string
  hash.
- `PostCard.tsx`, `DetailModal.tsx`, `root.tsx` — dropped fake placeholder UI
  (rotating `Tactical`/`Analysis`/… tags, numeric `#001` ID badges, hardcoded
  "24 likes / 8 comments") in favor of real `post.category`, `post.tags`,
  `post.reaction_counts.like`. Removed the comments button entirely — no
  comments feature exists on the backend. Share button now actually copies a
  link to the clipboard.
- `store.ts` — `selectedPostId` is now `string | null` (was `number | null`).

## 2. Restructured Data Fetching into `actions/`

Moved off ad-hoc `fetch()` calls inside components and into a proper
Next.js server actions layer, per the target feature structure:
`actions/`, `components/`, `types/`, `utils/`, `index.ts`, `page.tsx`, `root.tsx`.

`frontend/src/app/features/sports-blog-home/actions/`:
- `list_all_post.ts` → `listAllPosts({ q?, tag? })` — GET `/api/posts`
- `get_single_post.ts` → `getSinglePost(id)` — GET `/api/posts/{id}`
- `create_post.ts` → `createPost(input)` — POST `/api/posts`
- `update_posts.ts` → `updatePost(id, input)` — PUT `/api/posts/{id}`
- `delete_posts.ts` → `deletePost(id)` — DELETE `/api/posts/{id}`
- `react_on_post.ts` → `reactToPost(id, type)` / `removeReaction(id)` —
  POST/DELETE `/api/posts/{id}/react`

All are `'use server'` functions. Mutations call `revalidatePath('/')` so the
post list refreshes after a write.

`root.tsx` fetches posts via TanStack Query's `useQuery`, calling
`listAllPosts()` as the `queryFn` — **not** a raw `fetch()` and **not**
`useEffect`. The only `useEffect` left in the feature is `DetailModal.tsx`'s
Escape-key listener, which is a legitimate use (binding a global DOM event),
not data fetching.

### Shared API client promoted to `configs/`

The fetch wrapper (`apiFetch`) started out living inside
`sports-blog-home/actions/http.ts`, but it's generic infrastructure — auth
cookie attachment, backend error-message parsing — needed by every feature,
not just posts. Moved it to `frontend/src/app/configs/apiClient.ts` alongside
the existing `queryClient.ts`. All six post actions import `apiFetch` from
there now.

`configs/apiClient.ts` also owns:
- `AUTH_COOKIE_NAME` / `REFRESH_COOKIE_NAME` — the cookie names every action
  reads/writes, centralized in one place.
- `setAuthCookies(tokens)` — sets both tokens as `httpOnly`, `sameSite: lax`
  cookies (secure in production). Cookie lifetimes match the backend's
  defaults (`ACCESS_TOKEN_EXPIRE_MINUTES=30`, `REFRESH_TOKEN_EXPIRE_DAYS=7`).
- `clearAuthCookies()` — for the future logout action.

## 3. Built the `auth` Feature (Login + Registration)

`frontend/src/app/features/auth/`:
- `types/index.ts` — `AuthUser`, matching the backend's `UserResponse`.
- `actions/login_user.ts` → `loginUser({ username, password })`. The
  backend's `/api/auth/login` is an `OAuth2PasswordRequestForm` endpoint, so
  it takes `application/x-www-form-urlencoded`, not JSON — this action does
  a raw `fetch` instead of going through `apiFetch` (which defaults to JSON).
  On success, calls `setAuthCookies()` with the returned token pair.
- `actions/register_user.ts` → `registerUser({ username, email, password })`.
  Calls `POST /api/users` (via `apiFetch`), then immediately calls
  `loginUser()` with the same credentials — registration alone doesn't
  return tokens, so this auto-logs the user in instead of leaving them at a
  dead end.
- `components/LoginForm.tsx`, `components/RegisterForm.tsx` — client
  components using `useMutation` (TanStack Query) to call the actions above,
  `useState` for controlled inputs, redirect + `router.refresh()` on success
  so the new auth cookie is picked up.
- `login/root.tsx` + `login/page.tsx`, `register/root.tsx` +
  `register/page.tsx` — one feature, two page routes (mirrors the
  `page.tsx`/`root.tsx` pattern per page since this feature has two entry
  points instead of one).
- `index.ts` — barrel export.

Wired into the app router: `app/login/page.tsx` and `app/register/page.tsx`
each import the corresponding feature page.

### Verified end-to-end against the live backend

- `POST /api/users` with `{username, email, password}` → `201`, response
  shape matches `AuthUser` exactly.
- `POST /api/auth/login` (form-urlencoded) → `200`, returns
  `{access_token, refresh_token, token_type}` matching what `setAuthCookies`
  expects.
- `GET /api/users/me` with the returned access token as a `Bearer` header →
  `200`, confirms the token actually authenticates.
- `/login` and `/register` pages render `200` with no console/build errors.

A throwaway account (`claude_verify_test`) was created against the dev
database during this check — there's no `DELETE /api/users/{id}` endpoint on
the backend yet, so it can't be cleaned up via the API. Safe to ignore or
remove directly in Postgres if it's noise.

## What's Not Done Yet

- No logout action (cookie names + `clearAuthCookies()` exist, action isn't
  wired to any UI yet).
- No refresh-token flow (backend has `POST /api/auth/refresh`; nothing on
  the frontend calls it when the access token expires — currently a 30
  minute session before the user has to log in again).
- No "logged in as" state in the header, no route protection/redirects for
  pages that need auth.
- Post reactions (like/love/laugh) aren't wired to any clickable UI — the
  actions exist (`react_on_post.ts`) but nothing calls them yet.
- No forgot/reset-password UI (backend supports it — `/api/auth/forget-password`,
  `/api/auth/reset-password`).

I would like to add another feature of command action . What is command action? 
Lets say an user wants to attach image, gif or video link . So therefore when user types 
/ it will trigger and open up the shadcn modal where 3 choices will exist 
1. Attach an image (add url)
2. Attach a video  (add url)
3. Attach a reference  (Post source reference)

If user attach an image , then show the image. If user attach a video then let the other readers play the video