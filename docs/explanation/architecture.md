# System Architecture Overview

This document explains the architectural design decisions behind the PayTo POS system and why they were chosen.

## Tech Stack Rationale

### Why Laravel 12?

Laravel 12 was selected as the backend foundation because it provides an excellent balance of developer productivity and performance. Its robust ecosystem includes built-in authentication, Eloquent ORM for database operations, and a powerful routing system. For a POS system that needs to handle concurrent transactions reliably, Laravel's database transaction support and queue system are essential. The framework's maturity means battle-tested solutions for common problems like concurrency, data validation, and error handling are available out of the box.

### Why React 19 with Inertia v2?

The frontend uses React 19 because it offers the most modern JavaScript patterns and the best developer experience for building interactive interfaces. Inertia v2 was chosen specifically because it allows us to build a Single Page Application (SPA) without the complexity of managing a separate API backend. We get the benefits of client-side routing and state management while keeping our application logic in Laravel controllers. This architecture dramatically reduces development time and maintains type safety across the entire stack.

### Why Tailwind CSS v4?

Tailwind CSS v4 provides utility-first styling that enables rapid UI development while maintaining consistency across the application. The utility classes make it easy to create responsive designs that work across different screen sizes—from desktop registers to mobile devices. Tailwind's configuration system allows us to maintain a consistent design language through our theme colors, spacing scale, and typography system.

## Application Architecture Layers

### Frontend Layer (React + Inertia)

The frontend is a client-side rendered SPA that communicates with the Laravel backend through Inertia's page protocol. Unlike traditional APIs that return JSON, Inertia returns fully rendered pages that are mounted on the client side. This approach keeps our code DRY—our Laravel controllers handle both data retrieval and page rendering. The React components live in `resources/js/Pages` and are organized by feature (POS interface for cashiers, admin dashboard for managers).

The frontend maintains local state for UI interactions (open modals, form inputs) while Inertia props handle server-side data. This separation of concerns keeps components focused and testable.

### Backend Layer (Laravel)

The backend is structured using the classic MVC pattern with some modern Laravel 12 conventions. Controllers handle HTTP requests, form request validation ensures data integrity, and services encapsulate business logic. The `CheckoutProcessor` service is a prime example—by extracting checkout logic into a dedicated service, we can reuse it across different contexts (online checkout, offline batch sync, refunds) without duplicating code.

Database operations use Eloquent ORM exclusively. This provides several advantages: relationship methods make querying related data intuitive and prevent N+1 query problems, casts ensure data types are consistent, and query builders allow for complex queries while maintaining readability.

### Data Layer (Database)

The database schema is designed around the core POS workflows: products, sales, refunds, and inventory management. Each entity has a corresponding Eloquent model with relationship methods that define how entities interact. For example, a `Sale` has many `SaleItem` records, and each `SaleItem` belongs to a `Product`.

The schema includes both "snapshot" data (like `product_name_snapshot` on sale items) and "current" data (like product stock). This design choice ensures that historical records remain accurate even when product details change. If a product's name or price changes after a sale, the historical record maintains the original values.

## Request/Response Flow

When a cashier completes a checkout:

1. The React `PosCheckoutRequest` form validates input locally using TypeScript types
2. Form submission triggers Inertia's `post` method with validation rules
3. The Laravel route maps to `PosCheckoutController@store`
4. The controller validates the request using the form request class
5. `CheckoutProcessor` begins a database transaction
6. Stock is validated and decremented for each product
7. Sale and SaleItem records are created
8. Payment record is created with the payment method
9. Database transaction commits
10. Inertia redirects to the sales history page with success message

For offline transactions, the flow diverges:

1. Transactions are stored in IndexedDB with a unique `local_txn_uuid`
2. When online, `flushCheckoutQueue` sends batches to the sync endpoint
3. The `PosSyncController` processes each transaction
4. Idempotency keys prevent duplicate processing
5. Results are returned with status (PROCESSED, DUPLICATE, FAILED)

## Authentication Strategy

PayTo implements a dual-layer authentication system:

**Level 1: Session-based Authentication**

Standard Laravel sessions store the authenticated user's ID. The session driver uses the database, which provides several benefits: session expiration is tracked in the database, sessions can be invalidated globally, and we can audit login/logout events. Sessions are configured with appropriate timeouts and secure cookie settings.

**Level 2: PIN-based POS Authentication**

For security and accountability, each POS session requires a secondary PIN authentication. This ensures that when a cashier leaves their register unattended, the session is protected. The PIN is hashed using bcrypt (separate from the password hash), and login attempts are logged.

**Work Time Tracking**

Every login is associated with a work session tracked by `work_date` and `work_seconds`. This enables hourly reporting and shift analysis. When a user logs out, the session duration is calculated and stored.

## Role-Based Access Control

Two roles exist in the system:

**CASHIER (Kasir)**

Cashiers have access to the POS interface only. They can view products, process sales, and view their own transaction history. They cannot access admin features like product management or user administration. This separation ensures that cashiers cannot manipulate the system to their advantage.

**ADMIN (Supervisor)**

Admins have full access to the management dashboard. They can manage products, process refunds, view real-time inventory, and approve refund requests. The admin role is designed for store managers or supervisors who need oversight of all operations.

Authorization is implemented using Laravel's policy system. Each resource has a corresponding policy that defines what actions the authenticated user can perform. For example, the `AdminPolicy` might allow viewing all products but restrict deletion to super-admins.

## Why This Architecture Works

The architecture prioritizes several key principles:

**Consistency**: By using Inertia, we avoid the inconsistency that often arises when managing separate frontend and backend codebases. Types flow naturally from server to client.

**Maintainability**: The separation of concerns makes the codebase easier to understand. Controllers handle HTTP concerns, services handle business logic, and models handle data access.

**Scalability**: The database-driven session system and queue-backed operations mean the system can scale horizontally. Add more application servers, and they all share the same session store.

**Reliability**: Database transactions ensure data integrity. The offline queue with idempotency keys means lost connections don't result in lost sales.

**Security**: Multiple authentication layers and role-based access control prevent unauthorized access. Password and PIN hashing use industry-standard algorithms.
