# FIELD-O Migration Notes

## Source
This project was initially prototyped in Google AI Studio and exported as a zip archive.

## What must be preserved
- bilingual EN / ES experience
- mobile-first field workflow
- report preview before share
- offline local draft behavior
- client-based report organization
- sample report for demo purposes
- technical readings and unit-level logic
- PDF branding with company and client logos

## What must be improved
- code modularity
- maintainability
- typed state handling
- form structure
- routing or screen organization
- testability
- clarity of data services
- error handling around preview and PDF flow

## Migration rule
Do not rewrite blindly.
First preserve current business logic.
Then progressively refactor into modules.

