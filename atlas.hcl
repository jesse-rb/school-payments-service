env "local" {
  url = "postgres://postgres:postgres@localhost:5432/appdb?sslmode=disable"
  dev = "postgres://postgres:postgres@localhost:5432/appdb_dev?sslmode=disable"
  migration {
      dir = "file://migrations"
  }
}
