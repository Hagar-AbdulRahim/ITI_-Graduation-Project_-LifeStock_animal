# Cascade Deletion Plan

## Goal
Implement a robust cascading deletion system for Farms, Animals, and Users, ensuring no orphaned records (HealthCases, Vaccinations, Consultations, etc.) are left behind when a parent entity is deleted.

## User Review Required
> [!IMPORTANT]
> The current system performs a "Soft Delete" (deactivation) when a user deletes their account. This plan changes it to a "Hard Delete" that permanently removes the user and ALL their data from the database. Are you sure you want to proceed with permanent hard deletion for user accounts?

## Proposed Changes

### 1. `backend/models/farm.js`
Update the `pre("findOneAndDelete")` Mongoose hook.
Currently, deleting a farm deletes its animals but leaves their vaccinations and health cases behind.
- **[MODIFY]** Update the hook to find all animals in the farm, extract their IDs, and delete their `HealthCase` and `Vaccination` records before deleting the animals themselves.

### 2. `backend/controllers/User.controller.js`
Change `deleteMe` from a soft-delete (`is_active: false`) to a full hard-delete cascade.
- **[MODIFY]** `deleteMe` will:
  - Find all farms owned by the user.
  - Find all animals in those farms.
  - Delete all `HealthCase` and `Vaccination` records linked to those animals.
  - Delete all `Animal` records.
  - Delete all `Farm` records.
  - Delete all `Consultation` records created by the user.
  - Finally, delete the `User` account permanently (`findByIdAndDelete`).

### 3. `backend/models/animal.js` (No Change Required)
The `animal.js` model already has a working `pre("findOneAndDelete")` hook that deletes `HealthCase` and `Vaccination` when an individual animal is deleted by `Animal.controller.js`.

## Verification Plan
### Automated Tests
- N/A

### Manual Verification
1. Create a farm, an animal, a health case, and a vaccination. Delete the animal -> Verify health case and vaccination are deleted from DB.
2. Create a farm, an animal, a health case, and a vaccination. Delete the farm -> Verify the animal, health case, and vaccination are deleted from DB.
3. Create a user, farm, animal, and consultation. Delete the user account -> Verify everything is wiped from DB completely.
