# Truck Parking Platform

A small full-stack prototype for managing truck parking requests.

- **Backend:** Azure Functions (TypeScript, v4 programming model), in-memory storage
- **Mobile:** Expo (TypeScript, expo-router), runs on web and native
- **Shared:** TypeScript types used by both apps
- **Optional AI extension:** a parking assistant (Gemini with a deterministic fallback)

## Screenshots

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/c227ddd9-85e1-4dad-a62f-1c4beebd7148" width="240" alt="Request List" />
      <br />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f0fb87a7-3c7b-4ea1-a848-89809953a923" width="240" alt="Request Detail" />
      <br />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/b44effdc-3831-40a6-8cac-dc07e4fc07a4" width="240" alt="Status Transition" />
      <br />
    </td>
  </tr>
</table>
## Repository structure

```
apps/
  api/        Azure Functions backend
  mobile/     Expo app
packages/
  shared/     Shared types only (index.d.ts)
```

npm workspaces are used, so dependencies are installed once from the repository root.

## Prerequisites

- Node.js 20 or 22 LTS
- Azure Functions Core Tools v4: `npm i -g azure-functions-core-tools@4`
- For native: Xcode (iOS Simulator), Android Studio, or the Expo Go app

No Azure account is needed.

## Running locally

### 1. Install (from the repository root)

```bash
npm install
```

### 2. Backend

```bash
cp apps/api/local.settings.json.example apps/api/local.settings.json
cd apps/api
npm run build
npm start
```

The API listens on `http://localhost:7071/api`. Seed data (6 requests in different statuses) is loaded on start. Set `SEED_DATA` to `false` in `local.settings.json` for an empty store.

Tests:

```bash
cd apps/api
npm test
```

### 3. Mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env
cd apps/mobile
npx expo start -c
```

Press `w` for web, `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go.

API address in `apps/mobile/.env` (`EXPO_PUBLIC_API_URL`):

| Platform | Value |
|---|---|
| Web, iOS Simulator | `http://localhost:8081` |


## API

Base path: `/api`

| Operation | Method and path | Success | Errors |
|---|---|---|---|
| List | `GET /parking-requests` | 200 | |
| Get one | `GET /parking-requests/{id}` | 200 | 404 |
| Create | `POST /parking-requests` | 201 | 400 |
| Update status | `PATCH /parking-requests/{id}/status` | 200 | 400, 404, 409 |
| Delete | `DELETE /parking-requests/{id}` | 204 | 404 |
| Assistant (optional) | `POST /assistant/query` | 200 | 400 |

Status update body: `{ "status": "approved", "parkingSpotId": "A-12" }`.

Errors always have the same shape:

```json
{ "error": { "code": "INVALID_TRANSITION", "message": "...", "details": null } }
```

- `400 VALIDATION_ERROR`: malformed or incomplete data (missing fields, `requestedUntil <= requestedFrom`, unknown truck type, approve without `parkingSpotId`)
- `404 NOT_FOUND`: unknown id
- `409 INVALID_TRANSITION`: the status change is not allowed from the current state

Allowed transitions: `pending -> approved | rejected`, `approved -> checked_in`, `checked_in -> checked_out`. `rejected` and `checked_out` are final.

The server sets `id` (`parking_<uuid>`) and the initial `status` (`pending`).

## Architecture

### Backend (`apps/api/src`)

- `functions/`: thin HTTP handlers. They parse input, call domain, repository, or assistant modules, and return a response. A `handle()` wrapper converts thrown `HttpErrors` into the common error response.
- `domain/`: pure functions with no I/O. `statusTransitions.ts` holds the transition map, `validation.ts` holds zod schemas and `assertValidTransition`. This is where the business rules live and where most tests are.
- `repository/`: a `ParkingRequestRepository` interface plus an in-memory implementation. Handlers only know the interface, so a database can replace it by changing one line in `repository/index.ts`.
- `assistant/`: domain-scoped AI modules (currently `assistant/parking/`). Each module defines a zod filter schema (`schema.ts`), LLM and rule-based parsers (`parseParkingFilterWithLlm.ts`, `parseParkingFilterWithRules.ts`), a fallback orchestrator (`parseParkingQuery.ts`), and request filtering (`query.ts`).
- `utils/`: shared AI helpers (`aiClient.ts`, `geminiProvider.ts`, `parseWithLlm.ts`) that wrap Gemini structured JSON calls and validate responses against a zod schema.

Order of checks when updating a status: body format (400), existence (404), transition rules (409).

### Mobile (`apps/mobile`)

- `app/`: screens (expo-router): request list and request detail
- `src/api/`: fetch client (single `ApiError` type for network and HTTP errors, request timeout) and endpoint functions
- `src/hooks/`: TanStack Query hooks
- `src/store/`: Zustand store
- `src/components/`: reusable UI (cards, badges, status actions, dialog, state views, assistant)
- `src/domain/`: status labels, colors, transition map, formatting

State management split:

- **TanStack Query** owns server data (loading, error, refresh, cache invalidation after a status update).
- **Zustand** owns UI state only (the status filter). Server data is never copied into it.

The detail screen shows only the actions allowed for the current status, asks for a parking spot when approving, and shows a confirmation dialog before moving into a final state (`rejected`, `checked_out`). Success and failure are shown in a custom dialog that behaves the same on web and native. The `note` field is intentionally not displayed on the detail screen.

## Optional AI assistant

An operator can ask things like "Which requests are still pending?", "Show me all approved tankers", "Which requests are scheduled for tonight?" or "Are there any unusually long parking requests?".

- **How it accesses data:** the LLM never sees parking data. It receives only the question text (max 500 characters) and returns a structured filter (`Intent`: statuses, truck type, tonight, long stay). The server then applies that filter to `repository.list()` in `applyIntent`.
- **Query logic:** question -> `Intent` (Gemini, or keyword rules) -> pure filter function -> response. The LLM runs with `temperature: 0` and a JSON response schema.
- **Invalid or unexpected responses:** timeout, JSON parsing in try/catch, zod validation of the model output (invalid values are dropped), then a deterministic keyword parser as fallback. If nothing is understood, the response has `understood: false` and example questions. The response field `source` (`llm` or `rules`) shows which path was used.
- **Preventing unintended changes:** the assistant endpoint is read-only and has no access to update or delete. The model has no tools and its output can only express filter fields. The assistant may suggest a status change, but it is only a hint; the change happens through the normal `PATCH` on the detail screen after the user confirms.
- **Testing:** `resolveIntent` takes the LLM function as a parameter, so tests can simulate success, errors and garbage output without network access. `applyIntent` and `parseQuery` are pure functions.

Configuration in `apps/api/local.settings.json`: `GEMINI_API_KEY` and `ASSISTANT_MODEL`. Without a key the assistant runs on keyword rules only. The model name is an environment variable because provider models get retired (this already happened during development).

Assumptions: "tonight" means 20:00 to 06:00 in the server's time zone; "unusually long" means longer than 48 hours.

## Assumptions and trade-offs

- **Shared package contains types only** (`index.d.ts`). This avoids a build step for the package. The cost: the transition map exists twice (backend and mobile). The server is the source of truth and returns 409 if they diverge. In production I would publish a shared package with runtime code or generate types and rules from an OpenAPI spec.
- **`truckType` is restricted** to `solo`, `semi`, `tanker`.
- **Approving requires `parkingSpotId`.** The backend does not check whether a spot is already taken, so two requests can get the same spot.
- **In-memory storage:** data resets when the API restarts.
- **No authentication, pagination, or rate limiting.**
- **Assistant:** only questions expressible through the existing filters are supported. The keyword fallback does not handle typos (the LLM usually does) or negation ("not approved").
- **Time zones:** dates are ISO 8601 strings; "tonight" uses the server's local time.

## What is missing and how I would continue

- Tests for the HTTP handlers and for the mobile app (only domain logic, repository and assistant logic are covered)
- Spot occupancy check and conflict detection for overlapping time windows
- Real persistence (for example Azure Table Storage or Cosmos DB) behind the existing repository interface
- Authentication and roles (operator vs. driver)
- Pagination and server-side filtering of the list
- OpenAPI spec and generated shared types
- Assistant: fuzzy keyword matching, request caching and limits, logging of how questions were translated, an evaluation set of example questions

## Use of AI-assisted development tools

I used Claude (Anthropic) as a coding assistant throughout the project: for project setup and troubleshooting (npm workspaces, Azure Functions Core Tools, Expo and Metro issues), for drafts of backend and mobile code, and for discussing design decisions such as the layering, error codes, and the assistant's safety model. The runtime assistant uses Google Gemini only to translate a question into a filter.

I reviewed, ran and adjusted the generated code, tested the API manually with curl and on web and iOS Simulator, and made the architectural choices myself (for example the repository interface, types-only shared package, and the read-only assistant that never sends parking data to the model). I can explain all submitted code.
