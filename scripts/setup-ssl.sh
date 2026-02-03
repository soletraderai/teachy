#!/bin/bash
# ===========================================
# QuizTube SSL Setup Script
# Obtains and configures Let's Encrypt SSL certificate
# ===========================================

set -e

# Check arguments
DOMAIN=${1:-""}
EMAIL=${2:-""}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: ./setup-ssl.sh <domain> <email>"
  echo "Example: ./setup-ssl.sh quiztube.app admin@quiztube.app"
  exit 1
fi

echo "========================================="
echo "Setting up SSL for: $DOMAIN"
echo "Email: $EMAIL"
echo "========================================="

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Create certbot directories
echo "Creating certbot directories..."
mkdir -p certbot/conf certbot/www

# Stop any running services that might use port 80
echo "Stopping services to free port 80..."
docker compose -f docker-compose.prod.yml down nginx 2>/dev/null || true

# Obtain SSL certificate using standalone mode
echo "Obtaining SSL certificate..."
docker run -it --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# Verify certificate was obtained
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "ERROR: Certificate was not obtained. Check your DNS settings."
  exit 1
fi

echo "SSL certificate obtained successfully!"

# Update nginx configuration with SSL
echo ""
echo "========================================="
echo "SSL Certificate obtained!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Update nginx/conf.d/default.conf:"
echo "   - Replace YOUR_DOMAIN.com with: $DOMAIN"
echo "   - Uncomment the HTTPS server block"
echo "   - Comment out or remove the HTTP location / block"
echo ""
echo "2. Restart services:"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "3. Verify HTTPS works:"
echo "   curl -I https://$DOMAIN"
echo ""
echo "4. Enable HSTS (after confirming SSL works):"
echo "   Uncomment the HSTS header in nginx config"
echo ""
echo "========================================="
echo ""
echo "Certificate files location:"
echo "  Certificate: certbot/conf/live/$DOMAIN/fullchain.pem"
echo "  Private Key: certbot/conf/live/$DOMAIN/privkey.pem"
echo ""
echo "Certificates will auto-renew via the certbot container."
