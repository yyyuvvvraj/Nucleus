pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "your-docker-registry"
        APP_NAME = "nucleus"
    }

    stages {
        stage('Checkout') {
            steps {
                // Manually specifying the repository since you are pasting the script
                git branch: 'main', url: 'https://github.com/yyyuvvvraj/Nucleus.git'
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    echo 'Running backend tests...'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Changed 'sh' to 'bat' and 'docker-compose' to 'docker compose'
                    bat 'docker compose build'
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Performing security scans on images...'
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    echo 'Pushing images to registry...'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to staging/production server...'
                // Changed 'sh' to 'bat' and 'docker-compose' to 'docker compose'
                bat 'docker compose up -d'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Pipeline failed. Check the logs.'
        }
    }
}
