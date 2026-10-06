# API

A especificação OpenAPI está em [`openapi.yaml`](../openapi.yaml).

Com o backend rodando:

- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI JSON: http://localhost:8080/openapi
- Health: http://localhost:8080/q/health

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/tasks` | Lista tasks |
| POST | `/api/tasks` | Cria task |
| GET | `/api/tasks/{id}` | Busca por id |
| PUT | `/api/tasks/{id}` | Atualiza task |
| DELETE | `/api/tasks/{id}` | Remove task |
