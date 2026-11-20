# Room Booking API

![CI](https://github.com/AnimaMnie/room-booking-api/actions/workflows/ci.yml/badge.svg)

## Uruchomienie

```bash
git clone https://github.com/AnimaMnie/room-booking-api.git
cd room-booking-api
cp .env.example .env
docker compose up --build
```

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs

Konto ADMIN (seed):

```bash
docker compose exec api npx knex seed:run
```