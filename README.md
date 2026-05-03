# AI Werewolf: Midnight Hunt

A web-based social deduction game inspired by classic one-night werewolf tabletop games, featuring AI opponents with distinct personalities. Built with Next.js and Firebase.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Internationalization**: next-intl (English / Chinese)
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Payments**: Creem (Merchant of Record)

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Authentication and Firestore enabled

## Environment Setup

Create a `.env.local` file in the project root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Set to 'true' to use Firebase emulators instead of production
NEXT_PUBLIC_USE_EMULATORS=true

# Creem (payment processing) — https://creem.io/dashboard
CREEM_API_KEY=creem_test_xxx
CREEM_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID=prod_xxx
NEXT_PUBLIC_CREEM_MONTHLY_PRODUCT_ID=prod_xxx
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the Next.js dev server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Start Firebase emulators (optional)

If you want authentication and Firestore to work locally without a production Firebase project:

```bash
firebase emulators:start
```

This starts the following emulators (configured in `firebase.json`):

| Service    | Port |
|------------|------|
| Auth       | 9099 |
| Firestore  | 8080 |
| Functions  | 5001 |
| Hosting    | 5000 |
| Emulator UI| auto |

Make sure `NEXT_PUBLIC_USE_EMULATORS=true` is set in `.env.local` so the app connects to local emulators instead of production Firebase.

### 4. Linting

```bash
npm run lint
```

> **Note**: There is no automated test suite yet. Linting is the primary code quality check.

## Deployment

### Build the Next.js app

```bash
npm run build
```

### Deploy to Firebase

The Firebase project ID is `onenight-werewolf-3dd14` (configured in `.firebaserc`).

```bash
firebase deploy
```

This deploys:

- **Firestore rules** — from `firestore.rules`
- **Firestore indexes** — from `firestore.indexes.json`
- **Cloud Functions** — from `functions/` (predeploy automatically runs `lint` + `build`)
- **Hosting** — from `public/`

To deploy only specific services:

```bash
firebase deploy --only firestore           # rules + indexes
firebase deploy --only functions           # cloud functions
firebase deploy --only hosting             # static hosting
```

## Firebase Configuration

| File                    | Purpose                                    |
|-------------------------|--------------------------------------------|
| `firebase.json`         | Emulator ports, hosting config, functions  |
| `.firebaserc`           | Project alias mapping                      |
| `firestore.rules`       | Firestore security rules                   |
| `firestore.indexes.json`| Composite indexes                          |
| `functions/`            | Cloud Functions source (TypeScript)        |

## Project Structure

```
src/
├── app/[locale]/          # Next.js pages (i18n routing)
│   ├── page.tsx           # Landing page
│   ├── game/              # Game pages
│   ├── achievements/      # Rank & stats
│   └── settings/          # User settings
├── ai/                    # AI personality & prompt system
├── components/game/       # Game UI components
├── engine/                # Game logic (state, rules, night actions, voting)
├── lib/                   # Firebase, auth, Firestore helpers, rank system
├── messages/              # i18n translation files (en.json, zh.json)
└── store/                 # Zustand game store
```
