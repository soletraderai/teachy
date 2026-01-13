#!/bin/bash
# ===========================================
# Teachy Server Setup Script
# Run on a fresh DigitalOcean Ubuntu Droplet
# ===========================================

set -e

echo "========================================="
echo "Teachy Server Setup Script"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./setup-server.sh)"
  exit 1
fi

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  ufw \
  fail2ban \
  jq \
  unattended-upgrades \
  htop \
  ncdu

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
else
  echo "Docker already installed"
fi

# Enable Docker service
systemctl enable docker
systemctl start docker

# Install Docker Compose (standalone)
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r '.tag_name')
  curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
else
  echo "Docker Compose already installed"
fi

# Create deploy user
echo "Creating deploy user..."
if ! id "deploy" &>/dev/null; then
  useradd -m -s /bin/bash deploy
  usermod -aG docker deploy
  echo "deploy user created"
else
  echo "deploy user already exists"
fi

# Create deployment directory
echo "Creating deployment directory..."
DEPLOY_PATH="/home/deploy/teachy"
mkdir -p $DEPLOY_PATH
chown deploy:deploy $DEPLOY_PATH

# Setup SSH directory for deploy user
echo "Setting up SSH for deploy user..."
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Configure firewall
echo "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Configure fail2ban with custom jail
echo "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
EOF
systemctl enable fail2ban
systemctl restart fail2ban

# Configure automatic security updates
echo "Configuring automatic security updates..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

# Create swap file (2GB) for memory management
echo "Creating swap file..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # Optimize swap settings
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
  sysctl -p
  echo "Swap file created"
else
  echo "Swap file already exists"
fi

# Harden SSH configuration
echo "Hardening SSH..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Install DigitalOcean monitoring agent
echo "Installing DigitalOcean monitoring agent..."
curl -sSL https://repos.insights.digitalocean.com/install.sh | bash

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p $DEPLOY_PATH/certbot/conf
mkdir -p $DEPLOY_PATH/certbot/www
chown -R deploy:deploy $DEPLOY_PATH

# Print instructions
echo ""
echo "========================================="
echo "Server setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Add your GitHub Actions deploy key to:"
echo "   /home/deploy/.ssh/authorized_keys"
echo ""
echo "2. Clone your repository:"
echo "   sudo -u deploy git clone https://github.com/YOUR_REPO.git $DEPLOY_PATH"
echo ""
echo "3. Create .env file:"
echo "   sudo -u deploy cp $DEPLOY_PATH/.env.production.example $DEPLOY_PATH/.env"
echo "   sudo -u deploy nano $DEPLOY_PATH/.env"
echo ""
echo "4. Run initial deployment:"
echo "   cd $DEPLOY_PATH"
echo "   sudo -u deploy docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "5. Setup SSL (after DNS is configured):"
echo "   sudo -u deploy ./scripts/setup-ssl.sh your-domain.com admin@your-domain.com"
echo ""
echo "========================================="
