-- PostgreSQL initialization script for JobPilot
-- Enables required extensions for vectors and UUIDs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
