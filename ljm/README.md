# 🔵 ljm — Kubernetes 플랫폼 / 백엔드 (이재민)

> Full Count 프로젝트에서 **Kubernetes 클러스터 구축, GitOps CI/CD 파이프라인, 백엔드 API 서버**를 담당했습니다.

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.34-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?logo=argo&logoColor=white)](https://argo-cd.readthedocs.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 📋 담당 역할 요약

| 영역 | 내용 |
|------|------|
| **Kubernetes 클러스터** | kubeadm 기반 온프레미스 클러스터 구축 및 배포 구조 설계 |
| **GitOps CI/CD** | GitHub Actions + ArgoCD 파이프라인 구축 |
| **워크로드 안정성** | HPA 자동 스케일링, Rolling Update, Readiness/Liveness Probe |
| **보안** | ResourceQuota, PDB, Security Context 적용 |
| **백엔드 API** | Express.js + Prisma 기반 REST API 서버 개발 |

---

## 📁 디렉터리 구조

```
ljm/
├── backend/            # API 서버 Deployment, Service, HPA
├── frontend/           # Frontend Deployment, Service
├── ingress/            # NGINX Ingress, TLS 설정
├── namespace/          # Namespace 정의
├── configmap-secret/   # ConfigMap, Secret 관리
└── gitops/             # ArgoCD Application 정의
```

---

## ⚙️ GitOps CI/CD 파이프라인

![ArgoCD Synced]

```
Code Push
   │
   ▼
GitHub Actions (CI)
   ├── Docker Image Build & Push
   └── Manifest(YAML) 이미지 태그 자동 업데이트
         │
         ▼
      ArgoCD (CD)
         └── Kubernetes Cluster 자동 동기화 (Sync)
```

### 파이프라인 흐름

1. `main` 브랜치에 코드 Push
2. GitHub Actions가 Docker 이미지 빌드 후 레지스트리 Push
3. `full-count-k8s` 레포의 Manifest 파일 이미지 태그 자동 업데이트
4. ArgoCD가 변경을 감지하여 클러스터에 자동 배포 (Sync)

### GitOps 도입 이유

| 기존 방식 (Push) | GitOps (ArgoCD) |
|-----------------|-----------------|
| 파이프라인이 직접 배포 | Git 상태를 기준으로 동기화 |
| 클러스터 외부 중심 | 클러스터 내부 reconcile |
| 이력 분산 가능 | 변경 이력 일원화 |

> 배포 이력을 Git에 남기고, 원하는 상태를 선언적으로 관리하여 **운영자 개입 최소화 및 롤백 용이성** 확보

---

## 📊 HPA (Horizontal Pod Autoscaler)

![HPA Scale Out]

```yaml
spec:
  minReplicas: 2
  maxReplicas: 3
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60  # CPU 60% 초과 시 자동 스케일 아웃
```

### 도입 배경
worker-app 노드는 2 vCPU 단일 노드로, 수동 replicas 조정은 야간/주말에 즉시 대응이 어려웠습니다. CPU 기반 자동 스케일링으로 운영 개입 없이 대응하도록 설계했습니다.

### 튜닝 과정

| 시도 | 결과 | 원인 | 조치 |
|------|------|------|------|
| maxReplicas: 5 | 노드 CPU 포화 | 4 Pod × 500m = 2000m 초과 | maxReplicas: 3으로 조정 |
| maxReplicas: 3 | 안정적 운영 | 총 1500m, 500m 여유 확보 | 유지 |

---

## 🔄 무중단 배포 — Rolling Update

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # 교체 중 Pod 1개만 추가 생성
    maxUnavailable: 0  # 기존 Pod 먼저 내리지 않아 최소 replicas 항상 보장
```

**Recreate 방식 대신 RollingUpdate를 선택한 이유**: 운영 중 이미지 업데이트 시 서비스 중단 없이 하나씩 교체하여 가용성 유지

---

## 🔒 보안 강화 — Quota / PDB / Security Context

| 항목 | 설정 | 목적 |
|------|------|------|
| **ResourceQuota** | 네임스페이스 단위 리소스 상한 설정 | 특정 워크로드의 과도한 사용 방지, HPA 스케일 시에도 전체 상한 제어 |
| **PodDisruptionBudget** | `minAvailable: 1` | 롤링 업데이트/노드 드레인 중에도 최소 1개 Pod 항상 유지 |
| **Security Context** | `runAsNonRoot: true`<br>`allowPrivilegeEscalation: false` | 컨테이너 탈취 리스크 최소화, 최소 권한 원칙 적용 |

---

## 🗂 Namespace 전략

| Namespace | 용도 | 분리 이유 |
|-----------|------|-----------|
| `app` | Frontend, API, Chat 서비스 | 사용자 서비스 격리 |
| `data` | MLB 수집/정규화 워크로드, Redis | 데이터 계층 분리 |
| `db` | PostgreSQL | DB 계층 독립 관리 |
| `monitoring` | Prometheus, Grafana, Loki | 모니터링 리소스 격리 |
| `argocd` | GitOps 배포 관리 | 배포 도구 분리 |
| `ingress-nginx` | Ingress Controller | 네트워크 진입점 분리 |

> 분리 목적: 리소스 격리, RBAC 확장, 장애 영향 범위 축소

---

## 🔧 핵심 트러블슈팅

| # | 문제 | 원인 | 해결 | 교훈 |
|---|------|------|------|------|
| 1 | API Pod CrashLoopBackOff 반복 | readinessProbe `/api/games` 체크가 외부 의존성(DB/Redis) 장애에 영향 | `/health` 엔드포인트로 변경, 서버 프로세스 자체만 확인 | readiness는 서버 자체 준비 상태만 봐야 함 |
| 2 | HPA 스케일 아웃 후 노드 CPU 포화 | maxReplicas 5, Pod 4개 × 500m = 2000m 초과 | maxReplicas 3으로 조정, 500m 여유 확보 | maxReplicas는 노드 실제 용량과 함께 계산 |
| 3 | DNS nslookup 실패 | ACL에서 UDP/TCP 53 포트 미허용 | ACL DNS 포트 허용 정책 추가 | ICMP 성공만으로 네트워크 정상 판단하면 안 됨 |
| 4 | image pull 실패 / 외부 API 호출 불가 | Edge Router ACL에서 DNS 응답 포트 차단 | DNS 허용 규칙 추가 후 CoreDNS 재기동 | DNS → ICMP 순서로 네트워크 진단 |
| 5 | PostgreSQL 초기화 실패 (CrashLoopBackOff) | 기존 Longhorn 데이터가 PV에 남아 초기화 충돌 | NFS 전환 후 PV 초기화 및 재생성 | Reclaim Policy와 잔류 데이터 점검 필수 |
