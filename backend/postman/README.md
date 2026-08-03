# Postman — Khela Dekho API

Auto-generated from the FastAPI OpenAPI schema. **Don't hand-edit the JSON** — edits are lost on the next regeneration.

| File | What it is |
|---|---|
| `khela-dekho.postman_collection.json` | 37 requests, foldered by tag (Auth, Posts, Users, Categories, Tags, Live Scores, Cricket, Baseball, Webhooks) |
| `khela-dekho.postman_environment.json` | `baseUrl`, tokens, and reusable path variables |

## Setup (once)

1. Postman → **Import** → drop in **both** files.
2. Top-right environment selector → pick **Khela Dekho**.
3. Run **Auth → Login with email and password**.
   The response's `access_token` is saved to the environment by a test script, and every authenticated request inherits it from collection-level bearer auth. No copy-pasting tokens.
4. Run **Posts → Get Posts** once — it saves the first result's id into `{{post_id}}`.
   Run **Categories → Get Categories** to populate `{{category_id}}`.

After that, requests like `Get Related Posts` or `Create Post` work with no manual edits.

## Environment variables

| Variable | Purpose |
|---|---|
| `baseUrl` | Target server. Defaults to `https://api.kheladekho.dev` |
| `localBaseUrl` | `http://localhost:8000` — paste into `baseUrl` to test locally |
| `access_token` / `refresh_token` | Filled automatically by the Auth requests |
| `post_id`, `user_id`, `category_id`, `tag_id`, `author` | Path parameters |
| `league_code` | For `GET /api/v1/livescores/standings/{league_code}`, e.g. `PL` |

## Switching to local

Edit `baseUrl` to `http://localhost:8000` (or copy the value of `localBaseUrl`). Tokens are per-environment — duplicate the environment if you want prod and local logged in at the same time.

## Regenerating after an API change

```bash
cd backend
uv run python scripts/generate_postman.py
```

Reads `app.main:app`'s own OpenAPI schema, so new endpoints show up automatically. Ids are deterministic (uuid5), so re-importing updates the existing collection instead of creating a duplicate, and the git diff stays small.

## Notes

- Optional query params are included but **disabled** by default, so each request sends cleanly as-is. Tick them in the Params tab to use them.
- Endpoints with no security requirement are set to `noauth`, so a stale token never leaks into a public call.
- Request bodies are examples generated from the schema (respecting `minLength`/`maxLength`), not real content — replace before posting to production.
- `Upload Avatar` and the upload-url endpoints use `formdata`; pick a real file in Postman's body tab.
