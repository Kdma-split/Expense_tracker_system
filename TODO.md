# TODO: Display Comments in Approved/Rejected Sections

## Backend Changes
- [x] 1. Modify RequestDto in DTOs.cs to add Remarks field
- [x] 2. Update ExpenseService to populate remarks from StatusHistory for Approved/Rejected requests

## Frontend Changes
- [x] 3. Update RequestTable component to display Comments column
- [x] 4. Verify all pages display comments correctly (completed automatically as all pages use RequestTable)
