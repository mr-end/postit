# Token-based auth: per Argo CD docs (Access Token section of
# private-repositories.md), `username` can be any non-empty string when using a
# PAT — it is NOT a real account/password pair, so it's a fixed non-secret value
# below. Only `password` (the PAT) is sensitive.
# https://github.com/argoproj/argo-cd/blob/master/docs/user-guide/private-repositories.md
#
# Usage:
#   cp deploy/argocd/repo-credentials.yaml.tpl deploy/argocd/repo-credentials.yaml
#   # edit REPLACE_ME_GITHUB_PAT below, then:
#   kubectl apply -f deploy/argocd/repo-credentials.yaml
apiVersion: v1
kind: Secret
metadata:
  name: repo-postit
  namespace: openshift-gitops
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/mr-end/postit.git
  username: token # DO NOT CHANGE if you're using PAT as password
  password: REPLACE_ME_GITHUB_PAT
