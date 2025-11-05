# Database Migrations Guide

This guide explains how to use database migrations for both local development and production environments.

## Overview

The project uses TypeORM migrations to manage database schema changes. There are separate configurations for local development and production environments to ensure proper SSL and logging settings.

## Migration Files

### Data Source Configurations

1. **`src/migrations/data-source.ts`** - Default configuration (used by application)
2. **`src/migrations/data-source.local.ts`** - Local development configuration
3. **`src/migrations/data-source.prod.ts`** - Production configuration

### Key Differences

| Setting | Local | Production |
|---------|-------|------------|
| SSL | Disabled | Enabled |
| Logging | Enabled | Disabled |
| Connection Pool | Default | Optimized for production |

## Available Commands

### Local Development

```bash
# Generate a new migration based on entity changes
npm run migration:generate:local -- --name=YourMigrationName

# Run pending migrations
npm run migration:run:local

# Revert the last migration
npm run migration:revert:local
```

### Production

```bash
# Generate a new migration based on entity changes
npm run migration:generate:prod -- --name=YourMigrationName

# Run pending migrations
npm run migration:run:prod

# Revert the last migration
npm run migration:revert:prod
```

### General (Default)

```bash
# Generate a new migration based on entity changes
npm run migration:generate -- --name=YourMigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

## Usage Examples

### Creating a New Migration

1. **Make changes to your entities** (e.g., add a new column, modify a table, etc.)

2. **Generate the migration:**
   ```bash
   # For local development
   npm run migration:generate:local -- --name=AddUserEmailColumn

   # For production
   npm run migration:generate:prod -- --name=AddUserEmailColumn
   ```

3. **Review the generated migration file** in `src/migrations/` to ensure it contains the correct changes.

4. **Run the migration:**
   ```bash
   # For local development
   npm run migration:run:local

   # For production
   npm run migration:run:prod
   ```

### Rolling Back a Migration

If you need to undo a migration:

```bash
# For local development
npm run migration:revert:local

# For production
npm run migration:revert:prod
```

## Environment Variables

Make sure your `.env` file contains the correct `DATABASE_URL` for your environment:

```env
# Local development
DATABASE_URL=postgres://username:password@localhost:5432/database_name

# Production
DATABASE_URL=postgres://username:password@production-host:5432/database_name
```

## Best Practices

1. **Always test migrations locally first** before running in production
2. **Backup your database** before running migrations in production
3. **Use descriptive migration names** that clearly indicate what changes are being made
4. **Review generated migration code** to ensure it matches your expectations
5. **Run migrations during low-traffic periods** in production
6. **Keep migration files** in version control for proper deployment tracking

## Troubleshooting

### Common Issues

1. **Migration fails with SSL error in production:**
   - Ensure your production database requires SSL connections
   - Check that the `DATABASE_URL` includes proper SSL parameters

2. **Migration generates unexpected changes:**
   - Verify that your entities match the current database schema
   - Check for any manual database changes that aren't reflected in entities

3. **Migration runs but doesn't apply changes:**
   - Check the migration logs for any errors
   - Verify database permissions for the migration user

### Checking Migration Status

To see which migrations have been applied:

```sql
SELECT * FROM migrations ORDER BY id DESC;
```

## Migration File Structure

Generated migration files follow this pattern:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailColumn1730612752000 implements MigrationInterface {
    name = 'AddUserEmailColumn1730612752000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Migration logic goes here
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback logic goes here
    }
}
```

The timestamp in the filename ensures proper ordering of migrations.
