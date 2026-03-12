# 모니터링 적용 순서 초안

1. 모니터링 매니페스트에 있는 모든 `PLACEHOLDER_*` 값을 실제 환경 값으로 변경합니다.
2. `sre-monitoring/monitoring/namespaces/00-namespaces.yaml`로 네임스페이스를 먼저 생성합니다.
3. Alertmanager 매니페스트를 적용합니다.
4. Prometheus RBAC, ConfigMap, PVC, Service, Deployment를 순서대로 적용합니다.
5. Grafana ConfigMap, PVC, Service, Deployment를 적용합니다.
6. 앱 팀별 컨테이너 이미지 이름과 health check 경로가 확정된 뒤 probe 템플릿을 반영합니다.
7. 클러스터 준비가 끝나면 Ingress 또는 임시 port-forward로 Grafana와 Prometheus 접근 경로를 엽니다.

## 예시 명령어

```bash
kubectl apply -f sre-monitoring/monitoring/namespaces/00-namespaces.yaml
kubectl apply -f sre-monitoring/monitoring/alertmanager/
kubectl apply -f sre-monitoring/monitoring/prometheus/
kubectl apply -f sre-monitoring/monitoring/grafana/
kubectl apply -f sre-monitoring/monitoring/probes/app-probe-examples.yaml
```
