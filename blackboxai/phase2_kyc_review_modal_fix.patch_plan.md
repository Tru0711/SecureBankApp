# Phase 2 - KYC Review Modal Fix Plan

## Goal
Make the admin KYC Review modal show **actual KYC fields and uploaded document previews** and implement **Reject with required reason + admin remarks**.

## Diagnosis
Current `frontend/src/pages/admin/KycReviewCenterPage.jsx` uses legacy mappings:
- expects `selected.documents.panCard|aadhaarCard|selfie`
- uses `selected.verification?.pan|aadhaar` and `selected.panVerified|aadhaarVerified`
- reject uses `window.prompt()` and only passes `{ reason }`

But backend model now stores:
- `selected.panNumber`, `selected.aadhaarNumber`, `selected.address`, `selected.dob`
- `selected.documents.panImageUrl`, `aadhaarFrontImageUrl`, `aadhaarBackImageUrl`, `selfieImageUrl`, `passbookImageUrl`
- admin rejection is stored in `rejectionReason` and `rejectionRemarks`

## Changes to make

### 1) Frontend mapping update
In `KycReviewCenterPage.jsx`:
- Replace:
  - Address/DOB: currently uses `selected.userId?.address|dob` (may be empty) -> use `selected.address`, `selected.dob`.
  - PAN/Aadhaar number: remove `getPanNumber/getAadhaarNumber` legacy logic -> use `selected.panNumber`, `selected.aadhaarNumber`.
  - Document previews: use URL fields:
    - PAN: `selected.documents?.panImageUrl`
    - Aadhaar Front: `selected.documents?.aadhaarFrontImageUrl`
    - Aadhaar Back: `selected.documents?.aadhaarBackImageUrl`
    - Selfie: `selected.documents?.selfieImageUrl`
    - Passbook: `selected.documents?.passbookImageUrl`

### 2) Document render controls
Add a reusable `DocPreview` component that shows:
- thumbnail image if URL exists
- buttons:
  - **View Full Size** (open in new tab)
  - **Download** (a link with `download` attribute)
- if no URL: show `Not uploaded` (no “Image not available” placeholder)

### 3) Verification UI
Replace Unknown logic with:
- use `selected.verification?.results?.panVerified`, etc.
- show `Verified/Unverified/Unknown` based on existence of boolean

### 4) Reject workflow (UI + API)
Replace prompt-based rejection with a modal:
- Reject button always visible.
- Modal requires:
  - rejection reason selection (dropdown)
  - admin remarks textarea (required)
- On submit call:
  - `adminApi.reviewKyc(selected._id, { status:'REJECTED', reason, remarks })`
- After save:
  - close modal
  - refresh queue
  - set actionMessage

### 5) Debug logs (frontend)
Add `console.log` on openReview:
- log `selected` payload and `selected.documents`
- log current mapping fields.

## Dependent files
- `frontend/src/pages/admin/KycReviewCenterPage.jsx`

## Acceptance criteria
- Admin review drawer shows:
  - PAN/Aadhaar numbers
  - Address and DOB
  - Document previews for all uploaded images
  - Reject modal enforces reason + remarks and persists them
- Rejected tab shows rejection reason/remarks.

