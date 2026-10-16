# Changelog

All notable changes to the **Aakash Furniture Invoicing System** are documented in this file.

---

## [2.0.0] — October 2026 (Production Polish & Humanization Release)

### Added
- **GST Jurisdiction Compliance:** Added support for Intra-State (Madhya Pradesh: 50% CGST + 50% SGST) and Inter-State (IGST) tax calculations.
- **Indian Numbering Words:** Automated conversion of grand totals into words (e.g. `Rupees Fifty Thousand One Hundred and Eighteen Only`).
- **Quick-Add Furniture Catalog:** Pre-populated catalog of standard Aakash Furniture items (Sheesham King Beds, Teak Dining Tables, L-Shape Sofas, Modular Wardrobes, etc.) with pre-filled HSN codes (9403, 9401, 9404) and GST brackets.
- **Dashboard Search & Multi-Filter:** Instant search across customer name, invoice number, phone, and email, alongside status filter tabs (`All`, `Paid`, `Pending`, `Overdue`, `Draft`).
- **Data Backup & Restore:** Complete JSON export and import workflow for seamless backups and disaster recovery.
- **Duplicate / Clone Invoice:** One-click invoice cloning to streamline repeat billing.
- **Toast Notification Engine:** Animated toast system providing instant user feedback on saves, deletes, downloads, and copies.
- **Accessible Custom Confirmation Dialog:** Replaced native blocking `window.confirm` with an accessible `ConfirmModal` component.
- **Automated Unit Testing:** Vitest suite covering calculation precision, GST splits, number-to-words, and sequence generation.
- **Tailwind CSS v4 & Bundle Splitting:** Replaced CDN script with local `@tailwindcss/vite` build and Rollup manual chunking for PDF and React vendors.
- **Comprehensive Documentation:** Created `docs/ARCHITECTURE.md`, `docs/SETUP.md`, `docs/SECURITY.md`, `CONTRIBUTING.md`, and updated `README.md`.

### Fixed
- **Invoice Number Sequence Collisions:** Replaced brittle array length calculation with monotonic sequence tracker and maximum existing sequence parser.
- **Floating-Point Rounding Discrepancies:** Standardized all monetary operations to strict 2-decimal rounding.
- **Disruptive Browser Alerts:** Replaced all `alert()` prompts with inline field validation errors and non-blocking toast alerts.
- **External CDN Dependency in HTML:** Removed `cdn.tailwindcss.com` and orphaned importmap from `index.html`.
- **Leftover Boilerplate:** Removed unused `GEMINI_API_KEY` define block from `vite.config.ts`.
