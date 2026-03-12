# Frontend Kubernetes Template

이 디렉터리는 `app` namespace의 프론트엔드 리소스만 관리합니다.

## Placeholder

적용 전 아래 값만 교체하면 됩니다.

- `PLACEHOLDER_FRONTEND_IMAGE`
- `PLACEHOLDER_HOST`
- `PLACEHOLDER_DEMO_CHAT_GAME_ID`

## Runtime config

프론트는 정적 빌드 후 nginx가 `config.js` 를 생성해서 런타임 값을 주입합니다.

- `VITE_API_BASE_URL=/api`
- `VITE_WS_URL=""`
- `VITE_WS_PATH=/ws/socket.io`
- `VITE_DEFAULT_GAME_DATE`
- `VITE_DEMO_GAME_DATE`
- `VITE_DEMO_CHAT_GAME_ID`

`VITE_WS_URL` 을 비워 두면 브라우저 현재 origin을 사용합니다. 같은 host 기반 Ingress 구성에서는 이 방식이 가장 이식성이 좋습니다.

## Ingress strategy

최종 목표 경로는 아래와 같습니다.

- `/` -> `full-count-front`
- `/api` -> `backend-api`
- `/ws` -> `chat-service`

현재 `04-ingress.yaml` 은 프론트 정적 파일용 `/` 경로만 포함합니다. `/api` 와 `/ws` 는 추후 `backend-api`, `chat-service` 매니페스트가 추가될 때 각 서비스 쪽에서 별도 Ingress를 두는 편이 안전합니다.

이유:

- 백엔드는 이미 `/api/*` 경로를 직접 받으므로 rewrite가 필요하지 않습니다.
- 채팅 서비스가 Socket.IO 기본 path(`/socket.io`)를 쓰면 `/ws` 외부 경로와 연결할 때 rewrite 또는 별도 path 설정이 필요할 수 있습니다.
- nginx Ingress의 rewrite/timeout annotation은 서비스별로 요구사항이 달라질 가능성이 높습니다.

## Apply order

1. `sre-monitoring/monitoring/namespaces/00-namespaces.yaml` 로 namespace 생성
2. placeholder 값 교체
3. 프론트 리소스 적용

```bash
kubectl apply -f app/frontend/01-configmap.yaml
kubectl apply -f app/frontend/02-deployment.yaml
kubectl apply -f app/frontend/03-service.yaml
kubectl apply -f app/frontend/04-ingress.yaml
```
