# Docker management scripts for CTF UI (PowerShell version)

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Function to build the application
function Build-Application {
    Write-Status "Building CTF UI application..."
    Test-Docker
    
    # Build production image
    docker build -t ctf-ui:latest .
    Write-Success "Production image built successfully!"
    
    # Build development image
    docker build -f Dockerfile.dev -t ctf-ui:dev .
    Write-Success "Development image built successfully!"
}

# Function to run development environment
function Start-Development {
    Write-Status "Starting development environment..."
    Test-Docker
    
    docker-compose -f docker-compose.dev.yml up --build
}

# Function to run production environment
function Start-Production {
    Write-Status "Starting production environment..."
    Test-Docker
    
    docker-compose up --build -d
    Write-Success "Production environment started!"
    Write-Status "Application is available at: http://localhost:3000"
}

# Function to stop all containers
function Stop-Containers {
    Write-Status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Success "All containers stopped!"
}

# Function to clean up Docker resources
function Clean-Docker {
    Write-Status "Cleaning up Docker resources..."
    
    # Stop containers
    try { docker-compose down } catch { }
    try { docker-compose -f docker-compose.dev.yml down } catch { }
    
    # Remove images
    try { docker rmi ctf-ui:latest } catch { }
    try { docker rmi ctf-ui:dev } catch { }
    
    # Remove unused containers and networks
    docker system prune -f
    
    Write-Success "Cleanup completed!"
}

# Function to show logs
function Show-Logs {
    param([string]$Environment = "prod")
    
    if ($Environment -eq "dev") {
        docker-compose -f docker-compose.dev.yml logs -f
    } else {
        docker-compose logs -f
    }
}

# Function to show container status
function Show-Status {
    Write-Status "Container status:"
    docker-compose ps
}

# Function to show help
function Show-Help {
    Write-Host "CTF UI Docker Management Script (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-scripts.ps1 [COMMAND]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  build     Build Docker images (production and development)"
    Write-Host "  dev       Start development environment with hot reload"
    Write-Host "  prod      Start production environment"
    Write-Host "  stop      Stop all containers"
    Write-Host "  clean     Clean up Docker resources (images, containers, networks)"
    Write-Host "  logs      Show container logs (use 'dev' for development logs)"
    Write-Host "  status    Show container status"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\docker-scripts.ps1 build"
    Write-Host "  .\docker-scripts.ps1 dev"
    Write-Host "  .\docker-scripts.ps1 prod"
    Write-Host "  .\docker-scripts.ps1 logs dev"
    Write-Host "  .\docker-scripts.ps1 clean"
}

# Main script logic
switch ($Command.ToLower()) {
    "build" {
        Build-Application
    }
    "dev" {
        Start-Development
    }
    "prod" {
        Start-Production
    }
    "stop" {
        Stop-Containers
    }
    "clean" {
        Clean-Docker
    }
    "logs" {
        Show-Logs $args[0]
    }
    "status" {
        Show-Status
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}


