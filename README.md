# Aakash Furniture — GST Invoicing & Billing System

A professional, high-performance, and GST-compliant invoicing web application designed for **Aakash Furniture** (Kolar Road, Bhopal, M.P., India). Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**, featuring instant client-side PDF generation, WhatsApp invoice sharing, multi-criteria dashboard analytics, and offline-first browser storage.

---

## 1. Overview & Problem Statement

Furniture manufacturing and retail businesses in India require tax invoices compliant with Central GST (CGST), State GST (SGST), and Integrated GST (IGST) regulations, complete with standard 4-digit HSN codes (e.g. 9403, 9401, 9404), place of supply declarations, and authorized bank payment details. 

Standard cloud ERP tools are often bloated, slow, require constant internet connectivity, and cost high recurring subscription fees. **Aakash Furniture Invoicing System** solves this by providing a lightweight, lightning-fast, and human-friendly billing workspace that runs entirely in the browser with offline persistence, one-click PDF generation, and direct WhatsApp sharing.

---

## 2. Key Features

- **GST Tax Compliance:** Full support for intra-state (Madhya Pradesh: 50% CGST + 50% SGST) and inter-state (IGST) tax schedules.
- **Furniture Catalog Quick-Add:** Pre-configured catalog of popular furniture pieces (Sheesham King Bed, Teak Dining Set, L-Shape Sofa, etc.) with pre-filled HSN codes and GST brackets.
- **Indian Currency in Words:** Automatic conversion of invoice totals into standard Indian numbering words (Rupees, Lakhs, Crores).
- **Collision-Safe Invoice Generator:** Auto-generates sequential invoice numbers (`AF-YY-XXX`) using an atomic sequence tracker that prevents duplicates even after invoice deletions.
- **Analytics Dashboard:** Live revenue tracking (Total Paid, Outstanding Balance, Overdue invoices, and Average Order Value).
- **Search, Filter & Sort:** Instant search across customer name, invoice #, phone, or email, with status filter pills (`All`, `Paid`, `Pending`, `Overdue`, `Draft`) and column sorting.
- **Instant PDF Export & Print:** High-resolution A4 invoice rendering powered by `html2canvas` and `jsPDF`, with dedicated `@media print` stylesheets.
- **WhatsApp & Email Sharing:** One-click pre-filled WhatsApp message generation via `wa.me` and native Web Share API file attachment.
- **Data Backup & Restore:** Complete JSON export and import capabilities for seamless offline backups and disaster recovery.
- **Clone / Duplicate Invoices:** Replicate any past invoice into a new draft with one click.
- **Human-Centered UX:** Custom animated toast feedback, inline field validation, and accessible confirmation dialogs replacing disruptive browser alerts.

---

## 3. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) |
| **Language** | TypeScript (~5.8.2) |
| **Build Tool & Dev Server** | Vite 6 (`@vitejs/plugin-react`) |
| **Styling & Design System** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Icons** | Lucide React |
| **Document Generation** | jsPDF & html2canvas |
| **Testing** | Vitest |
| **Persistence** | Browser `localStorage` Engine |

---

## 4. Architecture & Folder Structure

```
Invoice-project/
├── components/
│   ├── ConfirmModal.tsx     # Accessible confirmation dialog
│   ├── Dashboard.tsx        # Analytics metrics, search, filters & table
│   ├── InvoiceForm.tsx      # Creation & editing form with catalog presets
│   ├── InvoicePreview.tsx   # A4 GST Tax Invoice layout, PDF & WhatsApp
│   └── Toast.tsx            # Animated notification alert system
├── services/
│   ├── calculationService.ts      # Pure 2-decimal rounding, GST splits & Indian words
│   ├── calculationService.test.ts # Vitest calculation test suite
│   ├── storageService.ts          # Sequence counter, CRUD, JSON backup & restore
│   └── storageService.test.ts     # Vitest storage & sequence test suite
├── docs/
│   ├── ARCHITECTURE.md      # Detailed system architecture & calculation pipeline
│   ├── SETUP.md             # Local setup & environment instructions
│   └── SECURITY.md          # Security audit, XSS defenses & privacy policies
├── index.html               # Clean HTML5 entry point with SEO metadata
├── index.css                # Tailwind CSS v4 imports & print stylesheets
├── index.tsx                # React 19 root bootstrap
├── types.ts                 # TypeScript interfaces for Invoice, Customer, Item
├── constants.ts             # Business config, furniture catalog & status tokens
├── vite.config.ts           # Vite configuration with chunk splitting & Tailwind plugin
├── tsconfig.json            # TypeScript configuration
├── package.json             # Scripts & dependency definitions
├── .env.example             # Safe environment variable template
├── CHANGELOG.md             # Detailed log of improvements and additions
└── README.md                # Comprehensive project documentation
```

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## 6. Installation & Setup

1. **Clone or navigate into the repository:**
   ```bash
   cd "Invoice-project"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to the local URL displayed in your terminal (typically `http://localhost:3000` or `http://localhost:3002`).

---

## 7. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with hot module replacement. |
| `npm run build` | Compiles an optimized, minified production bundle in `dist/`. |
| `npm run preview` | Previews the production build locally. |
| `npm test` | Executes all unit test suites using Vitest. |
| `npm run typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`). |

---

## 8. Business Configuration

Business entity details for **Aakash Furniture** are centralized in [`types.ts`](file:///Users/akashlodhi/untitled%20folder/Invoice-project/types.ts):

- **Business Name:** Aakash Furniture
- **Address:** Shop No. 2, Near SBI Bank, Kolar Road, Bhopal (M.P) - 462042
- **Phone:** +91 91110 92001, +91 99775 18856
- **Email:** aakashfurniture@gmail.com
- **GSTIN:** 23ALVPL7961R2ZW
- **State Code:** 23 (Madhya Pradesh)
- **Bank Details:** Indian Bank, Account: `CA 7184276999`, IFSC: `IDIB000K735`

---

## 9. Testing & Quality Assurance

The application includes automated unit test suites for all financial calculations and persistence mechanisms:

```bash
npm test
```

### Verified Test Coverage:
- `roundCurrency`: Precision float rounding without rounding drift.
- `computeItemAmounts`: Intra-state 50/50 CGST+SGST breakdown and inter-state IGST calculation.
- `computeInvoiceTotals`: Multi-item aggregate validation.
- `numberToWordsIndian`: Number to Indian Rupee words (Lakhs and Crores).
- `generateInvoiceNumber`: Sequential generation and collision safety across deletions.
- `duplicateInvoice`: Clone cloning and re-indexing.
- `exportInvoicesJSON` & `importInvoicesJSON`: JSON backup serialization and integrity validation.

---

## 10. Data Backup & Recovery

- **Export Backup:** Click **Backup** on the dashboard to export all invoices to a JSON file.
- **Import Restore:** Click **Restore** on the dashboard to merge or restore saved invoice JSON backups.
- **Demo Records:** On empty installations, click **Load Sample Invoices** to populate realistic sample data.

---

## 11. License

Proprietary software developed for **Aakash Furniture**, Bhopal (M.P.). All rights reserved.
