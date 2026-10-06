# ${{ values.name }}

${{ values.description }}

## Overlays

- DEV → `deploy/overlays/dev` (namespace `${{ values.devNamespace }}`)
- PROD → `deploy/overlays/prod` (namespace `${{ values.prodNamespace }}`)
