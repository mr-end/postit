# GitOps / Argo CD

Kustomize overlays for **DEV** and **PROD**, managed by Argo CD.
CI/CD handled by **GitHub Actions** (build → push to GHCR → update overlay → Argo CD sync).

| Overlay | Namespace | Route | Argo CD Application |
|---------|-----------|-------|---------------------|
| DEV | `postit-dev` | `postit-dev.apps.cluster-bxnhf.dyn.redhatworkshops.io` | `postit-dev` |
| PROD | `postit-prod` | `postit.apps.cluster-bxnhf.dyn.redhatworkshops.io` | `postit-prod` (**manual approval**) |

This registers DEV (auto) and PROD (**held until manual Sync**).

## CI/CD flow

```
push to main → GitHub Actions → build images → push to GHCR
                                              → update DEV overlay → commit
                                              → Argo CD sync DEV
```

## Preview

```bash
kubectl kustomize deploy/overlays/dev
kubectl kustomize deploy/overlays/prod
```

## Secrets (applied out-of-band)

`secret.yaml` in overlays is **gitignored** — it's applied directly with
`kubectl apply`, not through Kustomize/Argo CD:

```bash
cp deploy/overlays/dev/secret.yaml.tpl deploy/overlays/dev/secret.yaml
cp deploy/overlays/prod/secret.yaml.tpl deploy/overlays/prod/secret.yaml
# edit REPLACE_ME_* values, then:
kubectl apply -f deploy/overlays/dev/secret.yaml
kubectl apply -f deploy/overlays/prod/secret.yaml
```

For production, prefer Sealed Secrets or External Secrets Operator.

## Register in Argo CD

```bash
kubectl apply -f deploy/argocd/
```

This registers DEV (auto-sync) and PROD (**manual approval** via AppProject syncWindow).

```bash
argocd app sync postit-prod   # after review
```

## Troubleshooting: MariaDB `InnoDB: File ./ib_logfile0 was not found`

The official `mariadb` image expects to run as UID `999` (the `mysql` user) and own
`/var/lib/mysql`. OpenShift's default `restricted-v2` SCC assigns a **random** UID
instead, so the entrypoint's DB initialization fails partway through, and every
restart hits the same InnoDB error because the data directory is now partially
initialized.

`deploy/base/mariadb-deployment.yaml` ships with `serviceAccountName: postit-mariadb`
and an explicit `securityContext` forcing UID/GID `999`, but this requires the
`anyuid` SCC to be granted once per namespace:

```bash
oc adm policy add-scc-to-user anyuid -z postit-mariadb -n postit-dev
oc adm policy add-scc-to-user anyuid -z postit-mariadb -n postit-prod
```

If the pod already crashed before this was granted, clear the now-corrupted PVC:

```bash
kubectl delete pvc postit-mariadb-data -n postit-dev
```
