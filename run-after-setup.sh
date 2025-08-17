#!/bin/bash

echo "🚀 Setting up IMAN Network database and authentication..."

echo "📊 Pushing database schema to Neon..."
npm run db:push

echo "👤 Creating admin user..."
npm run admin:create

echo "🔄 Switching to production auth components..."
# We'll run these commands after you confirm the setup

echo "✅ Setup complete! Ready to test authentication."