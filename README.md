
# Hubble — CavliWireless Web Developer Machine Test

A full-stack Next.js application built for the CavliWireless Web Developer machine test. The project combines a Hubble product showcase, interactive 3D product visualization, an MMI exhibitor data scraper, PostgreSQL persistence, and Google Calendar consultation booking.

**Repository:** https://github.com/Arjunarunachalan/cavli-machine-test

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Database Schema and Relationships](#database-schema-and-relationships)
- [Normalization and 3NF](#normalization-and-3nf)
- [MMI Exhibitor Scraper](#mmi-exhibitor-scraper)
- [API Reference](#api-reference)
- [Google Calendar Integration](#google-calendar-integration)
- [3D Product Viewer](#3d-product-viewer)
- [Testing and Build](#testing-and-build)
- [Implementation Notes](#implementation-notes)

---

## Project Overview

The application consists of two main tasks sharing a PostgreSQL database.

### Task 1 — Hubble Product Landing Page

- Responsive Hubble product landing page.
- Five product entries with individual detail pages.
- Interactive 3D GLB model viewer with rotation and zoom.
- Exhibitor information retrieved from PostgreSQL.
- Consultation request form with appointment scheduling.
- Google Calendar event creation and Google Meet link generation.
- Calendar invitation sent to the customer through Google Calendar.

### Task 2 — MMI Exhibitor Scraper

- Retrieves exhibitor and event data from the MMI Connect GraphQL API.
- Handles paginated exhibitor data.
- Imports exhibitors, events, event-exhibitor relationships, and categories into PostgreSQL.
- Uses Prisma upserts to avoid creating duplicate records when the scraper is run repeatedly.
- Exposes a POST endpoint to trigger the import.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL 17 |
| ORM | Prisma 7 |
| Database Adapter | @prisma/adapter-pg |
| 3D Visualization | Google Model Viewer |
| API | Next.js Route Handlers |
| Validation | Zod |
| External Integration | Google Calendar API |
| Authentication | Google OAuth 2.0 |
| Encryption | AES-256-GCM |
| Data Source | MMI Connect GraphQL API |

---

## Features

### Hubble Landing Page

The homepage showcases five Hubble product entries:

- C41QS
- C10QM
- C16QS
- C20QM
- CQM220

Each product links to its own dynamic route:

`/products/[slug]`

The homepage also retrieves exhibitor information from the shared PostgreSQL database.

### Product Detail Pages

Each product detail page includes:

- Product information.
- Responsive layout.
- Interactive 3D model.
- Rotation and zoom controls.
- Model loading state.

The supplied C41QS GLB asset is used for the 3D viewer.

### Consultation Booking

The consultation workflow supports:

1. Submitting customer details.
2. Validating required fields.
3. Retrieving available appointment slots.
4. Selecting a 30-minute appointment.
5. Reserving the slot in PostgreSQL.
6. Creating a Google Calendar event.
7. Requesting a Google Meet conference link.
8. Saving the event ID and Meet link.
9. Sending the calendar invitation to the attendee.

Appointment availability is generated for weekdays, Monday to Friday, between 10:00 AM and 5:00 PM IST.

The application uses a unique database constraint on `scheduledAt` to prevent two consultations from reserving the same slot.

---

## Project Structure

```text
cavli-machine-test/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── google/
│   │   │       ├── route.ts
│   │   │       └── callback/
│   │   │           └── route.ts
│   │   │
│   │   ├── consult/
│   │   │   └── route.ts
│   │   │
│   │   ├── model/
│   │   │   └── route.ts
│   │   │
│   │   └── scrape/
│   │       └── exhibitors/
│   │           └── route.ts
│   │
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── privacy-policy/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── consultation-form.tsx
│   └── product-model-viewer.tsx
│
├── lib/
│   ├── data/
│   ├── scraper/
│   ├── google-calendar.ts
│   ├── token-encryption.ts
│   └── prisma.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
├── .env.example
├── package.json
├── prisma7.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following:

- Node.js 20.19.4 or later.
- npm.
- PostgreSQL 17 or a compatible PostgreSQL server.
- Google Cloud project with the Google Calendar API enabled (required for consultation booking).

### 1. Clone the repository

```bash
git clone https://github.com/Arjunarunachalan/cavli-machine-test.git

cd cavli-machine-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file using `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the values in `.env` with your local PostgreSQL credentials and Google OAuth credentials.

### 4. Set up the database

Create a PostgreSQL database named:

```sql
CREATE DATABASE cavli_machine_test;
```

Update `DATABASE_URL` to match your PostgreSQL username, password, port, and database name.

For example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cavli_machine_test?schema=public"
```

If PostgreSQL is running on a different port, update the connection string accordingly.

### 5. Apply database migrations

```bash
npx prisma migrate dev
```

Generate the Prisma Client:

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

---

## Environment Variables

The application requires the following environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte encryption key |

Generate a token encryption key using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Use the generated value for `GOOGLE_TOKEN_ENCRYPTION_KEY`.

**Security:** Never commit `.env`, OAuth client secrets, database credentials, or encryption keys to GitHub.

---

## Database Setup

The project uses PostgreSQL with Prisma ORM.

Prisma schema:

`prisma/schema.prisma`

Prisma configuration:

`prisma7.config.ts`

Database connection and client initialization:

`lib/prisma.ts`

The schema contains six models:

1. Event
2. Exhibitor
3. EventExhibitor
4. Category
5. Consultation
6. GoogleCalendarCredential

It also defines the `ConsultationStatus` enum.

---

## Database Schema and Relationships

### 1. Event

Stores event information retrieved from MMI Connect.

| Column | Type | Description |
|---|---|---|
| `id` | Int, PK | Internal event ID |
| `sourceId` | Int, Unique | Original MMI event ID |
| `name` | String | Event name |
| `startDate` | DateTime | Event start date |
| `endDate` | DateTime | Event end date |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationship:** One event can have multiple exhibitor associations through `EventExhibitor`.

### 2. Exhibitor

Stores individual exhibitor information.

| Column | Type | Description |
|---|---|---|
| `id` | Int, PK | Internal exhibitor ID |
| `sourceId` | Int, Unique | Original MMI exhibitor ID |
| `companyName` | String | Company name |
| `country` | String, Nullable | Exhibitor country |
| `squareLogo` | String, Nullable | Logo URL |
| `userId` | String, Nullable | Source user ID |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationship:** An exhibitor can participate in multiple events through `EventExhibitor`.

### 3. EventExhibitor

Junction table implementing the many-to-many relationship between events and exhibitors.

| Column | Type | Description |
|---|---|---|
| `eventId` | Int, PK/FK | References `Event.id` |
| `exhibitorId` | Int, PK/FK | References `Exhibitor.id` |
| `exhibitorType` | String, Nullable | Exhibitor type |
| `sponsorship` | String, Nullable | Sponsorship information |
| `boothNo` | String, Nullable | Booth number |
| `hallNo` | String, Nullable | Hall number |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Primary key:** Composite key `(eventId, exhibitorId)`.

**Foreign keys:**

- `eventId` references `Event.id`.
- `exhibitorId` references `Exhibitor.id`.

Both relationships use cascading deletion.

### 4. Category

Stores category information retrieved from the source.

| Column | Type | Description |
|---|---|---|
| `id` | Int, PK | Internal category ID |
| `sourceId` | Int, Unique | Original MMI category ID |
| `categoryType` | String | Category type |
| `productCategoryType` | String | Product category type |
| `mainCategory` | String | Main category |
| `categoryName` | String, Nullable | Category name |
| `parentId` | Int, Nullable, FK | References another category |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationship:** Self-referencing hierarchy. A category can have a parent category and multiple child categories.

### 5. Consultation

Stores customer consultation requests and booking information.

| Column | Type | Description |
|---|---|---|
| `id` | Int, PK | Consultation ID |
| `name` | String | Customer name |
| `email` | String | Customer email |
| `phone` | String, Nullable | Phone number |
| `company` | String, Nullable | Company name |
| `message` | String | Consultation message |
| `scheduledAt` | DateTime, Nullable, Unique | Reserved appointment time |
| `status` | ConsultationStatus | Booking status |
| `calendarEventId` | String, Nullable, Unique | Google Calendar event ID |
| `meetLink` | String, Nullable | Google Meet URL |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Status values:**

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `FAILED`

### 6. GoogleCalendarCredential

Stores the organizer's encrypted Google OAuth refresh token.

| Column | Type | Description |
|---|---|---|
| `id` | String, PK | Credential record identifier; defaults to `organizer` |
| `email` | String, Nullable | Organizer email |
| `refreshToken` | String | Encrypted OAuth refresh token |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

The refresh token is encrypted using AES-256-GCM before database storage.

---

## Database Relationships

```text
Event
  |
  | 1
  |
  | N
EventExhibitor
  |
  | N
  |
  | 1
Exhibitor


Category
  |
  | Self-referencing parentId
  |
  └── Category


Consultation

GoogleCalendarCredential
```

### Relationship Summary

| Relationship | Type |
|---|---|
| Event → EventExhibitor | One-to-many |
| Exhibitor → EventExhibitor | One-to-many |
| Event ↔ Exhibitor | Many-to-many through EventExhibitor |
| Category → Category | Self-referencing one-to-many |
| Consultation | Independent entity |
| GoogleCalendarCredential | Independent credential entity |

---

## Normalization and 3NF

The database is structured to reduce data duplication and maintain consistency.

### First Normal Form (1NF)

- Each column stores a single value.
- Repeating event-exhibitor associations are stored as separate rows.
- Each table has a primary key.

### Second Normal Form (2NF)

- Event details are stored in `Event`.
- Exhibitor details are stored in `Exhibitor`.
- Event-specific exhibitor attributes are stored in `EventExhibitor`.
- The junction table uses a composite primary key consisting of `eventId` and `exhibitorId`.

This avoids storing event or company details repeatedly in association records.

### Third Normal Form (3NF)

- Event attributes depend on the event primary key.
- Exhibitor attributes depend on the exhibitor primary key.
- Event-specific participation attributes depend on the event-exhibitor association.
- Consultation and Google credential data are stored independently from exhibitor data.

This separation reduces update anomalies and unnecessary duplication.

**Source-data limitation:** The imported category data is stored independently because the source integration does not provide a reliable exhibitor-category association in the retrieved data. Parent category relationships are represented through `parentId` when a reliable parent reference is available.

---

## MMI Exhibitor Scraper

### Data Source

MMI Connect GraphQL API:

`https://mmiconnect.in/graphql`

Target event catalogue:

`https://mmiconnect.in/app/catalogue/exhibitors/ep-blr-2026?first=100`

The scraper retrieves paginated exhibitor records and category data from the source.

### Scraper Implementation

| File | Responsibility |
|---|---|
| `lib/scraper/mmi-client.ts` | Communicates with the MMI GraphQL API and retrieves paginated data |
| `lib/scraper/types.ts` | Defines source-data TypeScript interfaces |
| `lib/scraper/import-exhibitors.ts` | Imports events, exhibitors and their associations |
| `lib/scraper/import-categories.ts` | Imports category records |
| `app/api/scrape/exhibitors/route.ts` | Exposes the scraper trigger endpoint |

### Trigger the scraper

Start the development server:

```bash
npm run dev
```

Trigger the import using PowerShell:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/scrape/exhibitors" `
  -Method POST
```

Alternatively, use curl:

```bash
curl -X POST http://localhost:3000/api/scrape/exhibitors
```

The endpoint retrieves the source data and imports it into PostgreSQL.

### Import Strategy

The scraper uses Prisma upsert operations and source IDs to identify existing records.

This allows repeated imports to update existing records instead of inserting duplicate events, exhibitors and categories.

A previous successful local import returned:

- 814 exhibitors
- 2 events
- 384 categories

These are results from a local test run, not a guarantee that the source will always return the same counts.

---

## API Reference

### Consultation API

**Base route:** `/api/consult`

| Method | Purpose |
|---|---|
| `POST` | Submit consultation details |
| `GET` | Retrieve available appointment slots |
| `PATCH` | Reserve an appointment and create a Calendar event |

#### POST `/api/consult`

Example request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "company": "Example Technologies",
  "message": "Interested in IoT connectivity solutions."
}
```

Required fields:

- `name`
- `email`
- `message`

#### GET `/api/consult`

Returns available 30-minute appointment slots in IST.

#### PATCH `/api/consult`

Example request:

```json
{
  "consultationId": 1,
  "scheduledAt": "2026-11-04T09:00:00.000Z"
}
```

The API reserves the selected slot, creates a Google Calendar event, requests a Google Meet link and stores the event details in PostgreSQL.

### Exhibitor Scraper API

**POST** `/api/scrape/exhibitors`

Triggers the MMI exhibitor and category import.

### Google OAuth API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/auth/google` | Starts Google OAuth authorization |
| GET | `/api/auth/google/callback` | Handles the OAuth callback and stores the encrypted refresh token |

### 3D Model API

**GET** `/api/model`

Provides the GLB model through a server-side proxy, including support for HTTP range requests.

---

## Google Calendar Integration

The consultation workflow uses Google OAuth 2.0 and the Google Calendar API.

### Google Cloud Setup

1. Create a project in Google Cloud Console.
2. Enable the Google Calendar API.
3. Configure the OAuth consent screen.
4. Add your Google account as a test user if the application is in Testing mode.
5. Create an OAuth Client ID.
6. Select Web application as the client type.
7. Add the following authorized redirect URI:

```text
http://localhost:3000/api/auth/google/callback
```

8. Copy the OAuth client ID and secret into `.env`.

### Connect the Organizer Account

Open:

```text
http://localhost:3000/api/auth/google
```

Complete the Google authorization flow.

The callback stores the encrypted refresh token in `GoogleCalendarCredential`.

The application uses this credential to create Calendar events.

### Calendar Event Creation

When an appointment is confirmed:

- A Calendar event is created on the organizer's primary calendar.
- The customer is added as an attendee.
- A Google Meet conference is requested.
- `sendUpdates: "all"` requests attendee invitation notifications.
- The Calendar event ID and Meet URL are stored in the `Consultation` record.

### Token Security

Refresh tokens are encrypted using AES-256-GCM.

The encryption key is supplied through `GOOGLE_TOKEN_ENCRYPTION_KEY` and must not be committed to source control.

---

## 3D Product Viewer

The product detail pages use Google's Model Viewer to render the supplied GLB model.

Original model asset:

```text
https://d8wojkg2185gh.cloudfront.net/strapi/C41_QS_a3f9c78cdb.glb
```

The model is served through:

```text
/api/model
```

This server-side proxy avoids relying on the browser to fetch the original cross-origin asset directly and supports range requests.

The viewer supports:

- Rotation.
- Zoom.
- Touch interaction.
- Responsive display.
- Loading state.

---

## Testing and Build

### TypeScript validation

```bash
npx tsc --noEmit
```

### Production build

```bash
npm run build
```

### Run the development server

```bash
npm run dev
```

### Inspect the database

```bash
npx prisma studio
```

Prisma Studio provides a visual interface to inspect imported exhibitors, events, categories, consultations and Google Calendar credentials.

---

## Implementation Notes

- The application uses a shared PostgreSQL database for the scraper and consultation workflow.
- Product catalogue information is maintained in the application data layer.
- The supplied GLB asset is used for the product 3D viewer.
- The exhibitor and event data is retrieved from MMI Connect.
- Google Calendar credentials are stored encrypted in the database.
- The Google OAuth application can remain in Testing mode for local evaluation with an authorized test account.
- A locally configured PostgreSQL database and Google OAuth credentials are required to test the complete workflow.

---

## Repository

GitHub:

https://github.com/Arjunarunachalan/cavli-machine-test
