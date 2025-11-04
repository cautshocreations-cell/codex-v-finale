#!/bin/bash

# This script is used to run database migrations for the Codex Role-Playing Server.

# Navigate to the server directory
cd src/server/db

# Run the SQL schema to set up the database
mysql -u <username> -p <database_name> < schema.sql

# Seed the database with initial data
mysql -u <username> -p <database_name> < seed.sql

echo "Database migration and seeding completed successfully."