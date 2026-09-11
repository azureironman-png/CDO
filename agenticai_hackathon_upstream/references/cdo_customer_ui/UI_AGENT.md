# Customer Data Essentials — UI Agent Reference

This folder is the **canonical Angular UI baseline** for **Agent 02 (UI Engine)**.

When a JIRA / Confluence business requirement updates the party schema (via Agent 01),
Agent 02 must evolve **this** Angular Customer MDM UI—not invent a new Streamlit form.

## App identity

- Product name: **Customer Data Essentials**
- Stack: Angular 18 + Angular Material
- Pattern: Customer Search → party detail sections → mock Middleware ETL

## Key surfaces Agent 02 may change

| Area | Path | Notes |
|------|------|--------|
| Search results table | `src/app/pages/customer-summary/` | Add/remove columns when schema fields change |
| Account details | `src/app/pages/account-details/` | Party attributes, validation |
| Addresses | `src/app/pages/addresses/` | Separate **Legal** and **Primary** tabs |
| Contacts | `src/app/pages/contacts/` | Phone / email |
| Tax & Regulatory | `src/app/pages/tax-regulatory/` | Tax identifiers |
| Credit Cards | `src/app/pages/credit-cards/` | Tokenized only |
| Enquiry | `src/app/pages/customer-enquiry/` | Service notes |
| Create account wizard | `src/app/pages/create-account/` | Onboarding stepper |
| Models | `src/app/models/customer.model.ts` | Keep in sync with EntitySchema |
| Mock / ETL | `src/app/services/` | Demo data + ETL save stubs |
| Shell / branding | `src/app/layout/shell.component.*` | Header: Customer Data Essentials |

## Change rules for Agent 02

1. Prefer **incremental edits** to existing components over rewriting the app.
2. Preserve orange **Customer Data Essentials** chrome and MDM search-table layout.
3. Keep Legal and Primary addresses as **separate tabs**.
4. Map new EntitySchema attributes into:
   - `customer.model.ts`
   - search-results columns (when user-facing)
   - account / wizard forms when editable
5. Keep client validation (required fields, DOB 18+, tax id patterns).
6. Continue saving through `CustomerEtlService` (Middleware ETL stub).
7. Do not capture raw payment card PANs—tokenized cards only.
8. Return concrete file updates (path + full file contents or unified diffs).

## Local run (optional)

```bash
cd references/cdo_customer_ui
npm install
npm start
# http://localhost:4200
```
