#!/bin/bash

# Cloudflare Pages deployment script for Electerm Web Demo

set -e

echo "🚀 Starting Cloudflare Pages deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the project
echo "📦 Building project..."
npm run b

# Deploy to Cloudflare Pages
echo "📄 Deploying to Cloudflare Pages..."
wrangler pages deploy public --project-name electerm-web-demo

echo "✅ Deployment completed!"
echo "🌐 Your site should be available shortly at your Cloudflare Pages domain."
