# CLAUDE.md Guidelines

## Standard Commands
- Start the Expo development server: `npm start` (or `npx expo start`)
- Run on Android emulator/device: `npm run android`
- Run on iOS simulator/device: `npm run ios`
- Run on Web browser: `npm run web`
- Clear project cache and start: `npx expo start -c`
- Run linter: `npm run lint`
- Verify build (no errors): `npx expo export --platform android`

## Project Architecture & Guidelines
- **Language**: Use JavaScript (`.js`) and JSX (`.jsx`) for all front-end code. Avoid TypeScript (`.ts`/`.tsx`).
- **Directory Structure**:
  - `src/app/` — Routing screens and layout definitions (Expo Router file-based routing).
  - `src/components/` — Shared and screen-specific reusable components, grouped by feature:
    - `src/components/accounts/` — `AccountCard`, `AccountDetailModal`, `AccountFormModal`
    - `src/components/inventory/` — `InventoryStats`, `InventoryItemCard`, `InventoryDetailModal`, `InventoryFormModal`, `DropdownFilterModal`
    - `src/components/profile/` — `ProfileTabPersonal`, `ProfileTabAccount`
  - `src/config/` — Environment and runtime configuration (e.g., `env.js` for `API_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
  - `src/context/` — Application-wide state context providers (e.g., `AuthContext`).
  - `src/data/` — Static mock data and helper constants (e.g., `mockInventory.js`).
  - `src/hooks/` — Custom hooks to consume context or handle state (e.g., `useAuth`).
  - `src/services/` — Services for external calls and business logic (e.g., `authService`, `supabase`).
  - `src/constants/` — Theme configs and other constant definitions (e.g., `Colors`).

## Key Architecture Rules
- **No hardcoded secrets or IPs** — All API URLs and Supabase keys live in `src/config/env.js`.
  The `API_URL` is dynamically resolved from `Constants.expoConfig.hostUri` so Android Expo Go works without a static IP.
- **No hardcoded mock data in screen files** — All dummy data lives in `src/data/`.
- **Monolithic screen files must be broken down** — Each major UI section (modals, cards, tabs) has its own component file under the matching `src/components/<feature>/` subfolder.

## Naming Conventions
  - React components/files: PascalCase (e.g., `AccountCard.jsx`, `ProfileTabPersonal.jsx`).
  - Context/Hook files: camelCase (e.g., `useAuth.js`, `AuthContext.js`).
  - Data/config files: camelCase (e.g., `mockInventory.js`, `env.js`).
  - Folders: lowercase (e.g., `components`, `context`, `services`, `data`, `config`).

## Coding Principles
  - Write functional components with hooks (`useState`, `useEffect`, `useContext`).
  - Ensure clear client-side validation logic for all forms.
  - Separate styling into a `StyleSheet` object at the bottom of each JSX file.
  - Keep styles plain and modular, avoiding ad-hoc inline styles where possible.
  - Screen files (`src/app/`) should only contain page-level layout and logic — delegate modals, cards, and tab content to components.
