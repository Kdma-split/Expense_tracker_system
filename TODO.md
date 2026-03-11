# TODO - Manager Sidebar Navigation Update

## Task
Modify the sidebar in the Manager section so that:
1. Sidebar shows only "My" and "Team" sections
2. Clicking on "My" displays its subsections in the navbar
3. Clicking on those subsections navigates to respective pages
4. Same behavior for "Team"

## Steps Completed
- [x] 1. Analyze the codebase structure
- [x] 2. Modify AppLayout.jsx to implement nested navigation for Manager role

## Implementation Details
- Restructure menuByRole for Manager to have nested categories
- Add state to track active section in navbar
- Render sub-items in the AppBar when a parent is clicked

