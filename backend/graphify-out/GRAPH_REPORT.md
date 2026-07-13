# Graph Report - backend  (2026-07-14)

## Corpus Check
- 37 files · ~16,912 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 367 nodes · 593 edges · 27 communities
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d01e9806`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `UserRole` - 19 edges
2. `FastAPI Async Patterns` - 15 edges
3. `PostCreate` - 14 edges
4. `PostUpdate` - 14 edges
5. `PostResponse` - 14 edges
6. `UploadURLRequest` - 14 edges
7. `UploadURLResponse` - 14 edges
8. `Base` - 13 edges
9. `UserCreate` - 13 edges
10. `UserResponse` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Category` --uses--> `Base`  [INFERRED]
  app/models.py → app/database.py
- `Tag` --uses--> `Base`  [INFERRED]
  app/models.py → app/database.py
- `User` --uses--> `Base`  [INFERRED]
  app/models.py → app/database.py
- `UserRole` --uses--> `Base`  [INFERRED]
  app/models.py → app/database.py
- `Request` --uses--> `Base`  [INFERRED]
  app/main.py → app/database.py

## Import Cycles
- 1-file cycle: `app/main.py -> app/main.py`
- 2-file cycle: `app/main.py -> app/routers/categories.py -> app/main.py`
- 2-file cycle: `app/main.py -> app/routers/posts.py -> app/main.py`
- 2-file cycle: `app/main.py -> app/routers/auth.py -> app/main.py`
- 2-file cycle: `app/main.py -> app/routers/users.py -> app/main.py`
- 2-file cycle: `app/main.py -> app/routers/tags.py -> app/main.py`
- 3-file cycle: `app/main.py -> app/routers/categories.py -> app/security.py -> app/main.py`
- 3-file cycle: `app/main.py -> app/routers/posts.py -> app/security.py -> app/main.py`
- 3-file cycle: `app/main.py -> app/routers/auth.py -> app/security.py -> app/main.py`
- 3-file cycle: `app/main.py -> app/routers/users.py -> app/security.py -> app/main.py`

## Communities (27 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (40): Config, Settings, Base, get_db(), lifespan(), Application lifespan manager for starting and stopping the application asynchron, validation_exception_handler(), Category (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.23
Nodes (30): AsyncSession, Depends, get_db, User, UUID, generate_presigned_upload(), UUID, PostCreate (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): 1. Async/Await Mistakes, 2. Missing `from_attributes` (orm_mode), 3. Session Management, 4. Relationship Loading, 5. Transaction Handling, Authentication: SimpleJWT → FastAPI JWT, Common Pitfalls, Concept Mapping: Django/DRF → FastAPI (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.32
Nodes (16): ADMIN, AsyncSession, Depends, get_db, require_role, User, UserRole, UUID (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (15): Async Context Managers, Async Database Operations, Background Tasks, Basic Async Route Handlers, Concurrent Request Handling, Connection Pooling, FastAPI Async Best Practices, FastAPI Async Common Pitfalls (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): Before Submitting Findings, Context-Sensitive Rules, FastAPI Code Review, FastAPI Framework Behaviors, Gate 1 — Route decorator and response surface, Gate 2 — Blocking or “should be async”, Gate 3 — Depends, validation, auth, Gates (FastAPI-specific) (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (12): Adding a New Aggregate, Application Bootstrap, Data Flow, Dependency Injection Chain, Domain Layer (Innermost), Infrastructure Layer, Layer Diagram, Layer Responsibilities (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (12): 1. Blocking I/O in Async Handlers, 2. Blocking Database Calls, 3. Using time.sleep Instead of asyncio.sleep, 4. Sync File I/O in Async Handlers, 5. Not Using Background Tasks, 6. Sequential Instead of Concurrent Calls, 7. Mixing Sync and Async Route Handlers, 8. Not Awaiting Coroutines (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (24): UserRole, ADMIN, AsyncSession, Depends, get_db, require_role, User, AsyncSession (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (11): Constraints, Core Workflow, FastAPI Expert, JWT Authentication Snippet, Knowledge Reference, Minimal Complete Example, MUST DO, MUST NOT DO (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (11): 1. Manual Validation Instead of Pydantic, 2. Missing Field Validators, 3. Generic HTTPException Messages, 4. Not Using Pydantic Config, 5. Missing Custom Validators, 6. Not Handling 422 Validation Errors, 7. Using Dict Instead of Models, 8. Missing Query Parameter Validation (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (11): Composite Value Object, Definition, Enum-Based Status, Guidelines, Implementation Patterns, Key Characteristics, Optional String Wrapper, String Wrapper with Validation (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (10): 1. Manual Dependency Calls, 2. Missing Cleanup in Yield Dependencies, 3. Shared State Without Proper Scope, 4. Nested Depends Not Utilized, 5. Dependencies with Side Effects, 6. Class-Based Dependencies Without Caching, 7. Security Dependencies Not Applied Globally, Critical Anti-Patterns (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (10): Definition, Domain Query Methods, Encapsulation with Properties, Entities in Python DDD, Factory Methods, Guidelines, Identity-Based Equality, Implementation Pattern (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (10): 1. Missing response_model, 2. No APIRouter Prefix/Tags, 3. Wrong HTTP Methods, 4. Missing Status Codes, 5. Direct Exception Raising, 6. Multiple Response Models, 7. Path Parameter Validation, Critical Anti-Patterns (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (10): Create Use Case (Simple), Definition, Dependency Injection Wiring, Domain Exceptions, Guidelines, Presentation Layer Error Handling, Query Use Case, State Transition Use Case (With Validation) (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (9): 1. Entity, 2. Value Object, 3. Repository Interface, 4. UseCase, Architecture Overview, Best Practices, Directory Structure, FastAPI + Python DDD & Onion Architecture Design Guide (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.20
Nodes (9): Definition, Dependency Injection with FastAPI, Domain Layer: Interface, DTO (Data Transfer Object), Factory Function, Guidelines, Infrastructure Layer: Implementation, Repository Pattern in Python DDD (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (8): CRUD Endpoints, Custom Dependencies, Endpoints & Routing, Include Router, Query Parameters, Quick Reference, Response Models, Router Setup

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (8): Model Validator, Nested Models, ORM Mode (from_attributes), Pydantic V2 Schemas, Quick Reference, Schema Patterns, Serialization Control, Settings (Pydantic V2)

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (7): Async SQLAlchemy, CRUD Operations, Database Dependency, Engine & Session Setup, Lifespan Handler, Model Definition, Quick Reference

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (7): Authentication, Get Current User, JWT Token Creation, OAuth2 Password Flow, Quick Reference, Refresh Token, Role-Based Access

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (7): Async Testing, Auth Helper Fixture, Endpoint Tests, Mocking Dependencies, Quick Reference, Service Tests, Test Setup

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (6): ✍️ Article Management, Khela Dekho Blog - Project Overview, ☁️ Media Uploads, 🔍 Smart Search, 🗂️ Sports Categories, 👥 User Accounts & Access Control

## Knowledge Gaps
- **189 isolated node(s):** `Config`, `OAuth2PasswordRequestForm`, `Depends`, `AsyncSession`, `get_db` (+184 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserRole` connect `Community 8` to `Community 0`, `Community 1`, `Community 3`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `get_current_user()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `UserRole` (e.g. with `Base` and `CategoryBase`) actually correct?**
  _`UserRole` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PostCreate` (e.g. with `AsyncSession` and `Depends`) actually correct?**
  _`PostCreate` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PostUpdate` (e.g. with `AsyncSession` and `Depends`) actually correct?**
  _`PostUpdate` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `PostResponse` (e.g. with `AsyncSession` and `Depends`) actually correct?**
  _`PostResponse` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Config`, `Application lifespan manager for starting and stopping the application asynchron`, `OAuth2PasswordRequestForm` to the rest of the system?**
  _194 weakly-connected nodes found - possible documentation gaps or missing edges._