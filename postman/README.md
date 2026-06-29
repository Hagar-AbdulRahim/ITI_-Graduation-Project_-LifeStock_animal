# Postman API Testing Guide

## Quick Start

1. **Start the backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Seed admin account** (optional)
   ```bash
   # Set ADMIN_SEED_PASSWORD in backend/.env first
   npm run seed:admin
   ```
   Default admin: `admin@livestock.ai`

3. **Import into Postman**
   - Collection: `postman/LivestockCare-API.postman_collection.json`
   - Environment: `postman/LivestockCare-Local.postman_environment.json`

4. **Select environment** `LivestockCare - Local` in Postman.

## Recommended Test Flow

### Farmer Dashboard
1. `Auth > Register (Farmer)` — or use existing account
2. Verify email (check backend logs or email)
3. `Auth > Login (Farmer)` — saves token automatically
4. `Farms > Create Farm` — saves `farmId`
5. `Animals > Create Animal` — saves `animalId`
6. `Farms > Get Farm Stats (Dashboard)` — full dashboard data
7. `Vaccinations > Create Vaccination`
8. `Health Cases > Diagnose (Text)`

### Admin Dashboard
1. `Auth > Login (Admin)` — set `adminPassword` in environment
2. `Admin Dashboard > Dashboard Stats`
3. `Admin Dashboard > Users Growth Analytics`
4. `Admin Dashboard > List Users / Farms / Animals`
5. `Admin Dashboard > Create Outbreak`
6. `Admin Dashboard > Broadcast Notification`

### Doctor Dashboard
1. Create doctor via `Admin Dashboard > Create User` (role: doctor)
2. Login as doctor (add a Login request or use Admin token — admin can access doctor routes)
3. `Doctor Dashboard > Dashboard Stats`
4. `Doctor Dashboard > List Health Cases`
5. `Doctor Dashboard > Review Health Case`
6. `Doctor Dashboard > Respond Consultation`

## Dashboard Endpoints Summary

| Role   | Endpoint                        | Frontend Route        |
|--------|---------------------------------|-----------------------|
| Farmer | `GET /api/farms/:id/stats`      | `/farms/:farmId`      |
| Admin  | `GET /api/admin/dashboard/stats`| `/admin/dashboard`    |
| Doctor | `GET /api/doctor/dashboard/stats`| `/doctor/dashboard`  |

## Variables

| Variable        | Set By                          |
|-----------------|---------------------------------|
| `accessToken`   | Login requests (auto)           |
| `farmId`        | Create Farm (auto)              |
| `animalId`      | Create Animal (auto)            |
| `healthCaseId`  | Diagnose (auto)                 |
| `vaccinationId` | Create Vaccination (auto)       |
| `outbreakId`    | Create Outbreak (auto)          |
| `adminPassword` | Manual in environment           |

## Notes

- Bearer auth is configured at collection level using `{{accessToken}}`.
- Refresh token uses httpOnly cookie — run Refresh Token in Postman with cookies enabled.
- Image/voice diagnosis endpoints use `form-data` and are not included (use frontend or add manually).
