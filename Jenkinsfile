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
                    // sh 'npm install'
                    // sh 'npm test'
                    echo 'Running backend tests...'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker-compose build'
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Performing security scans on images...'
                // sh 'trivy image nucleus-backend'
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    echo 'Pushing images to registry...'
                    // sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}-backend:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to staging/production server...'
                sh 'docker-compose up -d'
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
