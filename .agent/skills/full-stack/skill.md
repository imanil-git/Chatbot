# Technical Skills & Architecture Philosophy

> A senior-level overview of my full-stack engineering capabilities, design principles, and infrastructure practices.

---

## Frontend Engineering

### React.js — Component-Driven UI

My frontend work is built on **React.js** with a strict **Atomic Design methodology** — every UI element is decomposed into atoms, molecules, and organisms that are independently testable and infinitely composable. I treat the component library as a product, not an afterthought.

**Core practices:**
- **Atomic Reusable Components** — `Button`, `Input`, `Modal`, `Card` are built once, parameterised via props, and never duplicated. Variants are handled through a prop API, not copy-paste.
- **Compound Component Pattern** — complex UI surfaces (e.g. `<DataTable>`, `<Form>`) expose a parent/child API that gives consumers structural flexibility without breaking encapsulation.
- **Strict prop typing** — all components are typed with **TypeScript** interfaces. No `any`. No implicit `object`.
- **Co-located tests** — unit tests live alongside the component file (`Button.test.tsx`) using **Vitest** + **React Testing Library**.

### TanStack — Server State as a First-Class Citizen

I use **TanStack Query (React Query)** to manage all asynchronous server state. This eliminates the anti-pattern of storing remote data in global client state (Redux, Zustand) and provides caching, background refetching, and optimistic updates out of the box.

```ts
// Typed query hook — co-located with the feature, not in a global store
export const useUserProfile = (userId: string) =>
  useQuery<UserProfile, ApiError>({
    queryKey: ['users', userId],
    queryFn: () => userApi.getById(userId),
    staleTime: 5 * 60 * 1000, // 5-minute cache
    retry: 2,
  });
```

**TanStack Table** handles complex data grids with virtualised rows, server-side pagination, and sortable columns — all without a bloated third-party component library.

### Axios / Fetch — Centralised HTTP Layer

All HTTP communication is abstracted behind a single configured **Axios** instance. This enforces a clean separation between transport logic and business logic.

```ts
// src/lib/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalise errors globally
apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    if (err.response?.status === 401) authService.logout();
    return Promise.reject(normaliseError(err));
  }
);
```

### Styling — Tailwind CSS

**Tailwind CSS** is used as a design-token system, not an inline-style shortcut. I configure a custom `tailwind.config.ts` that enforces the project's design system — brand colours, type scales, spacing, and breakpoints — making the stylesheet the single source of truth for visual decisions.

---

## Backend Engineering

### Node.js + Express.js

The backend is **Node.js** with **Express.js**, architected around a strict **MVC (Model-View-Controller)** pattern. Every layer has a single, well-defined responsibility — routes delegate to controllers, controllers delegate to services, services delegate to models.

### Strict MVC Architecture

```
src/
├── controllers/        # Request handling — validates input, calls service, sends response
│   └── user.controller.ts
├── services/           # Business logic — the real application behaviour lives here
│   └── user.service.ts
├── models/             # Mongoose schemas + static query methods
│   └── User.model.ts
├── routes/             # Route declarations — thin, no logic
│   └── user.routes.ts
├── middleware/         # Custom Express middleware (auth, error, rate-limit, logging)
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
├── validators/         # Zod / Joi schemas — request shape contracts
│   └── user.validators.ts
├── config/             # Environment, DB connection, constants
│   └── db.ts
└── app.ts              # Express app bootstrap
```

Controllers are deliberately thin — they own HTTP, nothing else:

```ts
// controllers/user.controller.ts
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err); // All errors bubble to the global error middleware
  }
};
```

### Custom Middleware

I build purpose-built **Express middleware** rather than relying on generic third-party packages for core concerns. This keeps the middleware chain transparent and auditable.

**Authentication middleware** — validates the JWT, attaches `req.user`, and rejects with a typed error:

```ts
// middleware/auth.middleware.ts
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorisedError('No token provided');

  const payload = verifyJwt(token); // Throws on invalid/expired
  req.user = await userService.findById(payload.sub);
  next();
};
```

**Global error middleware** — all thrown errors resolve here. Structured error classes (`ValidationError`, `NotFoundError`, `UnauthorisedError`) map cleanly to HTTP status codes:

```ts
// middleware/error.middleware.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err.statusCode ?? 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  res.status(status).json({ success: false, error: message });
};
```

**Request validation middleware** — uses **Zod** to validate `req.body`, `req.params`, and `req.query` at the route layer before a controller is ever invoked:

```ts
export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) throw new ValidationError(result.error.flatten());
  req.body = result.data; // Replace body with the parsed, typed output
  next();
};
```

### MongoDB + Mongoose

**MongoDB** is the primary data store, accessed via **Mongoose** with fully typed schemas. I enforce schema-level validation as a second line of defence (behind Zod) and use Mongoose virtuals, pre/post hooks, and static methods to keep the model layer expressive without leaking logic into services.

---

## Architecture Patterns

### MVC vs. Feature-Based — When to Use Each

Choosing the right project structure is an architectural decision, not a preference. I make it deliberately based on project scale and team topology.

| Dimension | MVC | Feature-Based |
|---|---|---|
| **Best for** | APIs, microservices, small teams | Monorepos, product features, large teams |
| **Coupling** | Low within layers | Low within features |
| **Scalability** | Scales vertically (more endpoints) | Scales horizontally (more features/teams) |
| **Discoverability** | Find by type (`controllers/`) | Find by domain (`users/`) |
| **Code splitting** | Shared across all layers | Natural — each feature is self-contained |

**MVC** is my default for backend APIs and services. The layer-based separation maps directly to the HTTP request lifecycle and is immediately legible to any backend engineer.

**Feature-based** is my choice for frontend React applications or full-stack Next.js projects above a certain scale. Each feature folder is a vertical slice — it owns its components, hooks, API layer, types, and tests. Onboarding a new engineer to the `orders` feature does not require understanding `payments`.

```
src/features/
├── auth/
│   ├── components/    LoginForm.tsx, AuthGuard.tsx
│   ├── hooks/         useAuth.ts, useSession.ts
│   ├── api/           auth.api.ts
│   ├── types/         auth.types.ts
│   └── index.ts       # Public API — only what other features may import
├── users/
│   └── ...
└── orders/
    └── ...
```

The `index.ts` barrel acts as a **module boundary** — internal implementation details are never imported directly from outside the feature. This enforces encapsulation at the filesystem level.

---

## DevOps & Infrastructure

### Docker & Docker Compose — Environment Parity

Every project is containerised from day one using **Docker** and **Docker Compose**. The goal is zero "works on my machine" failures — the dev, staging, and production environments are defined in code and are byte-for-byte identical in their dependencies.

**Multi-stage `Dockerfile`** — keeps the production image lean by discarding dev dependencies and build artefacts:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/app.js"]
```

**`docker-compose.yml`** — orchestrates the full stack with a single command (`docker compose up`), including a seeded MongoDB instance and an Nginx reverse proxy:

```yaml
services:
  api:
    build:
      context: ./backend
      target: production
    env_file: .env
    depends_on:
      - mongo
    ports:
      - "4000:4000"

  client:
    build:
      context: ./frontend
    ports:
      - "3000:3000"

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    depends_on:
      - api
      - client

volumes:
  mongo_data:
```

**Workflow benefits:**
- A new engineer clones the repo and runs `docker compose up` — the entire stack is running in under 60 seconds.
- Environment variables are managed via `.env` files (never committed) — `docker compose` injects them at runtime.
- The `mongo_data` named volume persists database state across container restarts during development.
- Production deployments mirror the same Compose configuration, adjusted via environment-specific override files (`docker-compose.prod.yml`).

---

## Technical Philosophy

My engineering decisions are guided by three principles that I return to whenever trade-offs arise:

**Explicit over implicit.** Code should declare its intent. A typed Zod validator at the route boundary is more trustworthy than implicit assumptions about request shape deep in a service. A named custom middleware is more auditable than an anonymous function in `app.ts`. Clarity in code is a form of documentation that never goes stale.

**Boundaries enable scale.** The reason I invest in architecture — MVC layers, feature module boundaries, a centralised API client — is not bureaucracy. It is because well-defined boundaries allow a codebase to grow without requiring every engineer to hold the entire system in their head. A junior engineer should be able to add a feature to the `orders` module without touching `auth`. A new endpoint should not require modifying the error handler.

**The build pipeline is part of the product.** Dockerised environments, schema validation, typed APIs end to end — these are not optional extras. They are the foundation that makes it safe to move fast. A broken build caught locally is a bug that never reaches a user. Environment parity enforced by Docker Compose is a deployment incident that never happens.

I write code for the engineer who inherits it six months from now — because that engineer is usually me.

---

*Last updated: 2026 · Stack: React · TypeScript · TanStack · Node.js · Express · MongoDB · Docker*