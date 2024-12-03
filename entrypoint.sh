#!/bin/sh
echo "Waiting for database to be ready..."

# Loop until pg_isready confirms the database is ready
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Database is not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "Running migrations..."
npx sequelize-cli db:migrate

echo "Starting the application..."
exec "$@"
