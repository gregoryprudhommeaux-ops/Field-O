# FIELD-O User Flows

## Flow 1: Create a new report
1. User opens dashboard
2. User clicks New Report
3. User selects language
4. User selects existing client or creates a new one
5. User enters project info
6. User selects inspection template
7. User adds one or more equipment units
8. User completes checklist items
9. If item = Fail, system shows common defects
10. User documents findings with photos and comments
11. User enters technical readings
12. User signs
13. User reviews PDF preview
14. User downloads or shares report
15. Report is saved in history and associated with the client

## Flow 2: Offline draft
1. User starts report without connectivity
2. Draft is stored locally
3. Draft appears in history with offline status
4. User can reopen and edit draft
5. When online, draft can sync to Firestore

## Flow 3: Client-based report management
1. User creates client profile
2. User stores logo and client details
3. Future reports can reuse the client profile
4. Reports are grouped by client in history

## Flow 4: Review and correction
1. User generates preview
2. User notices issue
3. User returns to form
4. User updates fields
5. User regenerates preview
6. User shares final report

