

## Add Drill-Down Functionality to Summary Page Table

### Overview
Enable users to click on the numbers in the Store Category Table on the Summary page to see the actual feedback items that make up those counts. Clicking a number will open a dialog showing the filtered feedback cards.

---

### Current Architecture

The Summary page uses:
- `StoreCategoryTable` - displays a grid of stores vs categories with counts
- `filteredFeedbacks` - the filtered feedback array based on current filter selections
- The main Dashboard (`Index.tsx`) already has the `FeedbackDetailsDialog` for viewing individual feedback

---

### Implementation Approach

**Create a new Drill-Down Dialog Component**

A new `FeedbackDrillDownDialog` component that:
- Accepts a list of filtered feedback items and a title
- Displays the feedback items as cards in a scrollable dialog
- Allows clicking individual cards to open the full `FeedbackDetailsDialog`

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/feedback/StoreCategoryTable.tsx` | Add click handlers to count cells, accept callback props, track drill-down state |
| `src/components/feedback/FeedbackDrillDownDialog.tsx` | **New file** - Dialog to display list of feedback cards |
| `src/pages/Summary.tsx` | Add state for drill-down dialog, pass callbacks to StoreCategoryTable |

---

### Technical Details

**1. New Component: `FeedbackDrillDownDialog.tsx`**

```text
Props:
- isOpen: boolean
- onClose: () => void
- title: string (e.g., "Store #1234 - Slow Service (5 items)")
- feedbacks: CustomerFeedback[]
- onViewDetails: (feedback: CustomerFeedback) => void

Features:
- Scrollable list of CustomerFeedbackCard components
- Each card is clickable to open full details
- Shows count in header
```

**2. Update `StoreCategoryTable.tsx`**

```text
New Props:
- onCellClick?: (storeNumber: string, category: string, feedbacks: CustomerFeedback[]) => void
- allFeedbacks: CustomerFeedback[] (needed to filter)

Changes:
- Make count cells clickable (cursor-pointer, hover effect)
- On click, filter feedbacks by store + category and call onCellClick
- Also make totals row clickable (filter by category only)
- Make store total column clickable (filter by store only)
```

**3. Update `Summary.tsx`**

```text
New State:
- drillDownOpen: boolean
- drillDownFeedbacks: CustomerFeedback[]
- drillDownTitle: string
- selectedFeedback: CustomerFeedback | null
- isDetailsDialogOpen: boolean

New Functions:
- handleCellClick: filters feedback and opens drill-down dialog
- handleViewDetails: opens full FeedbackDetailsDialog from drill-down

Integrate:
- Pass onCellClick to StoreCategoryTable
- Render FeedbackDrillDownDialog
- Render FeedbackDetailsDialog for individual item viewing
```

---

### User Experience Flow

```text
1. User views Summary page with Store Category Table
2. User sees a count (e.g., "5" under "Slow Service" for Store #1234)
3. User clicks the "5" 
4. Drill-down dialog opens with title "Store #1234 - Slow Service (5 items)"
5. Dialog shows 5 feedback cards in a scrollable list
6. User clicks a specific card
7. Full FeedbackDetailsDialog opens for that item
8. User can close details dialog and return to drill-down, or close both
```

---

### Visual Changes to Table Cells

- Count cells with values > 0 become clickable
- Hover state: underline + pointer cursor
- Visual indicator that cells are interactive (subtle blue text color on hover)

