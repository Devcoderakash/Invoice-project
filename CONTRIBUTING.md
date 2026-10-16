# Contributing Guidelines

Thank you for your interest in improving the **Aakash Furniture Invoicing System**.

## 1. Development Principles

- **Precision Over Assumptions:** All GST and currency calculations must adhere to standard 2-decimal rounding.
- **Maintain Local Independence:** The application must remain fully functional without mandatory external cloud connections.
- **Human-Centered UX:** Avoid disruptive native `alert()` or `confirm()` dialogs. Use accessible in-app modals and toast alerts.
- **Clean Architecture:** Keep calculations pure and separate from UI rendering.

---

## 2. Contribution Workflow

1. **Fork or create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Make your changes:**
   - Adhere to TypeScript strict types.
   - Use Tailwind CSS utility classes aligned with our design system.
4. **Run verification commands:**
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```
   All checks must pass before opening a Pull Request.
5. **Commit with descriptive messages:**
   ```bash
   git commit -m "feat: add customer phone format mask"
   ```
