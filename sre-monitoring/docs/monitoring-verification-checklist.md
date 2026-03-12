# 모니터링 검증 체크리스트 초안

## 적용 전 확인

- `PLACEHOLDER_STORAGE_CLASS` 값을 실제 StorageClass 이름으로 변경했는지 확인합니다.
- `PLACEHOLDER_WORKER_INFRA_HOSTNAME` 값이 실제 VM4 워커 노드 호스트명과 일치하는지 확인합니다.
- Grafana 관리자 계정을 실제 값으로 변경했는지 확인합니다.
- Alertmanager webhook URL을 실제 알림 수신 주소로 변경했는지 확인합니다.
- 각 앱 팀과 `/metrics`, `/health/live`, `/health/ready` 경로를 확정했는지 확인합니다.

## 적용 후 확인

- `kubectl get pods -n monitoring` 결과에서 Prometheus, Grafana, Alertmanager가 모두 `Running` 상태인지 확인합니다.
- `kubectl get pvc -n monitoring` 결과에서 PVC가 `Bound` 상태인지 확인합니다.
- `kubectl get svc -n monitoring` 결과에서 Prometheus, Grafana, Alertmanager Service가 정상 생성되었는지 확인합니다.
- Prometheus의 `Status > Targets` 화면에서 Kubernetes API, 노드, annotation 기반 앱 타겟이 `UP` 상태인지 확인합니다.
- Grafana 접속 후 Prometheus 데이터소스와 기본 대시보드가 자동 등록되었는지 확인합니다.
- Prometheus에서 샘플 알람을 발생시켰을 때 Alertmanager를 통해 실제 알림이 전달되는지 확인합니다.

## 부하 테스트 확인

- `k6 run sre-monitoring/loadtest/k6/schedules-list.js` 실행 시 threshold 실패 없이 완료되는지 확인합니다.
- `k6 run sre-monitoring/loadtest/k6/live-page-api.js` 실행 시 p95 응답시간 목표를 만족하는지 확인합니다.
- `k6 run sre-monitoring/loadtest/k6/comments-api.js` 실행 시 인증이 필요한 댓글 등록 동작이 정상인지 확인합니다.
- `k6 run sre-monitoring/loadtest/k6/staged-traffic.js` 실행 중 Prometheus와 Grafana 대시보드를 함께 관찰했는지 확인합니다.
- 단계별 부하 테스트 후 CPU, 메모리, 응답시간, 실패율 병목을 기록했는지 확인합니다.
