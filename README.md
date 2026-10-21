# Student Portfolio + Task Desk

A cumulative ITUE301 Advanced Web Development Frameworks practical project. Practicals 1-3 build a React portfolio and GitHub repository viewer. Practicals 4-7 extend the same application with an Express REST API, MongoDB persistence, JWT authentication, and protected task CRUD.

## Features

- React portfolio with reusable functional components
- React Router navigation, dark/light mode, controlled contact form, and 404 route
- GitHub REST API loading, error, retry, search, and star counts
- Express task REST API with request logging and structured errors
- MongoDB/Mongoose persistence with task validation and priority
- Registration with bcrypt password hashing
- Login with one-hour JWT authentication
- Protected task workspace and `/me` endpoint
- Centralized Fetch API helper and CRUD notifications

## Technologies

React, Vite, React Router, JavaScript, Fetch API, Node.js, Express, MongoDB, Mongoose, CORS, bcryptjs, jsonwebtoken, dotenv.

## Folder structure

```text
frontend/
  src/components/  reusable portfolio, navigation, loading, and repository components
  src/pages/       Home, Projects, Contact, Login, Register, Tasks, NotFound
  src/api.js       centralized backend requests
backend/
  models/          Task and User Mongoose models
  middleware/      JWT and request validation middleware
  server.js        Express app and API routes
README.md
```

## Setup

Prerequisites: Node.js 18+, npm, and a running MongoDB instance or MongoDB Atlas database.

### Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/student_portfolio
JWT_SECRET=use_a_long_random_secret_here
PORT=5000
```

Run the backend:

```bash
npm start
# or, on Node versions supporting watch mode:
npm run dev
```

The API runs at `http://localhost:5000`. The included `.env` is only a local placeholder and is ignored by Git; replace its secret before use.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite application runs at `http://localhost:5173`. Set `VITE_API_URL` only when the backend is hosted somewhere other than `http://localhost:5000`.

## API endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/health` | No | Server health |
| POST | `/register` | No | Create a hashed-password user |
| POST | `/login` | No | Return a one-hour JWT |
| GET | `/me` | Yes | Return current user information |
| GET | `/tasks` | Yes | List tasks |
| GET | `/tasks/:id` | Yes | Read one task |
| POST | `/tasks` | Yes | Create a task |
| PUT | `/tasks/:id` | Yes | Update a task |
| DELETE | `/tasks/:id` | Yes | Delete a task |

Protected requests use `Authorization: Bearer <token>` and task requests use `Content-Type: application/json`.

## Authentication flow

1. Register with an email and six-character minimum password.
2. Log in; the server compares the bcrypt hash and returns a JWT containing the user ID.
3. The frontend stores only the token in local storage and sends it through the shared API helper.
4. The auth middleware verifies the token and places decoded data in `req.user`.
5. A missing, invalid, or expired token returns `401`; the frontend clears the token and routes to Login.
6. Logout removes the token. Passwords are never stored in the browser.

## Testing instructions

- Frontend build verified with `npm run build`.
- Backend JavaScript syntax verified with `node --check` for server, models, and middleware.
- Run MongoDB, start the backend, and open the frontend.
- Register, log in, create a task, complete it, delete it, refresh, and confirm persistence.
- Visit `/projects` to verify GitHub loading/search/retry behavior.
- Use an API client or browser to check missing/invalid JWTs, invalid task IDs, validation failures, undefined routes, and all CRUD endpoints.

### Practical 7 demonstration

Keep these items in the submission:

- `backend/models/User.js`: the User document stores the bcrypt hash, never the plain password.
- `backend/middleware/auth.js`: verifies the Bearer JWT and rejects missing, invalid, or expired tokens.
- `backend/middleware/validation.js`: rejects invalid credentials and task bodies before MongoDB is called.
- `backend/server.js`: registration, login, `/me`, and authenticated task routes.
- `frontend/src/pages/Login.jsx`, `Register.jsx`, `Tasks.jsx`, and `api.js`: the visible authentication flow and token handling.
- `backend/.env.example`: configuration names only. Keep the real `.env` secret and out of the submission.

Expected practical output:

```text
POST /register -> 201 { "message": "Registration successful.", "user": { "email": "student@example.com" } }
POST /login -> 200 { "message": "Login successful.", "token": "<JWT>" }
GET /tasks without Authorization -> 401 { "message": "Authentication token is required." }
POST /tasks without title -> 400 { "message": "Task title is required." }
POST /tasks with the JWT -> 201 { "title": "Finish practical", ... }
```

Do not include a real password, JWT, MongoDB URI, or JWT secret in screenshots or submitted output. Show the status codes and redacted responses instead.

## Practical mapping

- **Practical 1:** `Header`, `About`, `Skills`, `Footer`, `Home`, and reusable JSX/CSS.
- **Practical 2:** `BrowserRouter`, `NavBar`, routes, controlled Contact form, theme state, and NotFound.
- **Practical 3:** `Projects`, `Spinner`, `ErrorMessage`, `RepoList`, `useEffect`, GitHub fetch, search, retry, and stars.
- **Practical 4:** Express app, JSON middleware, logger, content-type middleware, REST routes, 404, and error handler.
- **Practical 5:** `Task` schema, MongoDB connection, persistence, enum, timestamps, trim hook, and clean errors.
- **Practical 6:** `api.js`, CORS, task page, create/read/update/delete, loading/error states, confirmation, and notices.
- **Practical 7:** `User`, bcrypt, JWT, auth middleware, validation, `/me`, Login, Register, logout, and 401 handling.

## Viva quick guide

### Practical 1

1. **What is React?** A JavaScript library for building component-based user interfaces.
2. **What is Vite?** A fast development server and build tool.
3. **What is JSX?** JavaScript syntax that describes UI elements.
4. **What is a component?** A reusable piece of UI and logic.
5. **What is a functional component?** A JavaScript function that returns JSX.
6. **What are props?** Read-only values passed from a parent to a child.
7. **Why use `map()` in Skills?** It renders each skill from data without duplicated JSX.
8. **Why separate components?** Each component has one clear responsibility.
9. **What makes a component reusable?** It accepts changing data through props.
10. **What does `App` do?** It composes the application UI and routes.

### Practical 2

1. **What is state?** Data owned by a component that can trigger a re-render.
2. **State versus props?** State is managed locally; props are passed by a parent.
3. **What is `useState`?** A Hook for reading and updating component state.
4. **What is `BrowserRouter`?** It enables client-side URL routing.
5. **What is a route?** A URL pattern connected to a React element.
6. **Why use `Link`?** It changes views without a full page reload.
7. **What is an SPA?** A single-page application that updates views in the browser.
8. **What is a controlled input?** Its displayed value comes from React state.
9. **Why use a second state value?** The theme toggle demonstrates independent UI state.
10. **Why have a wildcard route?** It gives unknown URLs a useful 404 page.

### Practical 3

1. **What is a REST API?** An HTTP interface organized around resources and methods.
2. **What does `fetch` do?** It makes HTTP requests from the browser.
3. **What is a Promise?** An object representing a future result.
4. **Why use `async/await`?** It makes asynchronous code easier to read.
5. **What does `useEffect` do?** It runs side effects such as API requests.
6. **Why an empty dependency array?** The initial repository request runs once per mount.
7. **Why loading state?** It communicates that data has not arrived yet.
8. **Why error state?** It gives failed requests a visible recovery path.
9. **Why not fetch in the component body?** Rendering would trigger repeated requests.
10. **How does search work?** It filters the loaded repository array by name.

### Practical 4

1. **What is Node.js?** A runtime for JavaScript outside the browser.
2. **What is Express?** A lightweight framework for HTTP servers and middleware.
3. **What are REST methods?** GET reads, POST creates, PUT updates, and DELETE removes.
4. **What is middleware?** A function that runs during the request-response lifecycle.
5. **What does `next()` do?** It passes control to the next middleware.
6. **Why log requests?** It helps observe method, URL, and timing during development.
7. **Why status 201 for POST?** It indicates a resource was created.
8. **What is a custom 404?** A response for an undefined endpoint.
9. **Why structured errors?** Clients can reliably display a message.
10. **Why is error middleware last?** Express reaches it after route/middleware errors call `next(error)`.

### Practical 5

1. **What is MongoDB?** A document-oriented NoSQL database.
2. **What is a document?** A JSON-like record stored in a collection.
3. **What is Mongoose?** An ODM that maps JavaScript models to MongoDB.
4. **What is a schema?** Rules describing document fields and types.
5. **What is a model?** The API used to query a collection.
6. **What does `required` do?** It rejects missing values.
7. **What does `default` do?** It supplies a value when one is omitted.
8. **What does `enum` do?** It restricts a field to allowed values.
9. **What is persistence?** Data remains after the server restarts.
10. **Why trim a title?** It prevents meaningless surrounding whitespace.

### Practical 6

1. **What is CORS?** A browser security policy controlled by server response headers.
2. **Why does the backend need CORS?** Frontend and backend use different local ports.
3. **What is CRUD?** Create, Read, Update, and Delete.
4. **Why centralize API calls?** URLs, headers, tokens, and errors stay consistent.
5. **What is synchronization?** Updating UI state after the server confirms a change.
6. **Why use backend responses?** The database is the source of truth.
7. **Why show loading?** It prevents the user from guessing whether a request started.
8. **Why show errors?** Network and validation failures need actionable feedback.
9. **Why confirm delete?** It reduces accidental destructive actions.
10. **How is persistence demonstrated?** Refreshing reloads tasks from MongoDB.

### Practical 7

1. **Authentication versus authorization?** Authentication identifies a user; authorization checks access.
2. **Why hash passwords?** A hash avoids storing the original password.
3. **What is bcrypt's salt?** Random data that makes equal passwords produce different hashes.
4. **What is a JWT?** A signed token carrying claims about a user.
5. **What is a Bearer token?** A token sent in the Authorization header.
6. **What does `req.user` contain?** Verified decoded JWT information.
7. **Why expire JWTs?** Short lifetimes limit damage if a token leaks.
8. **What is validation middleware?** It rejects malformed input before database work.
9. **401 versus 403?** 401 means unauthenticated; 403 means authenticated but forbidden.
10. **Why use `.env`?** Secrets stay outside source code and can differ by environment.
