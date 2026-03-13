# App Namespace Layout

`app/` 디렉터리는 애플리케이션 워크로드 매니페스트를 보관합니다.

현재 구성:

- `frontend/`: 프론트엔드 Deployment, Service, Ingress

확장 방향:

- `backend/`: REST API Deployment, Service, Ingress(`/api`)
- `chat-service/`: 실시간 채팅 Deployment, Service, Ingress(`/ws`)

권장 원칙:

- 워크로드별로 디렉터리를 분리합니다.
- Service와 Deployment는 각 워크로드 디렉터리에서 함께 관리합니다.
- Ingress는 최종 외부 경로를 기준으로 서비스별 책임을 나눕니다.
- 공통 namespace 생성은 `sre-monitoring/monitoring/namespaces/00-namespaces.yaml` 를 기준으로 유지합니다.
