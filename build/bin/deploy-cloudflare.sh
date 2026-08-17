#!/bin/bash

# Cloudflare Workers deployment script for Electerm Web Demo

set -e

echo "🚀 Starting Cloudflare Workers deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the project
echo "📦 Building project..."
npm run b

# Deploy to Cloudflare Workers
echo "🤖 Deploying to Cloudflare Workers..."
wrangler deploy

echo "✅ Deployment completed!"
echo "🌐 Your site should be available shortly at your Cloudflare Workers domain."
