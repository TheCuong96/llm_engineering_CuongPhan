---
name: frontend-standards
description: Front-end engineering standards for React and TypeScript web UIs - component design, state management, data fetching, forms, accessibility, performance, styling, error/loading/empty states, security and testing. Use this skill whenever creating or modifying UI code, components, pages, hooks, styles, forms, or client-side logic in this repository, or when reviewing front-end code, even if the user only says "add a button", "fix this page", or "make it responsive". Pair with nextjs-standards for Next.js-specific rules.
---

# Front-End Standards

Framework-agnostic rules for the web UI (React + TypeScript). Next.js specifics (routing, Server Components, caching) live in `nextjs-standards`. Baseline rules live in `project-standards`.

Before writing a component, find the closest existing one and match its structure, naming, and styling approach.

## 1. TypeScript

- `strict` mode is on. No `any`; use `unknown` and narrow, or write a proper type. If `any` is truly unavoidable, add a one-line comment explaining why.
- Prefer `type` for unions and props, `interface` only when declaration merging or `extends` is needed. Be consistent with the repo.
- Derive types from the source of truth (generated API types, Zod schemas via `z.infer`) instead of re-declaring them.
- Avoid type assertions (`as`). Validate unknown data at the boundary (API responses, `localStorage`, URL params) with a schema, then trust the typed value inside.
- Use discriminated unions for state machines: `{ status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`.
- Do not use non-null assertions (`!`) to silence the compiler; handle the null case.

## 2. Component design

- **One component, one responsibility.** Split when a component mixes data fetching, business logic, and presentation.
- **Presentational vs container.** Keep visual components pure (props in, JSX out). Put data and side effects in hooks or container components.
- **Props:** few, typed, and meaningful. Prefer composition (`children`, slots) over many boolean flags. If you pass more than ~6 props, reconsider the boundary.
- **Naming:** components `PascalCase`, hooks `useCamelCase`, handlers `handleX` inside, `onX` as props, files match the exported component name.
- **File organisation:** colocate by feature (`features/billing/{components,hooks,api,types}`) rather than by technical type across the whole app. Shared primitives live in a `components/ui` (or equivalent) layer with no feature imports.
- **Named exports** by default (better refactoring and auto-import); default exports only where the framework requires them (e.g. Next.js pages/layouts).
- **No logic in JSX** beyond trivial conditionals. Extract variables or small components.
- Always give list items a stable, unique `key` (an id, never the array index for dynamic lists).

## 3. State management

Pick the lowest-power tool that works, in this order:

1. **Derived value** - compute during render; do not store what you can calculate.
2. **Local state** (`useState`/`useReducer`) - for state owned by one component.
3. **URL state** (search params, route params) - for anything shareable, bookmarkable, or surviving refresh: filters, pagination, tabs, sort.
4. **Server state** (TanStack Query / SWR / framework data layer) - for data from the backend. Never copy it into a global store.
5. **Context** - for rarely changing, widely needed values (theme, current user). Split contexts to avoid re-render storms.
6. **Global client store** (Zustand/Redux or whatever the repo uses) - only for genuinely cross-cutting client state.

Rules:
- Do not mirror props into state. Lift state up or use a key to reset.
- Do not sync state with `useEffect` when you can derive it.
- Keep state minimal and normalised; avoid contradictory booleans (`isLoading` + `isError` + `isSuccess`) - use one status.

## 4. Effects and hooks

- `useEffect` is for synchronising with external systems (subscriptions, timers, DOM APIs), **not** for data transformation or reacting to user events. Event logic belongs in handlers.
- Dependency arrays must be complete; the lint rule is not optional. Fix the design rather than suppressing the warning.
- Always clean up subscriptions, timers, listeners, and in-flight requests (`AbortController`).
- Extract repeated effect + state logic into a custom hook with a clear name and a typed return value.
- Memoisation (`useMemo`, `useCallback`, `React.memo`) is an optimisation: add it after measuring a real problem, not by default. (If the project uses the React Compiler, follow its guidance and avoid manual memoisation.)

## 5. Data fetching and API layer

- All HTTP goes through **one API client module** (base URL, auth header, error normalisation, request-id header, timeout). Components never call `fetch`/`axios` with hard-coded URLs.
- Use generated or schema-validated types for requests and responses.
- Normalise errors into one shape the UI can render (matches the standard error shape in `project-standards`).
- Handle every state explicitly: **loading, empty, error, success, and partial/stale**. A screen that only handles success is unfinished.
- Cache and invalidate deliberately: after a mutation, invalidate or update exactly the queries it affects. Use optimistic updates only when rollback is handled.
- Debounce search-as-you-type; cancel superseded requests; paginate or virtualise long lists.
- Never trust the client for authorisation: hiding a button is UX, not security.

## 6. Forms and validation

- Use one form library consistently (React Hook Form + Zod is the default unless the repo differs).
- Define the schema once and reuse it for types and validation. Mirror server rules, but remember the server is the authority.
- Show errors next to the field, announce them to assistive tech (`aria-describedby`, `role="alert"` for summaries), and move focus to the first invalid field on submit.
- Disable or guard the submit button while submitting to prevent double submits; show progress; handle server-side field errors by mapping `details[].field` onto the form.
- Preserve user input on failure. Never clear a form because a request failed.
- Use the right input types and `autocomplete` attributes.

## 7. Accessibility (non-negotiable)

Target WCAG 2.2 AA.

- Use **semantic HTML** first: `button` for actions, `a` for navigation, `label` bound to inputs, headings in order, landmarks (`main`, `nav`). Do not put click handlers on `div`s.
- Everything operable by keyboard; visible focus styles; logical tab order; no keyboard traps. Modals trap focus, close on `Esc`, and restore focus on close.
- Images have meaningful `alt` (empty `alt=""` for decorative). Icon-only buttons have an accessible name (`aria-label`).
- Colour is never the only carrier of meaning; contrast at least 4.5:1 for body text.
- Respect `prefers-reduced-motion`. Do not auto-play motion or media without controls.
- Use ARIA only to fill gaps semantic HTML cannot; wrong ARIA is worse than none.
- Dynamic updates (toasts, async results) use live regions.

## 8. Performance

Measure with Lighthouse / Web Vitals before and after; targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.

- Send less JavaScript: code-split heavy routes and components (`dynamic`/`lazy`), avoid large libraries for small tasks, check bundle impact before adding a dependency.
- Optimise images (correct size, modern formats, lazy loading below the fold, explicit width/height to prevent layout shift) and fonts (subset, `font-display`).
- Avoid layout thrash and unnecessary re-renders: stable props, lifted state, split context, virtualised lists for hundreds of rows.
- Do not block rendering on non-critical requests; show skeletons that match final layout.
- Never import a whole utility library for one function (`lodash` -> `lodash-es` per-function or native).

## 9. Styling

- Follow the repo's system (Tailwind, CSS Modules, design tokens, or a component library). Do not mix approaches in one feature.
- Use design tokens (colours, spacing, typography) rather than raw values. No magic numbers or hard-coded hex colours in components.
- **Mobile-first and responsive**; test at 360 px, 768 px, and 1280 px widths. Use relative units and flex/grid; avoid fixed widths.
- Support dark mode if the app does, via tokens, not duplicated styles.
- Avoid `!important` and deep selector nesting. Component styles stay local to the component.
- Reuse primitives from the UI layer (Button, Input, Modal) rather than restyling raw elements per page.

## 10. Internationalisation and formatting

- No user-facing strings hard-coded in components if the app is localised; use the i18n layer and keys.
- Format dates, numbers, and currency with `Intl` APIs and the user's locale. Store and transmit UTC; convert for display only.
- Plan for text expansion (Vietnamese and German run longer than English) and right-to-left if required.

## 11. Security (client side)

- Never use `dangerouslySetInnerHTML` with unsanitised content; if unavoidable, sanitise with a vetted library (DOMPurify) and justify it in a comment.
- Do not store tokens or sensitive data in `localStorage`. Prefer `httpOnly`, `Secure`, `SameSite` cookies set by the server.
- Never ship secrets to the browser. Anything bundled client-side is public.
- Validate and encode data placed into URLs; open external links with `rel="noopener noreferrer"`.
- Do not trust data from `postMessage`, URL params, or storage without validating it.

## 12. Error handling and resilience

- Use error boundaries around feature areas so one failure does not blank the app.
- User-facing errors are actionable and human ("We couldn't save your changes. Try again."), never raw stack traces or error codes alone. Offer a retry where it makes sense.
- Report unexpected errors to the monitoring tool the repo uses, with the request id; never swallow errors silently (`catch {}`).

## 13. Testing

- **Unit/component tests** (Vitest or Jest + Testing Library): query by role, label, and text as a user would; avoid testing implementation details or snapshot-testing large trees.
- **Hooks and pure logic:** unit-test directly.
- **API mocking:** use MSW at the network layer, not by mocking the API client module.
- **E2E** (Playwright/Cypress): cover critical journeys (sign-in, checkout, core CRUD), not every screen.
- Include accessibility checks (`jest-axe` / `axe-core`) on key components.
- Every bug fix gets a regression test. Tests must be deterministic: mock timers and network, never hit real services.

## 14. Pre-completion checklist

- [ ] Loading, empty, error, and success states all render correctly
- [ ] Works with keyboard only; labels and focus are correct
- [ ] Responsive at mobile, tablet, desktop
- [ ] Types strict, no `any`, API types come from the contract
- [ ] No console output, dead code, or hard-coded strings/colours
- [ ] Lint, type-check, and tests pass
- [ ] Bundle impact considered for any new dependency
