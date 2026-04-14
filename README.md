# Security Microservice (security-ms)

## Overview
The Security Microservice acts as the central Identity Provider and Authorization engine for a multi-tenant SaaS platform. Built on Domain-Driven Design (DDD), this service encapsulates all logic related to user authentication, organization (tenant) membership, and Role-Based Access Control (RBAC).

This microservice ensures secure access across the distributed architecture by issuing JSON Web Tokens (JWTs) that encode user identity, organization context, and permission boundaries.

## Responsibilities
- **Authentication:** Handles user registration, secure credential validation, and JWT-based session provisioning (Sign-up, Sign-in).
- **Multi-Tenant Identity Management:** Manages the relationships between users and organizations, including invitation token workflows, joining or leaving organizations, and context-switching between different tenant organizations.
- **Role-Based Access Control (RBAC):** Provisions roles and permissions, validating that authenticated users hold the required privileges to perform operations within their selected organization.
- **Enterprise Patterns:** Features custom database query builders and transaction managers tailored for robust relational data consistency.

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Hono (highly optimized for edge and serverless environments)
- **Validation & Documentation:** Zod + OpenAPI (Auto-generated Swagger documentation)
- **Database:** MySQL (interfaced via a custom `QueryBuilder` and `TransactionManager`)
- **Security:** JWT (JSON Web Tokens) for stateless authentication.

## Architecture
The service strictly adheres to Domain-Driven Design (DDD) through an Onion Architecture:
- **Domain Layer (`src/domain/`)**: The core schema, including User and Role entities, Pagination logic, and repository interfaces. Completely decoupled from external libraries.
- **Application Layer (`src/application/`)**: Application services mapping DTOs to Domain Entities, coordinating complex workflows like issuing invitations or mutating roles.
- **Infrastructure Layer (`src/infrastructure/`)**: Concrete implementations of repositories interfacing with MySQL via custom transaction-safe query execution.
- **Presentation Layer (`src/presentation/`)**: Hono-based HTTP routing, Zod payload validation, request interception, and OpenAPI documentation endpoints.

## Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (package manager used across the monorepo)
- A running instance of MySQL

### Installation
1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables in an `.env` file at the root of `security-ms`:
```env
PORT=3001
API_BASE_URL=/api
DOCS_URL=/public/api-docs
OPENAPI_URL=/public/openapi.json
DB_MYSQL_HOST=localhost
DB_MYSQL_PORT=3306
DB_MYSQL_USER=your_db_user
DB_MYSQL_PASSWORD=your_db_password
DB_MYSQL_DATABASE=security_db
JWT_SECRET=your-secret-signature-key
```

### Running the Application
Start the development server:
```bash
pnpm run dev
```

By default, the server will start on port 3001. You can view the OpenAPI documentation and test endpoints at:
```
http://localhost:3001/public/api-docs
```

## Production Details
This application ships with an optimized `Dockerfile` tailored for fast startup times and minimal resource footprint, making it ideal for deployments to containerized platforms such as AWS ECS, EKS, Kubernetes clusters, or serverless container environments.
