"""Generate a Postman collection + environment from the FastAPI OpenAPI schema.

Usage (from backend/):
    uv run python scripts/generate_postman.py

Writes:
    postman/khela-dekho.postman_collection.json
    postman/khela-dekho.postman_environment.json

Re-run after adding or changing an endpoint so the collection stays in sync.
"""

from __future__ import annotations

import json
import sys
import uuid
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

OUTPUT_DIR = BACKEND_DIR / "postman"
COLLECTION_NAME = "Khela Dekho API"
PROD_BASE_URL = "https://api.kheladekho.dev"
LOCAL_BASE_URL = "http://localhost:8000"

# Deterministic ids so regenerating doesn't churn the diff or orphan the
# collection in Postman's sidebar.
NAMESPACE = uuid.UUID("6f1d5c4a-9b3e-4c7a-8d2f-1e5a7b9c3d40")

# Path/body params that are worth pinning once in the environment instead of
# retyping per request.
SHARED_VARIABLES = {
    "post_id",
    "user_id",
    "category_id",
    "tag_id",
    "author",
    "league_code",
}

LOREM = (
    "This is sample body text for the Khela Dekho API collection. Replace it with "
    "real content before sending the request against production data. "
)


def deterministic_id(*parts: str) -> str:
    return str(uuid.uuid5(NAMESPACE, "::".join(parts)))


def resolve_ref(ref: str, spec: dict[str, Any]) -> dict[str, Any]:
    node: Any = spec
    for part in ref.lstrip("#/").split("/"):
        node = node[part]
    return node


def is_binary(schema: dict[str, Any]) -> bool:
    """OpenAPI 3.1 (FastAPI's default) marks uploads with contentMediaType,
    not the 3.0-era `format: binary`. Accept both."""
    return schema.get("format") == "binary" or "contentMediaType" in schema


def unwrap_nullable(schema: dict[str, Any]) -> dict[str, Any]:
    """Pydantic emits Optional[X] as anyOf[X, null]; pick the real branch."""
    options = schema.get("anyOf") or schema.get("oneOf")
    if not options:
        return schema
    for option in options:
        if option.get("type") != "null":
            return option
    return options[0]


def example_for(
    schema: dict[str, Any],
    spec: dict[str, Any],
    field_name: str = "",
    depth: int = 0,
) -> Any:
    if depth > 6:
        return None

    if "$ref" in schema:
        schema = resolve_ref(schema["$ref"], spec)
    schema = unwrap_nullable(schema)

    if "example" in schema:
        return schema["example"]
    if "default" in schema and schema["default"] not in ([], {}):
        return schema["default"]
    if "enum" in schema and schema["enum"]:
        return schema["enum"][0]

    schema_type = schema.get("type")

    if schema_type == "object" or "properties" in schema:
        properties = schema.get("properties", {})
        return {
            name: example_for(prop, spec, name, depth + 1)
            for name, prop in properties.items()
        }

    if schema_type == "array":
        item_schema = schema.get("items", {})
        sample = example_for(item_schema, spec, field_name, depth + 1)
        return [sample] if sample is not None else []

    if schema_type == "integer":
        return schema.get("minimum", 1)
    if schema_type == "number":
        return float(schema.get("minimum", 1))
    if schema_type == "boolean":
        return True

    # strings
    if field_name in SHARED_VARIABLES:
        return f"{{{{{field_name}}}}}"
    if schema.get("format") == "uuid":
        return "00000000-0000-0000-0000-000000000000"
    if schema.get("format") in {"date-time", "date"}:
        return "2026-01-01T00:00:00Z"
    if schema.get("format") == "email" or field_name == "email":
        return "tester@example.com"
    if is_binary(schema):
        return ""
    if "password" in field_name:
        return "securepassword123"
    if field_name in {"url", "image_url", "video_url", "reference_url"}:
        return "https://example.com/media.jpg"

    value = schema.get("description") or schema.get("title") or field_name or "string"
    value = str(value)
    min_length = schema.get("minLength", 0)
    while len(value) < min_length:
        value = f"{value} {LOREM}".strip()
    max_length = schema.get("maxLength")
    if max_length:
        value = value[:max_length]
    return value


def build_url(path: str, parameters: list[dict[str, Any]], spec: dict[str, Any]) -> dict[str, Any]:
    # /api/posts/{post_id} -> /api/posts/{{post_id}}
    postman_path = path
    for param in parameters:
        if param.get("in") == "path":
            name = param["name"]
            postman_path = postman_path.replace(f"{{{name}}}", f"{{{{{name}}}}}")

    segments = [segment for segment in postman_path.split("/") if segment]

    query: list[dict[str, Any]] = []
    for param in parameters:
        if param.get("in") != "query":
            continue
        schema = param.get("schema", {})
        value = example_for(schema, spec, param["name"])
        query.append(
            {
                "key": param["name"],
                "value": "" if value is None else str(value),
                # Optional params start disabled so the request runs clean as-is.
                "disabled": not param.get("required", False),
                "description": param.get("description", ""),
            }
        )

    raw = "{{baseUrl}}" + postman_path
    enabled = [q for q in query if not q["disabled"]]
    if enabled:
        raw += "?" + "&".join(f"{q['key']}={q['value']}" for q in enabled)

    url: dict[str, Any] = {"raw": raw, "host": ["{{baseUrl}}"], "path": segments}
    if query:
        url["query"] = query
    return url


def build_body(operation: dict[str, Any], spec: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    request_body = operation.get("requestBody")
    if not request_body:
        return None, None

    content = request_body.get("content", {})

    if "application/json" in content:
        schema = content["application/json"].get("schema", {})
        example = example_for(schema, spec)
        body = {
            "mode": "raw",
            "raw": json.dumps(example, indent=2),
            "options": {"raw": {"language": "json"}},
        }
        return body, "application/json"

    if "multipart/form-data" in content:
        schema = content["multipart/form-data"].get("schema", {})
        if "$ref" in schema:
            schema = resolve_ref(schema["$ref"], spec)
        formdata = []
        for name, prop in schema.get("properties", {}).items():
            prop = unwrap_nullable(prop)
            if is_binary(prop):
                formdata.append({"key": name, "type": "file", "src": []})
            else:
                formdata.append(
                    {"key": name, "type": "text", "value": str(example_for(prop, spec, name))}
                )
        # Content-Type is set by Postman (it needs to add the boundary).
        return {"mode": "formdata", "formdata": formdata}, None

    if "application/x-www-form-urlencoded" in content:
        schema = content["application/x-www-form-urlencoded"].get("schema", {})
        if "$ref" in schema:
            schema = resolve_ref(schema["$ref"], spec)
        urlencoded = [
            {"key": name, "value": str(example_for(unwrap_nullable(prop), spec, name))}
            for name, prop in schema.get("properties", {}).items()
        ]
        return {"mode": "urlencoded", "urlencoded": urlencoded}, "application/x-www-form-urlencoded"

    return None, None


# Auto-capture tokens so the rest of the collection is authenticated after one login.
TOKEN_CAPTURE_SCRIPT = [
    "const ok = pm.response.code >= 200 && pm.response.code < 300;",
    "pm.test('auth request succeeded', () => pm.expect(ok).to.be.true);",
    "if (ok) {",
    "  const data = pm.response.json();",
    "  if (data.access_token) {",
    "    pm.environment.set('access_token', data.access_token);",
    "    console.log('access_token saved to environment');",
    "  }",
    "  if (data.refresh_token) {",
    "    pm.environment.set('refresh_token', data.refresh_token);",
    "  }",
    "}",
]

ID_CAPTURE_SCRIPT = [
    "const ok = pm.response.code >= 200 && pm.response.code < 300;",
    "if (ok) {",
    "  const data = pm.response.json();",
    "  const row = Array.isArray(data) ? data[0] : data;",
    "  if (row && row.id) {",
    "    pm.environment.set('{var}', row.id);",
    "    console.log('{var} set to ' + row.id);",
    "  }",
    "}",
]


def script_event(lines: list[str]) -> dict[str, Any]:
    return {"listen": "test", "script": {"type": "text/javascript", "exec": lines}}


def events_for(path: str, method: str) -> list[dict[str, Any]]:
    if path in {"/api/auth/login", "/api/auth/register", "/api/auth/refresh"} and method == "post":
        return [script_event(TOKEN_CAPTURE_SCRIPT)]
    if path == "/api/posts" and method == "get":
        return [script_event([line.replace("{var}", "post_id") for line in ID_CAPTURE_SCRIPT])]
    if path == "/api/categories" and method == "get":
        return [script_event([line.replace("{var}", "category_id") for line in ID_CAPTURE_SCRIPT])]
    return []


def request_name(operation: dict[str, Any], method: str, path: str) -> str:
    summary = operation.get("summary")
    if summary:
        return summary
    return f"{method.upper()} {path}"


def build_item(path: str, method: str, operation: dict[str, Any], spec: dict[str, Any]) -> dict[str, Any]:
    parameters = operation.get("parameters", [])
    body, content_type = build_body(operation, spec)

    headers = []
    if content_type:
        headers.append({"key": "Content-Type", "value": content_type})

    request: dict[str, Any] = {
        "method": method.upper(),
        "header": headers,
        "url": build_url(path, parameters, spec),
    }

    description = operation.get("description", "").strip()
    if description:
        request["description"] = description

    if body:
        request["body"] = body

    # Endpoints without a security requirement must not send a stale token.
    if not operation.get("security"):
        request["auth"] = {"type": "noauth"}

    item: dict[str, Any] = {
        "name": request_name(operation, method, path),
        "id": deterministic_id(method, path),
        "request": request,
        "response": [],
    }

    events = events_for(path, method)
    if events:
        item["event"] = events

    return item


def build_collection(spec: dict[str, Any]) -> dict[str, Any]:
    folders: dict[str, list[dict[str, Any]]] = {}
    folder_order: list[str] = []

    for path, operations in spec.get("paths", {}).items():
        for method, operation in operations.items():
            if method not in {"get", "post", "put", "patch", "delete", "head", "options"}:
                continue
            tag = (operation.get("tags") or ["Other"])[0]
            if tag not in folders:
                folders[tag] = []
                folder_order.append(tag)
            folders[tag].append(build_item(path, method, operation, spec))

    # Auth first — you need a token before anything else is useful.
    folder_order.sort(key=lambda name: (name != "Auth", name))

    return {
        "info": {
            "_postman_id": deterministic_id("collection", COLLECTION_NAME),
            "name": COLLECTION_NAME,
            "description": (
                "Auto-generated from the FastAPI OpenAPI schema by "
                "`backend/scripts/generate_postman.py`. Do not hand-edit — re-run the "
                "script after changing an endpoint.\n\n"
                "**Getting started**\n\n"
                "1. Import this collection *and* `khela-dekho.postman_environment.json`.\n"
                "2. Select the `Khela Dekho` environment (top-right).\n"
                "3. Run **Auth > login** — the token is saved to `{{access_token}}` "
                "automatically and every authenticated request picks it up.\n"
                "4. Run **Posts > GET /api/posts** once to populate `{{post_id}}`, and "
                "**Categories > GET /api/categories** to populate `{{category_id}}`.\n\n"
                "Switch between prod and local by editing `baseUrl` in the environment."
            ),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "auth": {
            "type": "bearer",
            "bearer": [{"key": "token", "value": "{{access_token}}", "type": "string"}],
        },
        "item": [
            {
                "name": tag,
                "id": deterministic_id("folder", tag),
                "item": folders[tag],
            }
            for tag in folder_order
        ],
        "variable": [
            {"key": "baseUrl", "value": PROD_BASE_URL, "type": "string"},
        ],
    }


def build_environment() -> dict[str, Any]:
    values = [
        {"key": "baseUrl", "value": PROD_BASE_URL, "type": "default", "enabled": True},
        {"key": "localBaseUrl", "value": LOCAL_BASE_URL, "type": "default", "enabled": True},
        {"key": "access_token", "value": "", "type": "secret", "enabled": True},
        {"key": "refresh_token", "value": "", "type": "secret", "enabled": True},
        {"key": "post_id", "value": "", "type": "default", "enabled": True},
        {"key": "user_id", "value": "", "type": "default", "enabled": True},
        {"key": "category_id", "value": "", "type": "default", "enabled": True},
        {"key": "tag_id", "value": "", "type": "default", "enabled": True},
        {"key": "author", "value": "", "type": "default", "enabled": True},
        {"key": "league_code", "value": "PL", "type": "default", "enabled": True},
    ]
    return {
        "id": deterministic_id("environment", COLLECTION_NAME),
        "name": "Khela Dekho",
        "values": values,
        "_postman_variable_scope": "environment",
    }


def main() -> None:
    from app.main import app

    spec = app.openapi()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    collection_path = OUTPUT_DIR / "khela-dekho.postman_collection.json"
    environment_path = OUTPUT_DIR / "khela-dekho.postman_environment.json"

    collection = build_collection(spec)
    collection_path.write_text(json.dumps(collection, indent=2) + "\n", encoding="utf-8")
    environment_path.write_text(json.dumps(build_environment(), indent=2) + "\n", encoding="utf-8")

    request_count = sum(len(folder["item"]) for folder in collection["item"])
    print(f"Wrote {collection_path.relative_to(BACKEND_DIR)} ({request_count} requests)")
    print(f"Wrote {environment_path.relative_to(BACKEND_DIR)}")


if __name__ == "__main__":
    main()
