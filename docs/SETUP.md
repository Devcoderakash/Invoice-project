# Local Development & Setup Guide

This guide walks you through setting up, running, testing, and building the **Aakash Furniture Invoicing System**.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended).
- **Package Manager**: `npm` (v9+) or `bun` / `pnpm` / `yarn`.
- **Modern Web Browser**: Chrome, Edge, Safari, or Firefox with HTML5 support.

Check your Node.js and npm versions:
```bash
node -v
npm -v
```

---

## 2. Installation

Clone or open the project folder in your terminal:

```bash
cd "Invoice-project"
```

Install all production and development dependencies:

```bash
npm install
```

---

## 3. Running Development Server

To launch the local Vite development server:

```bash
npm run dev
```

The terminal will display the local port (default is `http://localhost:3000` or the next open port like `http://localhost:3002`). Open the URL in your browser.

---

## 4. Running Automated Tests

Run unit tests via Vitest:

```bash
npm test
```

To run tests in watch mode during development:
```bash
npx vitest
```

---

## 5. TypeScript Type Checking

Validate all TypeScript definitions and component props:

```bash
npm run typecheck
```

---

## 6. Building for Production

Compile optimized, minified production assets:

```bash
npm run build
```

Production output will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## 7. Data Storage & Persistence

The application uses browser `localStorage` under the key:
- `aakash_furniture_invoices`

### Data Backup & Migration
- **Export Backup:** Click the **Backup** button on the Dashboard to download an `Aakash_Furniture_Invoices_Backup_YYYY-MM-DD.json` file.
- **Restore Backup:** Click the **Restore** button on the Dashboard and select any previously exported JSON file.
- **Sample Records:** On an empty installation, click **Load Sample Invoices** to seed realistic Aakash Furniture customer orders.
