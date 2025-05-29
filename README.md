# Mavericks Draft Hub

A fully frontend React application built with Vite and Material UI, serving as a Draft Hub for the Dallas Mavericks’ Front Office. Prospect data and team context are driven by local JSON files, and users can log in, browse and compare draft prospects, submit scouting notes, and record pick selections.

---

## Table of Contents

1. [Features](#features)
2. [Technologies](#technologies)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Usage](#usage)
6. [Workflow](#workflow)
7. [Potential Improvements](#potential-improvements)
8. [Contributing](#contributing)

---

## Features

* **Login Stub** (`LoginPage.jsx`): Simple simulated authentication using credentials from `src/assets/username_password.json`.
* **Big Board** (`BigBoard.jsx`): Displays all draft prospects sorted by averaged scout rankings (from `data/intern_project_data.json`).
* **Scout Board** (`ScoutBoard.jsx`): Alternate view highlighting each individual scout’s ranking lists and outlier indicators.
* **Player Profiles** (`PlayerProfile.jsx`): Detailed prospect pages showing biographical info, measurements, aggregated scout feedback, and on-the-fly scouting report form.
* **Scouting Reports** (`PlayerProfile.jsx` + form): Add custom notes saved to React state; no backend persistence required.
* **Send Draft Pick** (`SendDraftPick.jsx`): UI to record the Mavericks’ draft selections, writing to `data/mavericks_draft_picks.json` in-app state.
* **Responsive Design**: Uses Material UI Grid and breakpoints to support laptop and tablet layouts. Still working on mobile layouts.
* **Branding & Assets**: Team logos and background images in the `public` folder for a polished look.

---

## Technologies

* **React** (v18+) with Hooks
* **Vite** for development and production builds
* **Material UI** for UI components and theming
* **React Router DOM** for client‑side navigation
* **JavaScript / JSX / CSS** for styling

---

## Project Structure

```bash
mavs-draft-hub/
├── data/                           # Static JSON data
│   ├── intern_project_data.json    # Provided prospect list & scoutRankings
│   └── mavs_draft_picks.json       # Local Mavericks pick selections
├── public/                         # Static assets & HTML template
│   ├── index.html                  # Root HTML template
│   ├── NBADraft2025Logo.png        # Branding images
│   ├── dallas-mavericks-logo.png   #
│   └── mavericks-background.png    #
├── src/
│   ├── assets/
│   │   └── username_password.json  # Simulated login credentials
│   ├── components/                 # React UI components
│   │   ├── LoginPage.jsx           # Login stub page
│   │   ├── BigBoard.jsx            # Main prospect overview
│   │   ├── ScoutBoard.jsx          # Detailed scout ranking view
│   │   ├── PlayerProfile.jsx       # Prospect detail & reports
│   │   └── SendDraftPick.jsx       # Draft pick submission form
│   ├── App.jsx                     # Defines routes and global layout
│   ├── main.jsx                    # App entry point (ReactDOM.render)
│   ├── index.css                   # Global CSS resets & styles
│   └── App.css                     # High-level component styles
├── .gitignore                      # Git ignore patterns
├── package.json                    # NPM dependencies & scripts
├── package-lock.json               # Exact dependency versions
├── vite.config.js                  # Vite build configuration
└── README.md                       # Project documentation (this file)
```

### Key File Descriptions

* **data/intern\_project\_data.json**: Core prospect dataset (names, stats, scoutRankings arrays).
* **data/mavs\_draft\_picks.json**: Holds an array of recorded pick entries for the Mavericks; updated in front‑end state by `SendDraftPick.jsx`.
* **src/assets/username\_password.json**: Contains dummy username/password pairs for `LoginPage` to simulate auth.
* **src/components/LoginPage.jsx**: Reads credentials JSON; basic form to “log in” and redirect to `/big-board`.
* **src/components/BigBoard.jsx**: Imports prospect data; calculates average rankings; shows sortable table; links to profiles.
* **src/components/ScoutBoard.jsx**: Renders each scout’s ranking list side by side; flags missing rankings and high/low outliers.
* **src/components/PlayerProfile.jsx**: Fetches player by URL param; displays bio, stats, scout consensus, and report list with a submission form.
* **src/components/SendDraftPick.jsx**: Form allowing Front Office users to record a drafted player and round; appends to local pick array.
* **src/App.jsx**: Sets up `BrowserRouter` routes for `/login`, `/big-board`, `/scout-board`, `/players/:id`, and `/send-pick`.

---

## Installation & Setup

1. **Clone repo**

   ```bash
   git clone <your-repo-url>
   cd mavs-draft-hub
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Run development server**

   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:5173` in your browser.
4. **Build for production**

   ```bash
   npm run build
   ```

---

## Usage

1. **Login**: Visit `/login` and enter one of the stubbed credentials from `username_password.json`.
2. **Big Board**: Browse sorted prospects; click a name to view their profile.
3. **Scout Board**: Compare raw scout lists and spot outliers.
4. **Player Profile**: Read details; submit new scouting reports (stateful only).
5. **Send Draft Pick**: Record which prospect the Mavericks selected; view accumulated picks in-app.

---

## Workflow

* **Data-Driven**: All UI is rendered from JSON files in `/data` and `/src/assets`.
* **Routing**: `App.jsx` handles navigation with React Router.
* **State Management**: Component-level `useState` for form submissions and pick tracking.
* **Styling**: Material UI components + custom CSS for branding.

---

## Potential Improvements

* **Backend Integration**: Persist login sessions, scouting reports, and pick records to a real database.
* **Trade Proposal Module**: UI for suggesting player trades and visualizing team impact.
* **Trade Tracker Module**: An actual backend to frontend communication could allow a trade tracker option.
* **News Module**: Backend to frontend communication could allow for notifications to be sent to the webpage when there is important draft news.
* **Watch Live Module**: Create a new tab to open to watch the 2025 NBA draft live.
* **Salary Cap & Stat Projections**: Analytical engine to project cap hits and on-court metrics by pick.
* **Advanced Filtering & Search**: Filter prospects by position, school, physical attributes, etc.
* **Chart Visualizations**: Integrate charts (e.g., Recharts) for historical and comparative stats.
* **Role-Based Access**: Restrict certain views/actions (e.g., only GMs can finalize picks).
* **Mobile Optimization**: Improve touch interactions and mobile layouts (some pages might not format correctly on portrait mode on mobile devices.
* **Testing Suite**: Add unit and integration tests with Jest and React Testing Library.
---

Happy drafting! 🎉
