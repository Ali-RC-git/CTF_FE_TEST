#!/bin/bash

# Docker management scripts for CTF UI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build the application
build() {
    print_status "Building CTF UI application..."
    check_docker
    
    # Build production image
    docker build -t ctf-ui:latest .
    print_success "Production image built successfully!"
    
    # Build development image
    docker build -f Dockerfile.dev -t ctf-ui:dev .
    print_success "Development image built successfully!"
}

# Function to run development environment
dev() {
    print_status "Starting development environment..."
    check_docker
    
    docker-compose -f docker-compose.dev.yml up --build
}

# Function to run production environment
prod() {
    print_status "Starting production environment..."
    check_docker
    
    docker-compose up --build -d
    print_success "Production environment started!"
    print_status "Application is available at: http://localhost:3000"
}

# Function to stop all containers
stop() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All containers stopped!"
}

# Function to clean up Docker resources
clean() {
    print_status "Cleaning up Docker resources..."
    
    # Stop containers
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Remove images
    docker rmi ctf-ui:latest 2>/dev/null || true
    docker rmi ctf-ui:dev 2>/dev/null || true
    
    # Remove unused containers and networks
    docker system prune -f
    
    print_success "Cleanup completed!"
}

# Function to show logs
logs() {
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Function to show container status
status() {
    print_status "Container status:"
    docker-compose ps
}

# Function to show help
help() {
    echo "CTF UI Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build Docker images (production and development)"
    echo "  dev       Start development environment with hot reload"
    echo "  prod      Start production environment"
    echo "  stop      Stop all containers"
    echo "  clean     Clean up Docker resources (images, containers, networks)"
    echo "  logs      Show container logs (use 'dev' for development logs)"
    echo "  status    Show container status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 dev"
    echo "  $0 prod"
    echo "  $0 logs dev"
    echo "  $0 clean"
}

# Main script logic
case "${1:-help}" in
    build)
        build
        ;;
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac


