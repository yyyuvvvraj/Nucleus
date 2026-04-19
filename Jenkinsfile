pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "your-docker-registry" // Change as needed
        APP_NAME = "nucleus"
        // Force the Docker host to the local named pipe and a stable API version
        DOCKER_HOST = "npipe://./pipe/docker_engine"
        DOCKER_API_VERSION = "1.41"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/yyyuvvvraj/Nucleus.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Docker images using Compose..."
                    bat 'docker compose build'
                }
            }
        }

        stage('Deploy and Verify') {
            steps {
                script {
                    echo 'Starting Docker containers...'
                    bat 'docker compose up -d'
                    
                    echo 'Waiting for services to initialize (20s)...'
                    // Windows timeout command - gives services time to start up
                    bat 'timeout /t 20 /nobreak'
                    
                    echo 'Checking Voice Service Connectivity (Port 8000)...'
                    bat 'curl -s http://localhost:8000/docs > nul || (echo "ERROR: Voice Service is not responding!" && exit 1)'
                    
                    echo 'Checking Backend Connectivity (Port 5001)...'
                    bat 'curl -s http://localhost:5001/ > nul || (echo "ERROR: Backend is not responding!" && exit 1)'
                    
                    echo 'All services are UP and reachable.'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment and Verification successful!'
        }
        failure {
            echo 'Pipeline failed. Check the logs below for service errors.'
            bat 'docker compose logs --tail=100'
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}
