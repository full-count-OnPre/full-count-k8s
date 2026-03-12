# full-count-k8s SRE Monitoring Draft

온프레미스 Kubernetes 기반 MLB 실시간 문자중계 및 응원 플랫폼의 Observability / SRE / 운영 자동화 초안을 모아둔 작업 폴더입니다.

현재 브랜치 `feat/monitoring`에서는 심동섭 담당 범위를 먼저 정리했습니다.

## 이번에 작업한 내용

- `monitoring/namespaces/`에 프로젝트 기본 네임스페이스 초안 추가
- `monitoring/prometheus/`에 Prometheus 배포용 raw YAML 추가
- `monitoring/grafana/`에 Grafana 배포, datasource, dashboard provisioning 초안 추가
- `monitoring/alertmanager/`에 Alertmanager 배포 및 기본 알림 라우팅 초안 추가
- `monitoring/probes/`에 서비스별 liveness/readiness probe 예시 추가
- `loadtest/k6/`에 k6 부하 테스트 예시 스크립트 추가
- `docs/`에 적용 순서 및 검증 체크리스트 초안 추가

## 폴더 역할

### `monitoring/`

모니터링 및 운영 안정성 관련 Kubernetes YAML을 모아둔 폴더입니다.

- `monitoring/namespaces/`
  - `app`, `data`, `db`, `monitoring` 네임스페이스 생성 파일
- `monitoring/prometheus/`
  - Prometheus ServiceAccount, RBAC, scrape 설정, 알람 룰, PVC, Service, Deployment
- `monitoring/grafana/`
  - Grafana datasource provisioning, dashboard provisioning, 기본 대시보드, PVC, Service, Deployment
- `monitoring/alertmanager/`
  - Alertmanager 설정, Service, Deployment
- `monitoring/probes/`
  - 각 서비스 YAML 작성 시 참고할 health check / metrics annotation 템플릿

### `loadtest/`

부하 테스트 예시를 모아둔 폴더입니다.

- `loadtest/k6/schedules-list.js`
  - 일정 목록 조회 API 부하 테스트 예시
- `loadtest/k6/live-page-api.js`
  - 라이브 페이지 API 조회 부하 테스트 예시
- `loadtest/k6/comments-api.js`
  - 댓글 등록 API 부하 테스트 예시
- `loadtest/k6/staged-traffic.js`
  - VU를 단계적으로 증가시키는 경기일 시나리오 예시

### `docs/`

적용 전에 확인해야 할 운영 문서를 모아둔 폴더입니다.

- `docs/monitoring-apply-order.md`
  - kubectl apply 순서 초안
- `docs/monitoring-verification-checklist.md`
  - 적용 전/후 확인할 체크리스트 초안

## 현재 상태

- 아직 클러스터 초기 설정 전 단계입니다.
- 따라서 이 폴더의 목적은 "나중에 실제 적용 가능한 YAML 초안"을 먼저 정리하는 것입니다.
- Helm 없이 raw YAML 기준으로 작성했습니다.
- 민감정보와 환경별 값은 모두 `PLACEHOLDER_*` 형태로 남겨두었습니다.
- ServiceMonitor 같은 CRD 기반 구조는 아직 사용하지 않았습니다.

## 앞으로 네가 해야 할 작업

### 1. placeholder 실제 값으로 교체

아래 값들은 클러스터 준비 후 반드시 실제 값으로 바꿔야 합니다.

- `PLACEHOLDER_STORAGE_CLASS`
- `PLACEHOLDER_WORKER_INFRA_HOSTNAME`
- `PLACEHOLDER_GRAFANA_ADMIN_USER`
- `PLACEHOLDER_GRAFANA_ADMIN_PASSWORD`
- `PLACEHOLDER_GRAFANA_HOST`
- Alertmanager webhook 주소
- 각 서비스 이미지 이름
- `BASE_URL`, `GAME_ID`, `API_TOKEN` 같은 k6 실행 변수

### 2. 앱 팀과 health endpoint 규격 맞추기

`monitoring/probes/app-probe-examples.yaml`은 참고용 템플릿입니다.

실제 적용 전에는 아래 경로를 각 서비스 담당자와 맞춰야 합니다.

- `/metrics`
- `/health/live`
- `/health/ready`

특히 frontend는 현재 `/` 기준으로 예시를 넣어두었기 때문에 실제 앱 구조에 맞춰 수정이 필요할 수 있습니다.

### 3. 클러스터 준비 후 적용

적용 기본 순서는 아래와 같습니다.

1. 네임스페이스 생성
2. Alertmanager 적용
3. Prometheus 적용
4. Grafana 적용
5. 앱 서비스 매니페스트에 probe 및 metrics annotation 반영

자세한 내용은 아래 문서를 보면 됩니다.

- [docs/monitoring-apply-order.md](/Users/DONGSEUP/Desktop/full-count/full-count-k8s/sre-monitoring/docs/monitoring-apply-order.md)
- [docs/monitoring-verification-checklist.md](/Users/DONGSEUP/Desktop/full-count/full-count-k8s/sre-monitoring/docs/monitoring-verification-checklist.md)

### 4. 실제 운영 검증

클러스터 준비 후에는 아래를 직접 확인해야 합니다.

- Prometheus target 상태
- Grafana datasource 및 dashboard 자동 등록 여부
- Alertmanager 알림 전달 여부
- PVC 바인딩 상태
- 앱 Pod readiness/liveness 정상 동작 여부

### 5. 부하 테스트 실행

k6는 실제 서비스 URL이 준비된 뒤 실행합니다.

예시:

```bash
export BASE_URL=http://PLACEHOLDER_BASE_URL
export GAME_ID=PLACEHOLDER_GAME_ID
export API_TOKEN=PLACEHOLDER_API_TOKEN

k6 run sre-monitoring/loadtest/k6/schedules-list.js
k6 run sre-monitoring/loadtest/k6/live-page-api.js
k6 run sre-monitoring/loadtest/k6/comments-api.js
k6 run sre-monitoring/loadtest/k6/staged-traffic.js
```

부하 테스트 시에는 Prometheus / Grafana를 같이 보면서 CPU, 메모리, 응답시간, 실패율 병목을 기록해야 합니다.

## 참고

- 이 폴더는 monitoring/SRE 담당 범위만 먼저 정리한 상태입니다.
- 다른 역할의 앱 배포 YAML, DB YAML, Ingress YAML은 이후 팀 작업과 맞춰 추가하면 됩니다.
