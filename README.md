# school-payments-service

School payments service

# Local development

### Dev servers for convenient development with hot reloading

**Start/stop DB**
```
docker-compose up db
```
```
docker-compose down
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
