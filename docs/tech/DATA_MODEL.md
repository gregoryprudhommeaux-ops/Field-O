# FIELD-O Data Model

## Core entities

### ClientProfile
- id
- name
- logoUrl
- defaultContactName
- defaultContactEmail
- location
- notes
- createdAt
- updatedAt

### CompanySettings
- companyName
- companyLogoUrl
- defaultClientLogoUrl
- customFields
- reportTemplates
- updatedAt

### Report
- id
- clientId
- clientName
- projectName
- operatorName
- language
- reportDate
- templateId
- status
- syncStatus
- generalComments
- signatureDataUrl
- createdAt
- updatedAt

### ReportCustomField
- key
- value

### EquipmentUnit
- id
- reportId
- name
- model
- serialNumber
- nominalVoltage
- notes
- photoUrls

### ChecklistItemResult
- id
- reportId
- unitId
- category
- itemLabel
- status
- selectedCommonDefect
- comment

### TechnicalReading
- id
- reportId
- unitId
- pointLabel
- speedPercent
- rpm
- current
- power
- flow
- pressure
- unitSystem
- voltageMeasured
- voltageToleranceStatus

### Attachment
- id
- reportId
- unitId
- type
- url
- caption

## Draft lifecycle
- draft_local
- pending_sync
- synced
- sync_failed

## Notes
All report entities must be modelled to support:
- mobile-first creation
- offline editing
- client grouping
- future auth ownership
- future analytics

