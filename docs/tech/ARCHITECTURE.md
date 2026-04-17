# FIELD-O Architecture

## Goal
Refactor the exported Google AI Studio MVP into a production-grade application.

## Recommended stack
- React
- Vite
- TypeScript
- Tailwind CSS or tokenized CSS system
- Firebase Auth later
- Firestore
- Firebase Storage
- Dexie / IndexedDB for local drafts
- jsPDF or equivalent PDF engine
- Framer Motion only where useful

## Architecture principles
- Feature-based folder structure
- Separation of UI, business logic, data access, and document generation
- Reusable form components
- Strong typing for reports, clients, units, templates, and settings
- One source of truth for translations
- One source of truth for constants and defect libraries
- Offline-first thinking for draft lifecycle

## Proposed source structure

```txt
src/
  app/
    router/
    providers/
    layouts/
  features/
    reports/
    clients/
    settings/
    templates/
    history/
    offline/
    pdf/
  components/
    ui/
    forms/
    layout/
  lib/
    firebase/
    db/
    pdf/
    i18n/
    utils/
  hooks/
  types/
  data/
```

## Refactor priorities
1. Extract all types into dedicated typed modules
2. Extract translation dictionary from App.tsx
3. Extract report workflow state management
4. Extract PDF generation into a dedicated module
5. Extract Firestore and Dexie access into services
6. Extract client and settings forms into feature modules
7. Replace oversized App.tsx with routed or modular screens

## Current anti-patterns to remove
- Too much logic in App.tsx
- Mixed UI + business logic + persistence
- Implicit state coupling
- Weak module boundaries
- Hard-to-maintain preview / PDF flow
- Prototype-grade settings handling

## Target outcome
A maintainable, scalable, mobile-first product foundation.

