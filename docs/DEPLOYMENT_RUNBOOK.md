# WeatherPulse India — DevOps & Deployment Runbook
**From Zero to Live Production / Demo URL in Under 5 Minutes**

---

## 1. Quick Start: Local Full-Stack Run (1-Command)

### Prerequisites
* Docker Engine 24+ & Docker Compose v2+
* Git
* (Optional) Node.js 20+ / Python 3.11 for local development outside containers

### Step-by-Step Local Launch

```bash
# 1. Clone repository
git clone https://github.com/radhikaraikar/WeatherPulse.git
cd WeatherPulse

# 2. Copy development environment configuration
cp .env.local .env

# 3. Build & Launch all services in background with health checking
docker compose up -d --build

# 4. Check service status
docker compose ps
```

### Access Points
* **Mission Control Web App**: `http://localhost:80` (or `http://localhost:3000`)
* **Spring Boot REST API**: `http://localhost:8080/api/reports`
* **Python ML Microservice**: `http://localhost:5000/health`
* **Node.js WebSocket Server**: `ws://localhost:4000/ws`
* **PostgreSQL + PostGIS**: `localhost:5432` (User: `postgres`, DB: `weatherpulse_db`)
* **Redis**: `localhost:6379`
* **Apache Kafka Broker**: `localhost:9092`

---

## 2. Cloud Demo Deployment (AWS EC2 or GCP Compute Engine Free Tier)

This is the fastest, lowest-cost method for hackathon judges, client demos, and evaluation environments.

### Step 1: Provision a Free-Tier / Budget VM
* **AWS**: Launch an `EC2 t3.small` (or `t3.medium`) instance running Ubuntu 22.04 LTS (ap-south-1 Mumbai).
* **GCP**: Launch a `Compute Engine e2-medium` (2 vCPU, 4GB RAM) in `asia-south1`.
* **Security Group / Firewall Rules**:
  - `Port 80 (HTTP)`: Open to `0.0.0.0/0`
  - `Port 443 (HTTPS)`: Open to `0.0.0.0/0`
  - `Port 22 (SSH)`: Open to your IP address

### Step 2: Server Setup & Startup

SSH into your remote instance:
```bash
ssh -i your-key.pem ubuntu@<INSTANCE_PUBLIC_IP>
```

Run the automated one-line setup:
```bash
# Install Docker and Docker Compose plugin
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git curl
sudo usermod -aG docker $USER
newgrp docker

# Clone repository into deployment directory
sudo mkdir -p /opt/weatherpulse && sudo chown -R $USER:$USER /opt/weatherpulse
cd /opt/weatherpulse
git clone https://github.com/radhikaraikar/WeatherPulse.git .

# Configure Environment
cp .env.local .env
# Edit any live API keys if available:
# nano .env

# Launch entire containerized stack
docker compose up -d --build
```

### Step 3: Configure Free SSL / Domain (Optional via Caddy/Certbot)
```bash
# Install Caddy for automatic Zero-Config Let's Encrypt SSL
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Reverse proxy to Docker port 80
sudo caddy reverse-proxy --from demo.weatherpulse.in --to :80
```

---

## 3. Production Architecture (Scalable Cloud Setup)

For enterprise-grade high availability and automated auto-scaling:

```
+------------------------------------------------------------------------------------+
|                                PRODUCTION TOPOLOGY                                 |
+------------------------------------------------------------------------------------+
| Frontend:   Vercel / Cloudflare Pages (Edge CDN, Global Anycast)                   |
| Gateway:    AWS ALB (Application Load Balancer) / GCP HTTPS Cloud Load Balancing   |
| Backends:   AWS ECS Fargate / GCP Cloud Run (Containerized Microservices)          |
| Database:   Amazon RDS PostgreSQL 16 with PostGIS extension (Multi-AZ)             |
| Cache:      Amazon ElastiCache Redis / Upstash Serverless Redis                     |
| Streaming:  Confluent Cloud Kafka / Redpanda Cloud (Serverless 3-Broker Topic)     |
| Storage:    Amazon S3 / Cloudflare R2 Bucket (Citizen Photos & Doppler GeoTIFFs)   |
+------------------------------------------------------------------------------------+
```

### Citizen Media Upload S3 Bucket Policy
Create an S3 bucket `weatherpulse-citizen-uploads` with public read access restricted to CDN:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDirectUploadPresignedPost",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::ACCOUNT_ID:role/weatherpulse-backend-role" },
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::weatherpulse-citizen-uploads/*"
    }
  ]
}
```

---

## 4. CI/CD & Secret Injection Guide

### Required GitHub Actions Secrets
Navigate to `Repository Settings` -> `Secrets and variables` -> `Actions`:

```
+-----------------------------+------------------------------------------------------+
| Secret Key Name             | Description                                          |
+-----------------------------+------------------------------------------------------+
| VERCEL_TOKEN                | Vercel Deployment Personal Access Token              |
| VERCEL_ORG_ID               | Vercel Organization ID                               |
| VERCEL_PROJECT_ID           | Vercel Project ID                                    |
| DEMO_SERVER_HOST            | Public IP / Hostname of EC2 / GCP Instance           |
| DEMO_SERVER_USER            | SSH User (e.g. 'ubuntu')                             |
| DEMO_SERVER_SSH_KEY         | Private SSH Key for automatic git pull & container up|
| PROD_DB_SECRET_PASSWORD     | Production PostgreSQL root password                  |
| PROD_DATA_GOV_IN_API_KEY    | Official India Government OGD API Key                |
+-----------------------------+------------------------------------------------------+
```

---

## 5. Service Health Checks & Diagnostic Commands

### Health Check Endpoints
* Frontend: `GET /health` -> `200 OK`
* Spring Boot: `GET /actuator/health` -> `{"status":"UP"}`
* ML Flask Service: `GET /health` -> `{"status":"healthy","indicbert":"loaded"}`
* Node.js Realtime: `GET /health` -> `{"status":"connected","subscribers":4}`

### Useful CLI Commands for Ops & Triage

```bash
# View aggregated real-time streaming logs
docker compose logs -f

# Inspect specific microservice logs
docker compose logs -f ml-service
docker compose logs -f report-service

# Check Kafka topic message throughput
docker exec -it weatherpulse-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic weather.events.raw \
  --from-beginning

# Execute PostGIS spatial query inside database container
docker exec -it weatherpulse-postgres psql -U postgres -d weatherpulse_db -c \
  "SELECT id, location_name, ST_AsText(geom), trust_score FROM reports LIMIT 5;"

# Restart a specific service without affecting others
docker compose restart realtime-service
```
