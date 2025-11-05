# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (production)
- Redis (if using sessions)
- SSL certificate for HTTPS

## Environment Setup

1. Copy `.env.production` to your production server:
   ```bash
   cp .env.production .env
   ```

2. Update the following environment variables in `.env`:
   ```env
   NODE_ENV=production
   PORT=3001

   # Production database URL
   DATABASE_URL=postgresql://username:password@host:port/database

   # Strong secret key for JWT
   SECRET_KEY=your_secure_random_secret_key

   # Production blockchain configuration
   PROVIDER_URL=https://mainnet.infura.io/v3/your_project_id
   CONTRACT_ADDRESS=your_deployed_contract_address
   PRIVATE_KEY=your_production_wallet_private_key
   OWNER_ADDRESS=your_owner_wallet_address
   ```

## Database Setup

1. Run database migrations:
   ```bash
   npm run migration:run:prod
   ```

## Build and Deploy

1. Install dependencies:
   ```bash
   npm ci --only=production
   ```

2. Build the application:
   ```bash
   npm run build:prod
   ```

3. Start the application:
   ```bash
   npm run start:prod
   ```

## Using PM2 (Recommended for Production)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Create ecosystem file (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'gst-invoice-backend',
       script: 'dist/main.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

3. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Health Checks

- Health endpoint: `GET /`
- Application will log: "✅ App listening on port 3001 in production mode"

## Security Considerations

- Ensure all environment variables are set securely
- Use HTTPS in production
- Regularly rotate API keys and private keys
- Monitor logs for security issues
- Keep dependencies updated

## Monitoring

- Set up log aggregation (e.g., Winston, PM2 logs)
- Monitor database connections
- Set up alerts for application crashes
- Monitor blockchain transaction failures

## Rollback

If needed to rollback:
```bash
pm2 stop gst-invoice-backend
pm2 delete gst-invoice-backend
# Deploy previous version
pm2 start ecosystem.config.js
