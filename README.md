# Food Delivery Platform

A REST-only microservices monorepo for a food delivery platform inspired by Uber Eats.

## Services

- `api-gateway`: Single entry point for clients.
- `users-service`: Customer and rider profile data.
- `restaurants-service`: Restaurant catalog and order acceptance.
- `menu-service`: Menu items and pricing validation.
- `orders-service`: Order orchestration across downstream services.
- `drivers-service`: Driver availability and assignment.
- `payments-service`: Payment authorization and capture simulation.
- `ratings-service`: Customer ratings for restaurants and drivers.
- `notifications-service`: Delivery of customer, restaurant, and driver notifications.

## Order Flow

The `orders-service` orchestrates the full checkout over REST calls only:

1. Validate the customer in `users-service`.
2. Price and validate items in `menu-service`.
3. Ask `restaurants-service` to accept the order.
4. Authorize payment in `payments-service`.
5. Assign a driver in `drivers-service`.
6. Fan out status updates through `notifications-service`.

## Structure

```text
food-delivery-platform/
├── packages/
│   └── shared/
├── services/
│   ├── api-gateway/
│   ├── users-service/
│   ├── restaurants-service/
│   ├── menu-service/
│   ├── orders-service/
│   ├── drivers-service/
│   ├── payments-service/
│   ├── ratings-service/
│   └── notifications-service/
├── docker-compose.yml
└── ARCHITECTURE.md
```

## Run With Docker

```bash
docker compose up --build
```

Gateway:

- `http://localhost:8080/health`
- `http://localhost:8080/api/orders`

## Example Order Request

```bash
curl -X POST http://localhost:8080/api/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"user-1\",\"restaurantId\":\"rest-1\",\"items\":[{\"itemId\":\"item-1\",\"quantity\":2},{\"itemId\":\"item-2\",\"quantity\":1}],\"paymentMethod\":\"card\"}"
```

## Notes

- Data is stored in memory for architecture demos and classroom use.
- Services communicate with each other through HTTP REST endpoints only.
- The shared package contains lightweight server and HTTP client helpers reused across the monorepo.
