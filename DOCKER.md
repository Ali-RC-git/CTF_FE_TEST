# 🐳 Docker Containerization Guide

This guide explains how to containerize and deploy the CTF UI application using Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git (for cloning the repository)

## 🏗️ Project Structure

```
CTF_UI/
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
├── nginx.conf              # Nginx reverse proxy config
├── docker-scripts.sh       # Linux/Mac management scripts
├── docker-scripts.ps1      # Windows PowerShell scripts
└── .dockerignore           # Docker build context exclusions
```

## 🚀 Quick Start

### Development Environment

1. **Start development server with hot reload:**
   ```bash
   # Linux/Mac
   ./docker-scripts.sh dev
   
   # Windows PowerShell
   .\docker-scripts.ps1 dev
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Health check: http://localhost:3000/api/health

### Production Environment

1. **Build and start production environment:**
   ```bash
   # Linux/Mac
   ./docker-scripts.sh prod
   
   # Windows PowerShell
   .\docker-scripts.ps1 prod
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - With Nginx (optional): http://localhost:80

## 🛠️ Available Commands

### Using Scripts (Recommended)

| Command | Description |
|---------|-------------|
| `build` | Build Docker images (production and development) |
| `dev` | Start development environment with hot reload |
| `prod` | Start production environment |
| `stop` | Stop all containers |
| `clean` | Clean up Docker resources |
| `logs` | Show container logs |
| `status` | Show container status |
| `help` | Show help message |

### Using Docker Compose Directly

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build -d

# Stop all services
docker-compose down
docker-compose -f docker-compose.dev.yml down
```

### Using Docker Commands Directly

```bash
# Build production image
docker build -t ctf-ui:latest .

# Build development image
docker build -f Dockerfile.dev -t ctf-ui:dev .

# Run production container
docker run -p 3000:3000 ctf-ui:latest

# Run development container
docker run -p 3000:3000 -v $(pwd):/app ctf-ui:dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Backend API (if applicable)
NEXT_PUBLIC_API_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000

# Database (if applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/ctf_db

# Authentication (if applicable)
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Docker Compose Profiles

The production setup includes optional profiles:

```bash
# Start with Nginx reverse proxy
docker-compose --profile production up -d

# Start without Nginx
docker-compose up -d
```

## 🏭 Production Deployment

### 1. Build and Push Images

```bash
# Build production image
docker build -t your-registry/ctf-ui:latest .

# Push to registry
docker push your-registry/ctf-ui:latest
```

### 2. Deploy with Docker Compose

```bash
# Update image reference in docker-compose.yml
# Then deploy
docker-compose up -d
```

### 3. Deploy to Cloud Platforms

#### AWS ECS
- Use the Dockerfile to build and push to ECR
- Create ECS task definition
- Deploy as ECS service

#### Google Cloud Run
```bash
# Build and push to Google Container Registry
docker build -t gcr.io/PROJECT_ID/ctf-ui .
docker push gcr.io/PROJECT_ID/ctf-ui

# Deploy to Cloud Run
gcloud run deploy ctf-ui --image gcr.io/PROJECT_ID/ctf-ui --platform managed
```

#### Azure Container Instances
```bash
# Build and push to Azure Container Registry
az acr build --registry myregistry --image ctf-ui:latest .

# Deploy to Container Instances
az container create --resource-group myResourceGroup --name ctf-ui --image myregistry.azurecr.io/ctf-ui:latest --ports 3000
```

## 🔍 Monitoring and Debugging

### Health Checks

The application includes health check endpoints:

- **Application Health**: `GET /api/health`
- **Docker Health Check**: Built into the container

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ctf-ui

# Development logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Container Status

```bash
# Using scripts
./docker-scripts.sh status

# Using docker-compose
docker-compose ps
```

### Debugging

```bash
# Access running container
docker exec -it ctf-ui-container-name sh

# View container details
docker inspect ctf-ui-container-name

# Monitor resource usage
docker stats
```

## 🔒 Security Considerations

### Production Security

1. **Use non-root user** (already configured in Dockerfile)
2. **Keep images updated** with security patches
3. **Use secrets management** for sensitive data
4. **Enable HTTPS** with proper SSL certificates
5. **Configure firewall rules** appropriately

### Security Headers

The Nginx configuration includes security headers:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

## 📊 Performance Optimization

### Image Optimization

- **Multi-stage builds** reduce final image size
- **Alpine Linux** base image for smaller footprint
- **Standalone output** for Next.js optimization
- **Layer caching** for faster builds

### Runtime Optimization

- **Gzip compression** enabled in Nginx
- **Static file caching** configured
- **Rate limiting** for API endpoints
- **Health checks** for container monitoring

## 🧹 Maintenance

### Regular Maintenance

```bash
# Clean up unused resources
./docker-scripts.sh clean

# Update base images
docker pull node:18-alpine

# Rebuild with latest dependencies
docker-compose build --no-cache
```

### Backup and Recovery

```bash
# Backup volumes (if any)
docker run --rm -v ctf-data:/data -v $(pwd):/backup alpine tar czf /backup/ctf-data-backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v ctf-data:/data -v $(pwd):/backup alpine tar xzf /backup/ctf-data-backup.tar.gz -C /data
```

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3000
   netstat -tulpn | grep :3000
   
   # Kill the process or change port
   docker-compose up -p 3001:3000
   ```

2. **Permission denied errors**
   ```bash
   # Fix script permissions (Linux/Mac)
   chmod +x docker-scripts.sh
   ```

3. **Build failures**
   ```bash
   # Clean build cache
   docker builder prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs ctf-ui
   
   # Check container status
   docker-compose ps
   ```

### Getting Help

- Check container logs: `docker-compose logs -f`
- Verify environment variables: `docker-compose config`
- Test health endpoint: `curl http://localhost:3000/api/health`
- Check Docker daemon: `docker info`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

---

**Happy Containerizing! 🐳✨**


