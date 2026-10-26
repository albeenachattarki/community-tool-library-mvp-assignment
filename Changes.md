# Community Tool Library — Changes

## MVP identification

The product's core functionality is to help neighbors share tools. The MVP therefore needs to support three reliable workflows:

1. A resident can add a tool with a name and description.
2. Residents can view the tools currently listed in the database.
3. A resident can borrow an available tool and return it later, with the availability state persisted by the backend and reflected in the UI.

Ratings, reviews, image uploads, categories, badges, and notifications are outside the MVP and were not expanded in this fix.

## Issues discovered and fixes

### Bug 1: Infinite tool-fetch loop

- **Symptom:** The client repeatedly requested `GET /api/tools`, causing repeated renders and unnecessary network traffic.
- **Cause:** `client/src/App.jsx` called `useEffect` without a dependency array. Every `setLoading` or `setTools` update triggered another effect execution.
- **Fix:** Added an empty dependency array so the initial tool fetch runs once when the component mounts.

### Bug 2: New tools were not persisted

- **Symptom:** The add-tool form displayed a successful response, but the new tool disappeared after a refresh.
- **Cause:** `server/routes/tools.js` returned a timestamp-based in-memory object instead of calling Prisma.
- **Fix:** Added input trimming and validation, then persisted the record with `prisma.tool.create`. Database errors now return a server error response.

### Bug 3: Borrow/return used the wrong endpoint

- **Symptom:** Clicking Borrow or Return failed because the client requested `/api/tool/:id`, while the server route is `/api/tools/:id`.
- **Cause:** The singular path in `client/src/components/ToolCard.jsx` did not match the mounted Express route.
- **Fix:** Updated the client to call `/api/tools/${tool.id}`.

### Bug 4: Borrow/return state never toggled in the UI

- **Symptom:** The backend changed the availability value, but the card continued to show its previous state.
- **Cause:** The client ignored the database response and created a local object with `isAvailable` set to the old value.
- **Fix:** The card now passes the actual updated Prisma record returned by the PATCH request to the parent component.

### Bug 5: Tool state was mutated directly

- **Symptom:** Some availability changes did not cause React to re-render reliably.
- **Cause:** `App.jsx` changed an item inside the existing `tools` array without calling `setTools` with a new array reference.
- **Fix:** Replaced the mutation with a functional immutable update using `map`, which safely handles the latest state.

### Bug 6: Unstable React list keys

- **Symptom:** Tool cards used `undefined` as their React key because `tool.index` does not exist.
- **Cause:** `ToolList.jsx` used a non-existent property instead of the database ID.
- **Fix:** Tool cards now use the stable `tool.id` key.

### Bug 7: Silent request failures

- **Symptom:** Failed GET and POST requests could leave users with no useful feedback.
- **Cause:** The client only handled network exceptions and did not treat non-2xx responses as errors.
- **Fix:** Added response-status checks and user-facing error messages for loading and creation failures. The API also rejects blank names or descriptions with HTTP 400.

## Result

The frontend and backend now share the same REST contract:

- `GET /api/tools` reads tools from PostgreSQL through Prisma.
- `POST /api/tools` validates and persists a new available tool.
- `PATCH /api/tools/:id` toggles the persisted availability state for borrow/return.

The UI applies the backend response after every mutation, so the displayed state remains consistent with the database instead of relying on optimistic local assumptions.

## Verification

From the challenge directory:

```bash
cd server
npm install
# Set DATABASE_URL in server/.env
npx prisma db push
npm start
```

In a second terminal:

```bash
cd client
npm install
npm run build
npm run dev
```

The production build completed successfully during local verification. Full API verification requires a PostgreSQL database configured through `server/.env`.

## Deployment links

- **Frontend Deployment:** Pending deployment credentials/provider access.
- **Backend Deployment:** Pending deployment credentials/provider access.
- **Pull Request:** Pending GitHub repository access.
- **Video Explanation:** Pending recording and Google Drive access.
