[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/5L4AYPa2)

# HabitHub — Simple Habit Tracker with Shared Templates

Minimal, clean habit tracker built with Vue 3 + TypeScript, Pinia, Vue Router, Vuetify, and Firebase (Auth, Firestore, Hosting).

**Team:** Joshua V • Hayden O • James B • Dominik P  
**Repository:** [GVSU-CIS371/cis371-w26-team-term-project](https://github.com/GVSU-CIS371/cis371-w26-team-term-project)  
**Live Demo:** _Production URL (add after deploy)_  
**Status:** MVP scope targeting course requirements

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Security Rules](#security-rules)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Environment Variables](#environment-variables)
  - [Seeding Templates](#seeding-templates)
  - [Run, Build, Deploy](#run-build-deploy)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [State Management](#state-management)
- [Git Workflow & Conventions](#git-workflow--conventions)
- [Testing](#testing)
- [Accessibility & UX](#accessibility--ux)
- [Course Requirements Mapping](#course-requirements-mapping)

---

## Overview

HabitHub helps users establish routines with the essentials only:

- Browse a shared template library (read-only) for common habits.
- Create personal habits (from scratch or using template details).
- Log "Completed Today" (and past days) with optional notes.
- View and manage a simple list of logs.

We intentionally exclude streaks, charts, complex scheduling, and social features to keep development fast and focused while fully meeting the course rubric.

---

## Features

**MVP (included):**

- 🔐 **Auth:** Email/password (Firebase Auth), login/logout, protected routes.
- 📚 **Templates (shared, read-only):** List & details; pre-seeded for demo realism.
- 🗂️ **Habits (private):** Create, read, update, delete (CRUD), archive.
- ✅ **Logs (private):** One-tap "Completed Today", add notes, edit & delete, view history.
- 🎨 **UI/UX:** Vuetify layout, responsive design, form validation, loading/empty states.
- 🚀 **Deployment:** Firebase Hosting.

**Stretch (optional, time-permitting):**

- Google Sign-In
- Tag filters for templates
- Basic progress indicators

---

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | Vue 3 (Vite) + TypeScript, Pinia, Vue Router, Vuetify |
| Backend    | Firebase Auth & Cloud Firestore                       |
| Deployment | Firebase Hosting                                      |
| Tooling    | ESLint, Prettier, Vitest (optional)                   |

---

## Architecture

- SPA with guarded routes for authenticated areas.
- Pinia stores for auth, habits, logs, and templates.
- Service layer wraps Firestore operations (`services/*.ts`).
- Firestore Security Rules enforce shared vs. private data access.
- Environment-based config via Vite `import.meta.env` (`VITE_*`).

---

## Data Model

Implemented in Firestore (collection/document).

### `users/{user_id}` — basic public profile

```json
{
  "display_name": "Ada Lovelace",
  "photo_url": "",
  "created_at": 1700000000000
}
```

### `habit_templates/{template_id}` — shared (public read)

```json
{
  "title": "Read 15 minutes",
  "description": "Pick any book or paper and read for 15 minutes.",
  "tags": ["reading", "focus"],
  "created_by": "system",
  "created_at": 1700000000000
}
```

### `habits/{habit_id}` — private per user

```json
{
  "owner_id": "USER_UID",
  "title": "Morning Walk",
  "description": "20-minute walk",
  "tags": ["health", "routine"],
  "from_template_id": "template_read_15",
  "archived": false,
  "created_at": 1700000000000
}
```

### `habit_logs/{log_id}` — private per user

```json
{
  "owner_id": "USER_UID",
  "habit_id": "HABIT_ID",
  "date": "2026-02-19",
  "status": "completed",
  "note": "Felt great outside.",
  "created_at": 1700000000000
}
```

---

## Security Rules

Shared templates are public read; user-owned docs are readable/writable only by their owner. Writes validate `owner_id` matches `request.auth.uid`.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }

    // Shared templates (public read)
    match /habit_templates/{id} {
      allow read: if true;
      allow create, update, delete: if false; // seed via console/admin
    }

    // Publicly readable minimal profile; owner can write
    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId);
    }

    // Private habits
    match /habits/{habitId} {
      allow read, write: if isOwner(resource.data.owner_id);
      allow create: if signedIn() && request.resource.data.owner_id == request.auth.uid;
    }

    // Private logs
    match /habit_logs/{logId} {
      allow read, write: if isOwner(resource.data.owner_id);
      allow create: if signedIn() && request.resource.data.owner_id == request.auth.uid;
    }
  }
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Firebase account and project with Firestore and Auth (Email/Password) enabled
- Git (for cloning and collaboration)

### Local Setup

```sh
# 1) Clone the repo
git clone https://github.com/GVSU-CIS371/cis371-w26-team-term-project.git team-habithub
cd team-habithub

# 2) Install dependencies
npm install

# 3) Create .env file with Firebase config (see below)
cp .env.example .env

# 4) Run in development
npm run dev
```

### Environment Variables

Create a `.env` file in the project root with your Firebase web app config. All keys must be prefixed with `VITE_` for Vite to expose them.

**`.env.example`:**

```sh
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=0000000000
VITE_FIREBASE_APP_ID=1:0000000000:web:abcdef123456
```

In Firebase Console: **Build → Authentication** (enable Email/Password), **Firestore Database** (create), **Project Settings → General → Your apps (Web)** to obtain the config values.  
Add your local dev URL and production domain under **Authentication → Settings → Authorized domains**.

### Seeding Templates

Add ~6–8 templates via the Firebase Console. Recommended seeds:

- "Drink Water"
- "Read 15 minutes"
- "Morning Walk"
- "Stretch 5 minutes"
- "Journal 3 prompts"
- "Practice Coding 30 minutes"
- "Clean Desk (5 minutes)"
- "Pomodoro Study (1×25 min)"

Alternatively, write a small one-off script or manually add documents to the `habit_templates` collection.

### Run, Build, Deploy

```sh
# Dev server
npm run dev

# Type-check + lint (recommended pre-commit)
npm run type-check
npm run lint
npm run format

# Production build
npm run build
npm run preview   # serve built files locally

# Firebase Hosting — first time setup
#   firebase login
#   firebase init hosting   (select project, 'dist' as public dir, SPA rewrites to /index.html)

# Deploy
npm run deploy
# Or:
#   firebase deploy --only hosting
```

> **Note:** Ensure `firebase.json` rewrites all routes to `/index.html` for SPA routing, and that the production domain is added to **Auth → Authorized domains**.

---

## Project Structure

```
team-habithub/
├─ src/
│  ├─ main.ts
│  ├─ App.vue
│  ├─ router/
│  │  └─ index.ts
│  ├─ stores/
│  │  ├─ auth.ts
│  │  ├─ habits.ts
│  │  ├─ logs.ts
│  │  └─ templates.ts
│  ├─ services/
│  │  ├─ firebase.ts        // init app, auth, firestore
│  │  ├─ habits.ts          // Firestore CRUD wrappers
│  │  ├─ logs.ts
│  │  └─ templates.ts
│  ├─ views/
│  │  ├─ AuthView.vue
│  │  ├─ TemplatesView.vue
│  │  ├─ TemplateDetailView.vue
│  │  ├─ MyHabitsView.vue
│  │  └─ HabitDetailView.vue
│  ├─ components/
│  │  ├─ TemplateCard.vue
│  │  ├─ HabitCard.vue
│  │  ├─ LogList.vue
│  │  └─ Ui/
│  │     ├─ AppHeader.vue
│  │     └─ AppShell.vue
│  └─ styles/
│     └─ overrides.css
├─ public/
├─ .env.example
├─ firebase.json
├─ firestore.rules
├─ package.json
└─ README.md
```

---

## Routing

| Route            | Description                                      |
| ---------------- | ------------------------------------------------ |
| `/auth`          | Login / Register                                 |
| `/templates`     | Shared template list                             |
| `/templates/:id` | Template details                                 |
| `/habits`        | My habits (list + CRUD)                          |
| `/habits/:id`    | Habit details + "Completed Today" + log list     |
| `/`              | Redirect to `/habits` (if authed) or `/auth`     |

Route guards redirect unauthenticated users to `/auth` for all private routes.

---

## State Management

Pinia stores encapsulate logic and Firestore interactions behind service functions:

| Store          | Responsibilities                                                      |
| -------------- | --------------------------------------------------------------------- |
| `auth.ts`      | Current user, login, logout, register, route guards                   |
| `templates.ts` | Fetch paged list, fetch by id                                         |
| `habits.ts`    | CRUD for habits (scoped to `owner_id`)                                |
| `logs.ts`      | Create "Completed Today", list by habit and date range, edit, delete  |

---

## Git Workflow & Conventions

**Branching:**

- `feat/<feature-name>` (e.g., `feat/templates-list`)
- `fix/<issue>` (e.g., `fix/auth-guard`)
- `chore/<task>` (e.g., `chore/deploy`)

**Conventional commits:**

```
feat: add habit creation form
fix: correct log date parsing
chore: configure firebase hosting
refactor: move services to folder
docs: update readme
```

**Pull Requests:**

- At least one reviewer required
- Run `npm run type-check && npm run lint` before merge
- Keep PRs small and focused

**Weekly activity:** Each member should make >= 2-3 commits/week to demonstrate steady progress.

---

## Testing

**Unit tests** (optional but recommended):

- Framework: Vitest
- Focus: Store actions (pure logic), small components

**Manual testing checklist:**

- [ ] Sign up, login/logout, route guard redirect
- [ ] Templates visible when logged out (if applicable) or logged in
- [ ] Habits CRUD (create/update/archive/delete)
- [ ] Logs create (today & past), update, delete
- [ ] Mobile responsiveness in dev tools
- [ ] Error/empty/loading states shown appropriately

---

## Accessibility & UX

- Vuetify components for baseline accessibility
- Form labels, required indicators, helpful validation messages
- Color contrast checked via dev tools
- Keyboard navigation in forms and buttons
- Mobile-first layouts; test at 360px width

---

## Course Requirements Mapping

| Requirement           | Implementation                                                                     | Weight |
| --------------------- | ---------------------------------------------------------------------------------- | ------ |
| Complete & Realistic  | Shared templates → personal habits → daily logs; clean, responsive UI              | 10%    |
| User Authentication   | Firebase Auth (email/password), login/logout, protected routes                     | 10%    |
| Cloud Database        | Firestore with `habit_templates`, `users`, `habits`, `habit_logs`                  | 10%    |
| Private & Shared Data | Shared: `habit_templates` (public read). Private: `habits`, `habit_logs`, `users` (owner write) | 10% |
| CRUD                  | Habits: create/read/update/delete. Logs: create/read/update/delete                 | 10%    |
| Modern Frontend       | Vue 3 + TypeScript + Pinia + Vue Router                                            | 10%    |
| Styling               | Vuetify, responsive layout, professional polish                                    | 10%    |
| Git Repo              | GitHub Classroom repo with all contributors                                        | req.   |
| Weekly Progress       | Feature branches, PRs, regular commits from all members                            | 10%    |
| In-Class Presentation | Live demo of full user flow                                                        | 10%    |