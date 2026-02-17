---
module: Canvas Editor
date: 2026-02-17
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - "Grid spacing input crashed on change"
  - "Drag movement overshot pointer due compounded delta"
  - "Resize handle intermittently ignored move/up events"
  - "Publish from editor looked successful but bypassed server persistence"
  - "Autosave cycle could reset editor store state"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [canvas-editor, drag-drop, pointer-events, publish-flow, autosave]
---

# Troubleshooting: Canvas Editor Interaction + Publish Regression Bundle

## Problem
Canvas editor shipped with a cluster of interaction and publish regressions. Users could hit runtime errors, broken pointer behavior, and false publish success in DB mode.

## Environment
- Module: Canvas Editor
- Affected Component: Canvas toolbar, drag/resize hooks, editor publish flow, store lifecycle
- Date: 2026-02-17

## Symptoms
- Grid spacing input throw at runtime.
- Drag felt accelerated/overshooting pointer.
- Resize handle started but did not reliably update/commit size.
- Publish button could update local state only, not DB-backed canonical publish path.
- Autosave feedback loop could recreate store and drop ephemeral editing context.

## What Didn't Work
**Original implementation:**
- Grid callback declared in type but missing from toolbar destructuring.
- Drag delta computed from pointer-down but added to mutable preview origin.
- Resize pointerdown on one node, move/up on sibling node.
- Publish button used local `publishInvitation` only.
- Store created from `initialDocument` identity path.

- **Why it failed:** each issue violated one invariant (callback wiring, pointer capture semantics, canonical mutation path, stable store identity).

## Solution
Patched all five defects in one pass and added regression tests.

**Code changes:**
```ts
// Drag: use stable pointer-down origin
const startOriginRef = useRef<Position | null>(null);
startOriginRef.current = getOrigin();
const previewRaw = { x: startOriginRef.current.x + deltaX, y: startOriginRef.current.y + deltaY };

// Resize: keep down/move/up/cancel on same handle element
<button onPointerDown={...} onPointerMove={...} onPointerUp={...} onPointerCancel={...} />

// Publish: call canonical server mutation first
const result = await publishInvitationFn({ data: { invitationId, token } });
updateInvitation(invitationId, { status: "published", slug: result.slug, ... });
```

**Files changed:**
- `src/components/canvas/CanvasToolbar.tsx`
- `src/components/canvas/hooks/useDragBlock.ts`
- `src/components/canvas/SelectionOverlay.tsx`
- `src/components/canvas/CanvasEditor.tsx`
- `src/components/canvas/CanvasEditor.test.tsx`
- `src/components/canvas/hooks/useDragBlock.test.tsx`

## Why This Works
1. Drag now uses fixed origin + live pointer delta, so motion is linear and deterministic.
2. Resize handlers now share pointer-capture target, so move/up lifecycle stays intact.
3. Publish now uses server API as source of truth, then syncs local state from response.
4. Store instance now stable per `invitationId`, preventing autosave-triggered reinit.
5. Added tests lock behavior for spacing, resize, publish path, and store stability.

## Prevention
- For pointer flows: enforce “same target handles down/move/up/cancel”.
- For drag math: never mix pointer-down delta with mutable origin.
- For publish/critical actions: always use canonical server mutation path first.
- For Zustand store lifecycles: keep store identity stable across prop identity churn.
- Keep regression tests for every bugfix invariant.

## Verification
- `pnpm check` passed.
- `pnpm test` passed (`36` files, `402` tests).
- Added tests:
  - `CanvasEditor.test.tsx`: spacing, resize, publish, store-stability cases
  - `useDragBlock.test.tsx`: non-compounding delta case

## Related Issues
No related issues documented yet.
