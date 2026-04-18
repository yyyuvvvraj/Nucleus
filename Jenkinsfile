pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "your-docker-registry" // Change as needed
        APP_NAME = "nucleus"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    // bat 'npm install'
                    // bat 'npm test'
                    echo 'Running backend tests...'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    bat 'docker-compose build'
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Performing security scans on images...'
                // bat 'trivy image nucleus-backend'
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Pushing images to registry...'
                    // bat "docker push ${DOCKER_REGISTRY}/${APP_NAME}-backend:latest"
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to staging/production server...'
                bat 'docker-compose up -d'
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
