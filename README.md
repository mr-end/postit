# postit

Post-it style reminder tasks

Scaffolded with the **Post-it Tasks** Backstage Software Template.

## Stack

| Layer | Tech | Port |
|-------|------|------|
| Backend | Java 21 + Quarkus | 8080 |
| Frontend | Node.js + Express | 3000 |
| Database | MariaDB | 3306 |

## Kustomize overlays

| Overlay | Namespace | Route | Path |
|---------|-----------|-------|------|
| **DEV** | `postit-dev` | `postit-dev.apps.cluster-bxnhf.dyn.redhatworkshops.io` | `deploy/overlays/dev` |
| **PROD** | `postit-prod` | `postit.apps.cluster-bxnhf.dyn.redhatworkshops.io` | `deploy/overlays/prod` |

```bash
kubectl kustomize deploy/overlays/dev
kubectl kustomize deploy/overlays/prod
```

## Secrets (applied out-of-band)

The `postit-db` Secret is **gitignored** and applied manually:

```bash
cp deploy/overlays/dev/secret.yaml.tpl deploy/overlays/dev/secret.yaml
# edit REPLACE_ME_* values, then:
kubectl apply -f deploy/overlays/dev/secret.yaml
```

(Repeat for prod.) For production, prefer Sealed Secrets or External Secrets.

## Argo CD

```bash
kubectl apply -f deploy/argocd/project.yaml
kubectl apply -f deploy/argocd/application-dev.yaml
kubectl apply -f deploy/argocd/application-prod.yaml
```

- DEV app: `postit-dev` (auto-sync: )
- PROD app: `postit-prod` (**manual approval** — no auto-sync; AppProject deny window with `manualSync: true`)

Promote to PROD after review:

```bash
argocd app sync postit-prod
# or Argo CD UI → Application → Sync
```

## GitHub Actions (CI)

The pipeline at `.github/workflows/build-push.yml` runs on every push to `main`:

1. Builds `postit-backend` and `postit-frontend` Docker images
2. Pushes to GHCR (`ghcr.io/<owner>/<repo>/postit-backend:SHA`, etc.)
3. Updates DEV overlay `kustomization.yaml` image tags
4. Commits the change — Argo CD detects it and syncs DEV automatically

To run manually: **Actions** → **Build & Push Images** → **Run workflow**.

## Local development

```bash
# Backend (H2)
cd backend && mvn quarkus:dev

# Frontend
cd frontend && npm install && npm run dev
```

Or `docker compose up --build`.
