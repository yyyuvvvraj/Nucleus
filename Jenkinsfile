pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        COMPOSE_PROJECT_NAME = "nucleus-${env.BUILD_NUMBER}"
        DOCKER_BUILDKIT = "1"
        COMPOSE_DOCKER_CLI_BUILD = "1"
        JWT_SECRET = "nucleus_jenkins_secret_2026"
        MONGO_URI = "mongodb://mongodb:27017/nucleus"
        VOICE_SERVICE_URL = "http://voice-service:8000"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Docker') {
            steps {
                bat 'docker version'
                bat 'docker compose version'
            }
        }

        stage('Clean Previous Stack') {
            steps {
                bat 'docker compose -p %COMPOSE_PROJECT_NAME% down -v --remove-orphans'
            }
        }

        stage('Build Images') {
            steps {
                bat 'docker compose -p %COMPOSE_PROJECT_NAME% build --pull=false'
            }
        }

        stage('Start Application') {
            steps {
                bat 'docker compose -p %COMPOSE_PROJECT_NAME% up -d mongodb voice-service backend frontend --wait'
            }
        }

        stage('Seed Database') {
            steps {
                bat 'docker compose -p %COMPOSE_PROJECT_NAME% run --rm db-seed'
            }
        }

        stage('Smoke Test') {
            steps {
                bat 'powershell -NoProfile -ExecutionPolicy Bypass -Command "(Invoke-WebRequest http://localhost:5050/health -UseBasicParsing).StatusCode"'
                bat 'powershell -NoProfile -ExecutionPolicy Bypass -Command "(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode"'
            }
        }
    }

    post {
        always {
            bat 'docker compose -p %COMPOSE_PROJECT_NAME% ps'
        }
        success {
            echo 'Nucleus stack is up. Frontend: http://localhost:3000 | Backend: http://localhost:5050/health'
        }
        failure {
            bat 'docker compose -p %COMPOSE_PROJECT_NAME% logs --no-color'
            bat 'docker compose -p %COMPOSE_PROJECT_NAME% down -v --remove-orphans'
            echo 'Pipeline failed. Review the compose logs printed above.'
        }
    }
}
