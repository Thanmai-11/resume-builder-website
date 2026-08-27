# Resume Builder Pro

An upgrade of the original vanilla HTML/CSS/JS Interactive Resume Builder
into a full-stack application:

- **Frontend:** React (Vite) — the same live form-to-preview experience as
  the original, rebuilt as componentized, state-driven React instead of
  manual DOM manipulation. Adds account login, multiple saved resumes,
  and a template picker (Modern / Classic / Compact).
- **Backend:** Django + Django REST Framework — user accounts (token
  auth), a `Resume` model that stores each resume's form data as JSON,
  full CRUD via a REST API, and a second, server-side PDF export path
  (ReportLab) alongside the original client-side `html2pdf.js` export.

```
resume-builder-pro/
├── backend/     Django project (API, auth, PDF export)
└── frontend/    React app (Vite)
```

## Why these choices

- **React** replaces manual `document.getElementById` / event-listener
  wiring with declarative state — the same two-way form↔preview binding,
  dynamic education/experience rows, skill chips, and progress bar from
  the original project, but as reusable components.
- **Django + DRF** turns the project from "one resume in one browser
  tab" into a real multi-user app: register, log in, save several
  resumes to your account, come back later and edit them.
- **Two PDF export paths** on purpose: the client-side one (`html2pdf.js`)
  needs no server and matches the original project's behaviour exactly;
  the server-side one (ReportLab) demonstrates a Django-rendered PDF and
  works even without JavaScript in the loop.

## Running it locally

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

The API is now at `http://127.0.0.1:8000/api/`. Optional: create an
admin user with `python manage.py createsuperuser` to browse data at
`/admin/`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # points the app at the backend above
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## API summary

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register/` | Create account, returns auth token |
| POST | `/api/auth/login/` | Log in, returns auth token |
| GET | `/api/resumes/` | List the logged-in user's resumes |
| POST | `/api/resumes/` | Create a resume |
| PUT | `/api/resumes/<id>/` | Update a resume |
| DELETE | `/api/resumes/<id>/` | Delete a resume |
| GET | `/api/resumes/<id>/export_pdf/` | Server-rendered PDF download |

All `/api/resumes/...` routes require an `Authorization: Token <token>`
header.

## Deploying

- **Backend:** any WSGI host (Render, Railway, PythonAnywhere, a VPS with
  gunicorn + nginx). Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`,
  `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` as environment
  variables; swap the SQLite `DATABASES` entry for Postgres in
  production.
- **Frontend:** `npm run build` produces a static `dist/` folder —
  deployable to GitHub Pages, Netlify, or Vercel exactly like the
  original single-page project. Set `VITE_API_BASE_URL` to the deployed
  backend's URL before building.

## What's carried over from the original project

Every feature from the original `resume-builder` repo is present:
personal info, profile summary, dynamic education/experience rows,
skill chips + custom skills, live form-to-preview sync, animated
progress bar, "Clear All", and PDF export. Nothing was dropped — the
upgrade adds accounts, persistence, templates, and a second PDF path
on top.
