# University Course Registration

Full-stack course registration app with a React + Vite client and an Express + MongoDB API.

## Structure

- Client: client/
- Server: server/
- Root dependencies: package.json

## Tech stack

- Client: React, React Router, Axios, Tailwind CSS (client/package.json, client/tailwind.config.js, client/src/lib/api.js)
- Server: Express, Mongoose, JWT, bcrypt (server/package.json)

## Getting started

### 1) Install dependencies

```bash
npm install
```

```bash
cd client
npm install
```

```bash
cd server
npm install
```

### 2) Configure environment

Create a `.env` in server/ (do not commit). Required variables:

- MONGODB_URI
- JWT_SECRET
- PORT (optional, defaults to 5000)

You can also use server/.env.test for scripts.

### 3) Run the server

```bash
cd server
npm run dev
```

The API server is started by server/index.js.

### 4) Run the client

```bash
cd client
npm run dev
```

The client uses client/src/lib/api.js to call the API at http://localhost:5000/api.

## Core features

### Authentication

- Sign up: authController.signUp (server/controllers/authController.js)
- Sign in: authController.signIn (server/controllers/authController.js)
- Routes: server/routes/authRoutes.js

Client pages:
- client/src/pages/SignUp.jsx
- client/src/pages/SignIn.jsx

### Course catalog and registration

- Fetch all courses for a level (and optional carry-overs): courseController.getAllCourses (server/controllers/courseController.js)
- Register courses: courseController.registerCourses (server/controllers/courseController.js)
- Get registered courses: courseController.getRegisteredCourses (server/controllers/courseController.js)
- Routes: server/routes/courseRoutes.js

Client hooks/pages:
- useCourseCatalog (client/src/hooks/useCourseCatalog.js)
- useRegistration (client/src/hooks/useRegistration.js)
- client/src/pages/StudentDashboard.jsx
- client/src/pages/RegisteredCourses.jsx

### Admin console

- Stats: adminController.getAdminStats (server/controllers/adminController.js)
- Students list: adminController.getAllStudentSlips (server/controllers/adminController.js)
- Courses list/create: adminController.getAllCoursesAdmin (server/controllers/adminController.js), adminController.createCourse (server/controllers/adminController.js)
- Routes: server/routes/adminRoutes.js

Client pages/layout:
- client/src/layouts/AdminLayout.jsx
- client/src/pages/AdminDashboard.jsx
- client/src/pages/AdminUsers.jsx
- client/src/pages/AdminCourses.jsx

## API overview

Base URL: http://localhost:5000/api (configured in client/src/lib/api.js)

### Auth

- POST /auth/signup -> authController.signUp (server/controllers/authController.js)
- POST /auth/login -> authController.signIn (server/controllers/authController.js)

### Courses

- GET /courses/all?level=100&includeLevels=200,300
  -> courseController.getAllCourses (server/controllers/courseController.js)
- POST /courses/register
  -> courseController.registerCourses (server/controllers/courseController.js)
- GET /courses/registered
  -> courseController.getRegisteredCourses (server/controllers/courseController.js)

### Admin (requires admin JWT)

- GET /admin/stats
  -> adminController.getAdminStats (server/controllers/adminController.js)
- GET /admin/students
  -> adminController.getAllStudentSlips (server/controllers/adminController.js)
- GET /admin/courses
  -> adminController.getAllCoursesAdmin (server/controllers/adminController.js)
- POST /admin/courses
  -> adminController.createCourse (server/controllers/adminController.js)

Auth middleware:
- authMiddleware.protect (server/middleware/authMiddleware.js)
- authMiddleware.isAdmin (server/middleware/authMiddleware.js)

## Data models

- Course model: Course (server/models/Course.js)
- User model: User (server/models/User.js)

## Seeding and scripts

From server/package.json:

- Seed courses:
  ```bash
  cd server
  npm run seed
  ```
  Uses server/scripts/seedDatabase.js.

- Seed test users:
  ```bash
  cd server
  npm run seed:users
  ```
  Uses server/scripts/seedUsers.js.

- Admin API smoke tests:
  ```bash
  cd server
  npm run test:admin
  npm run test:smoke
  ```
  Uses server/scripts/testAdminEndpoints.js and server/scripts/testSmokeEndpoints.js.
  Requires ADMIN_EMAIL, ADMIN_PASSWORD, and optional ADMIN_TEST_BASE_URL in server/.env.test.

## Client routing

Routes are defined in client/src/App.jsx.

## Notes

- Course registration enforces a 36-unit maximum in courseController.registerCourses (server/controllers/courseController.js).
- Client session data is stored in sessionStorage using keys from client/src/constants/storageKeys.js.

## License

ISC (see server/package.json).
