# Offline-First Architecture & Sync Engine — PashuRakshak

## 1. Why Offline-First is Critical

In rural Maharashtra (e.g. interior villages of Shirur, Parner, Karad, Chandgad), cellular data connectivity is intermittent or unavailable in animal sheds and grazing fields.

PashuRakshak is engineered from the ground up as an **Offline-First Progressive Web App**:
- Farmers and field workers can register livestock and submit illness reports with photos and GPS coordinates without an internet connection.
- Reports are persisted locally in browser **IndexedDB** storage and marked with `sync_status: "PENDING"`.
- When connectivity is restored, the client automatically synchronizes all pending operations via batch API.

---

## 2. IndexedDB Storage Architecture

Client-side database `pashurakshak_offline_store` maintains 4 object stores:
1. `sync_queue`: Queue of offline mutations (`CREATE_REPORT`, `UPDATE_ANIMAL`, `ADD_TREATMENT`, `LOG_VACCINE`).
2. `cached_animals`: Local cache of farmer's livestock records for offline viewing and selection.
3. `cached_reports`: Local mirror of health reports with local optimistic IDs (`loc_rep_...`).
4. `cached_alerts`: Locally cached advisories.

---

## 3. Data Flow & Sync Lifecycle

```
[ Farmer Submits Report Offline ]
                │
                ▼
      [ IndexedDB Store ]
   - Saved with status: PENDING
   - Local risk assessment calculated
   - Immediate UI feedback: "Saved Offline"
                │
    [ Internet Returns / User taps "Sync Now" ]
                │
                ▼
      [ POST /api/sync ]
   - Payload: Array of queued mutations
   - Checks entity versions (Optimistic Locking)
                │
        ┌───────┴───────┐
        ▼               ▼
[ Clean Sync ]     [ Version Conflict ]
- Removed from DB  - Logged in sync_conflicts
- Server ID linked - User prompts Conflict Modal
- Status: SYNCED   - Strategy: MERGED / SERVER / LOCAL
```

---

## 4. Conflict Resolution Strategy

When multiple devices edit the same livestock record while disconnected, the system enforces **Optimistic Versioning (`version` integer field)**:
1. If $\text{Server Version} > \text{Client Version}$, a conflict is detected.
2. The server records both versions in `sync_conflicts` table.
3. The UI presents the **Conflict Resolution Modal** with a side-by-side diff:
   - **Keep Server Version** (`SERVER_WINS`)
   - **Overwrite with Local Version** (`LOCAL_WINS`)
   - **Merge Changes** (`MERGED`)
4. Health records are never silently overwritten.
