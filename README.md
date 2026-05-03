# school-payments-service

School payments service

# Feature Plan

- [ ] View trips (seed pre-exsiting for the scope of this exercise)
- [ ] Allow primary guardian to take payments for registering dependant to trip
    - [ ] Single payment can be made for multiple dependants going on multiple trips
    - [ ] Save primary guardian and dependants
    - [ ] Save payment
    - [ ] Save trip registration
    - [ ] When primary guardian returns, list their existing dependants (for production, this would REQUIRE auth)
- [ ] Add Auth
    - [ ] Email temporary login code and jwt
- [ ] Add server side kart session storage

# Local development

### Requirements

- Ability to run Makefile
- docker and docker-compose

**frontend**

- nodejs
- npm

**backend**

- python
- uv

**db migrations**

- Atlas CLI https://atlasgo.io/getting-started


### Dev servers for convenient development with hot reloading

**Start/stop DB**
```
make docker-db-up
```
```
make docker-db-down
```
```
make docker-db-destroy
```

**run db migrations**
```
make atlas-migrate-apply
```

**Start frontend dev server**
```
make dev-frontend
```

**Start backend dev server**
```
make dev-backend
```

### Start/stop entire stack with docker-compose for testing more production like builds running locally containerized
```
docker-compose up --build
```
```
docker-compose down
```

# Python API

## Relational schema

```mermaid
flowchart LR
    %% === Tables ===
    users["Users"]
    trips["Trips"]
    payments["Payments"]
    
    %% === Relations ===
    users <-->|user can attend many trips, trip can be attended by many users| trips
    users -->|user can make many payments| payments
    payments -->|paymet can be for multiple trips and users at the same time| trips
    users -->|user can be primary guardian of many users| users
```
