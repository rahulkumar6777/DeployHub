# DeployHub

A self-hosted cloud deployment platform. Think Heroku or Render, but you own the infrastructure.

---

## What is this

DeployHub lets developers connect a GitHub repository and get a live deployment in minutes. It handles the Docker build, assigns a subdomain, provisions SSL automatically, and streams build logs in real time. You get a dashboard to manage projects, view metrics, set environment variables, and attach custom domains.

This is not a toy project. It runs on a real VPS, handles real deployments, and deals with real infrastructure problems.

---

## How it started

I built the entire prototype alone over 15 days.

No team, no boilerplate, no tutorials that covered what I was actually building. Most of what ended up in this project I had to figure out by reading source code, hitting errors, and debugging production issues at 2am.

The goal was simple — build something that actually works, end to end. Not a CRUD app. Not a clone of a tutorial. Something that solves a real problem: deploying code should not require you to understand server administration.

---

## What the prototype covers

**Deployment pipeline**
- GitHub repository connection
- Git clone on every deploy trigger
- Docker image build and push to a private registry
- Container run with isolated networking
- Automatic restart on crash

**Routing and SSL**
- Custom reverse proxy (masterrouter) that resolves subdomains to containers via Redis
- Wildcard SSL for platform domains via Let's Encrypt
- Custom domain support — user points their domain to the server, platform detects DNS propagation, runs certbot via Docker SDK, generates a per-domain nginx config, and reloads nginx with SIGHUP. Zero manual steps.

**Real-time logs**
- Build logs streamed during the Docker build process via Redis Pub/Sub and Socket.IO
- Runtime logs pulled from the Docker container log stream
- Failed build logs saved to MinIO (S3-compatible) for later viewing

**Infrastructure**
- BullMQ job queues for build and deploy workers
- Per-project request counting with in-memory batching and periodic MongoDB flush
- Per-plan rate limiting on the proxy layer (free vs pro)
- Daily metrics snapshots via a cron worker
- MinIO for build log object storage

**Dashboard**
- Project overview, build history, live logs, settings
- Environment variable management
- Subdomain editor
- Custom domain flow with DNS check, provisioning status, and SSL info
- Billing and metrics pages (Razorpay integration planned)

---

## Some things I learned building this

Nginx does not reload config automatically. You send it a SIGHUP signal via the Docker SDK to make it pick up new files without downtime.

Certbot inside a Docker container can issue certificates using the HTTP-01 webroot challenge, but only if the nginx `/.well-known/acme-challenge/` location is configured correctly before the cert request happens.

Redis streams need explicit cleanup. If you do not destroy an existing log stream before creating a new one for the same container, logs from previous sessions bleed into the current one.

`\\$host` in a JavaScript template literal writes `\$host` to the nginx config file, which nginx rejects. The correct escape is `\$host` — single backslash.

`process.env.VITE_*` does not work in a Vite frontend. It is `import.meta.env.VITE_*`.

The AWS metadata endpoint `169.254.169.254` is reachable from inside most cloud VMs. If your platform makes HTTP requests based on user input without validation, someone can use it to pull cloud credentials. Block it.

---

## Known issues in the prototype

Static site deployment runs in Docker, which is heavier than necessary. A static site does not need a container — it should be served directly by nginx from a build output directory. This is planned for the refactor.

Some security gaps exist — branch name input is not validated before being passed to git clone, internal ports like Redis and MongoDB are not blocked from user-configured port fields, and reserved subdomains like `api` and `dashboard` are not blocked.

The SSL auto-renew worker is designed but not implemented. Certificates expire in 90 days and would need a BullMQ job scheduled at issue time to handle renewal.

Razorpay is wired into the UI but the payment flow is not connected to the backend.

Metrics data is real for request counts but the daily snapshot cron needs at least one midnight to run before charts populate.

---

## What comes next

**Refactor (handed off to the team)**

I built the prototype to the point where the architecture was proven and the core flows were working end to end. At that point I handed it off to the rest of the team — 4 developers who joined after the mid prototype devlopment.

They are continuing the refactor from where I left it. The known issues are documented, the architecture decisions are explained, and the codebase is structured enough to build on. What remains is fixing the rough edges, improving security, replacing Docker-based static serving with direct nginx delivery, and wiring up the remaining features before moving to the next phase.

**Microservice architecture (planned)**

Once the refactor is stable, the platform will be broken into independent services. Each service will own its domain, communicate over a message broker, and be deployable independently.

Planned split:

- Auth Service
- Build Service
- Deploy Service
- Proxy / Routing Service
- Billing Service
- Metrics Service
- API Gateway

This is also the direction for the final year B.Tech CSE project. The prototype was built to validate that the concept works at all. The microservice version will be built by the full team with the architecture already understood from building it the hard way first.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | React, Vite, Tailwind CSS |
| Queue | BullMQ |
| Cache / Pub-Sub | Redis |
| Database | MongoDB |
| Containers | Docker |
| Object Storage | MinIO |
| Proxy | Custom Node.js router + Nginx |
| SSL | Let's Encrypt via certbot Docker image |
| Real-time | Socket.IO |
| CI/CD | GitHub Actions |

---

---

## Project status

The prototype is complete and running in production at [deployhub.cloud](https://dashboard.deployhub.cloud).

Active development is on the refactor branch. The microservice version will be a separate repository when that phase begins.

---

## Author

Rahul Kumar — designed and built the prototype solo over 15 days.  
GitHub: [rahulkumar6777](https://github.com/rahulkumar6777)

The prototype is now handed off. Four team members have taken it forward and are continuing the refactor toward the production version.
