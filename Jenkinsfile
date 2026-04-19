pipeline {
    agent any

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
                    bat "docker compose build"
                }
            }
        }

        stage('Deploy and Verify') {
            steps {
                script {
                    echo "Deploying services..."
                    bat "docker compose down"
                    bat "docker compose up -d"
                    
                    echo "Waiting 20 seconds for services to start..."
                    bat "ping 127.0.0.1 -n 21 > nul"
                    
                    echo "Seeding Database..."
                    // We changed this from capstone-backend-1 to backend
                    bat "docker exec backend node scripts/seed.js"

                    echo "Verifying Connectivity..."
                    bat "curl -s http://localhost:5050/ > nul || (echo 'ERROR: Backend is not responding on 5050!' && exit 1)"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
            bat "docker compose ps"
        }
    }
}
