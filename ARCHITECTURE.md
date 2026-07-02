# Architecture


## High-Level Design

This platform follows a synchronous REST microservice architecture. The API gateway fronts all public traffic and forwards it to domain services. The `orders-service` acts as the orchestrator for the critical checkout workflow.

## Services and Responsibilities

### Core domain services

- `users-service`: Stores customer profiles and delivery preferences.
- `restaurants-service`: Stores restaurant metadata and accepts or rejects incoming orders.
- `menu-service`: Owns menu items, pricing, and order quoting.
- `orders-service`: Builds the order aggregate and tracks status progression.
- `drivers-service`: Tracks driver location, availability, and assignment.
- `payments-service`: Owns payment transactions and authorization outcome.
- `ratings-service`: Persists restaurant and driver feedback after delivery.
- `notifications-service`: Delivers transactional updates to each participant.

### Edge service

- `api-gateway`: Public ingress, route-based proxying, and lightweight health visibility.

## Request Flow

```text
Client
  |
  v
API Gateway
  |
  v
Orders Service
  |
  +--> Users Service
  +--> Menu Service
  +--> Restaurants Service
  +--> Payments Service
  +--> Drivers Service
  +--> Notifications Service
```

## Why REST Only

- Keeps communication explicit and easy to trace.
- Matches the project requirement of no event bus or async broker.
- Makes service boundaries visible for API design and orchestration discussions.

## Future Extensions

- Persist data per service with isolated databases.
- Add authentication and service-to-service authorization.
- Introduce retries, circuit breakers, and idempotency keys.
- Split notifications into channel-specific providers such as SMS, push, and email.
