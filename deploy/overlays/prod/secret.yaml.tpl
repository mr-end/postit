apiVersion: v1
kind: Secret
metadata:
  name: postit-db
type: Opaque
stringData:
  # Prefer SealedSecrets / ExternalSecrets in real production clusters
  MARIADB_ROOT_PASSWORD: REPLACE_ME_PROD_ROOT_PASSWORD
  MARIADB_PASSWORD: REPLACE_ME_PROD_MARIADB_PASSWORD
  MARIADB_USER: REPLACE_ME_PROD_MARIADB_USER
  MARIADB_DATABASE: REPLACE_ME_PROD_MARIADB_DATABASE
