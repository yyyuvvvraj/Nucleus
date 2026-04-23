# Nucleus Jenkins + Docker Setup

This guide is for running the full Nucleus project on a Windows Jenkins agent with Docker Desktop.

## 1. What this project starts

The stack has 4 long-running services and 1 one-time seed job:

- `mongodb` on internal Docker network
- `voice-service` on `http://localhost:8000`
- `backend` on `http://localhost:5050`
- `frontend` on `http://localhost:3000`
- `db-seed` runs once to insert demo data into MongoDB

## 2. Jenkins machine requirements

Use a Jenkins agent/node that has:

- Windows with Docker Desktop installed and running
- Docker Compose v2 enabled (`docker compose version`)
- At least 12 GB free disk before the first build
- At least 8 GB RAM available to Docker
- Internet access for the first build only

Important:

- The first build of `voice-auth-service` is the heaviest one because it installs `tensorflow`, `deepface`, `mediapipe`, and OpenCV.
- After the first successful build, do not prune Docker images/layers unless you want Jenkins to download them again.

## 3. Docker Desktop settings

Before using Jenkins, open Docker Desktop and set:

- Memory: `8 GB` or more
- Disk image size: enough for ML images and build cache
- Linux containers mode: enabled

## 4. Jenkins plugins

Install these Jenkins plugins if they are not already present:

- `Pipeline`
- `Git`
- `Workspace Cleanup` (optional but useful)

No Docker Jenkins plugin is required because the pipeline uses normal `docker` CLI commands.

## 5. Create the Jenkins job

Create a new item:

1. Open Jenkins.
2. Click `New Item`.
3. Choose `Pipeline`.
4. Name it `Nucleus-Docker`.
5. Save.

Configure it:

1. In `Pipeline`, choose `Pipeline script from SCM`.
2. SCM: `Git`
3. Repository URL: your repo URL
4. Branch:
   Use `*/Sujal` if you want to run Sujal branch.
   Use `*/main` only if you want the main branch.
5. Script Path: `Jenkinsfile`
6. Save.

Important:

- The current `Jenkinsfile` uses `checkout scm`, so it will run from the branch configured in the Jenkins job.
- It is not locked to `main`.

## 6. Jenkins node setup

Run these commands once on the Jenkins agent in PowerShell:

```powershell
docker version
docker compose version
```

If Jenkins service cannot access Docker, add the Jenkins service user to the local `docker-users` group and restart the machine or Jenkins service.

## 7. First-run cache warmup

To reduce the chance of timeout or large-download failure on the first pipeline run, warm the base images once on the Jenkins agent:

```powershell
docker pull mongo:7.0
docker pull node:20-slim
docker pull nginx:alpine
docker pull python:3.12-slim
```

This is the safest low-error approach because the later `docker compose build` can reuse these base images instead of pulling everything inside the Jenkins build window.

## 8. What the Jenkinsfile does

The repository `Jenkinsfile` now:

1. Checks out the repo
2. Verifies Docker CLI and Compose
3. Cleans the previous stack for that Jenkins build
4. Builds the Docker images without forcing fresh base-image pulls
5. Starts `mongodb`, `voice-service`, `backend`, and `frontend`
6. Waits for healthchecks to pass
7. Runs the DB seed job
8. Smoke-tests backend and frontend URLs

## 9. Ports used

Make sure these are free on the Jenkins machine:

- `3000` for frontend
- `5050` for backend
- `8000` for voice service

If another app is using them, stop that app before running the pipeline.

## 10. After successful build

Open:

- Frontend: `http://<jenkins-agent-host>:3000`
- Backend health: `http://<jenkins-agent-host>:5050/health`

Demo login users from the seed job:

- `admin@college.com` / `admin`
- `student@college.com` / `admin`
- `demo.student@college.com` / `demo123`

## 11. Manual fallback commands

If you want to verify outside Jenkins from the project root:

```powershell
docker compose build --pull=false
docker compose up -d mongodb voice-service backend frontend --wait
docker compose run --rm db-seed
docker compose ps
```

To stop everything:

```powershell
docker compose down -v --remove-orphans
```

## 12. If the first build fails

Check logs with:

```powershell
docker compose logs --no-color
```

Most likely causes:

- Docker Desktop memory too low
- Jenkins service user cannot access Docker
- Port `3000`, `5050`, or `8000` already in use
- First-time ML dependency download interrupted during `voice-auth-service` build

## 13. Best practice for stable repeated builds

For the lowest error rate:

- Keep the same Jenkins agent for repeated runs
- Do not run Docker system prune between builds
- Warm the base images once before the first job
- Run only one Nucleus Jenkins build at a time on that machine
