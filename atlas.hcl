env "local" {
  src = "file://schema.sql"
  url = "postgres://postgres:postgres@localhost:5432/appdb?sslmode=disable"
  dev = "postgres://postgres:postgres@localhost:5432/appdb_dev?sslmode=disable"
  migration {
      dir = "file://migrations"
  }
}
