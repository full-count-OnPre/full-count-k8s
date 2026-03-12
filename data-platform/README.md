# Data Platform

이 디렉토리는 **Full Count 프로젝트의 데이터 플랫폼 구성 요소**를 정의하는 Kubernetes YAML 파일을 포함합니다.

데이터 플랫폼은 다음 역할을 담당합니다.

* MLB API 데이터 수집
* 캐시 시스템 운영 (Redis)
* 영구 데이터 저장 (PostgreSQL)

---

# Architecture

## System Architecture

```
          MLB API
             │
             ▼
        Data Collector
             │
      ┌──────┴──────┐
      ▼             ▼
    Redis       PostgreSQL
      │             │
      └──────┬──────┘
             ▼
        Backend API
             │
             ▼
          Frontend
             │
             ▼
            Users
```

### Data Flow

1. **Collector**가 MLB API에서 데이터를 수집합니다.
2. 수집된 데이터는 **Redis(Cache)** 와 **PostgreSQL(Persistent Storage)** 에 저장됩니다.
3. **Backend API**는 Redis 또는 PostgreSQL에서 데이터를 조회합니다.
4. **Frontend**는 Backend API를 통해 데이터를 받아 사용자에게 제공합니다.

---

# Components

## PostgreSQL

PostgreSQL은 프로젝트의 **영구 데이터 저장소(Persistent Storage)** 입니다.

### 역할

* 사용자 정보 저장
* 채팅 데이터 저장
* 경기 데이터 저장

### Kubernetes Resources

| Resource              | Description       |
| --------------------- | ----------------- |
| StatefulSet           | PostgreSQL Pod 관리 |
| Service               | 내부 네트워크 접근        |
| PersistentVolumeClaim | 데이터 영구 저장         |
| Secret                | DB 인증 정보          |

### Connection Information

| Key          | Value              |
| ------------ | ------------------ |
| Service Name | postgresql-service |
| Port         | 5432               |
| Database     | fullcount          |
| Secret       | postgresql-secret  |

---

## Redis

Redis는 **캐시 및 실시간 데이터 처리 시스템**입니다.

### 역할

* 경기 데이터 캐싱
* 채팅 Pub/Sub
* API 응답 속도 향상

### Kubernetes Resources

| Resource   | Description  |
| ---------- | ------------ |
| Deployment | Redis Pod 실행 |
| Service    | Redis 접근 서비스 |

### Connection Information

| Key          | Value         |
| ------------ | ------------- |
| Service Name | redis-service |
| Port         | 6379          |

---

## MLB Data Collector

Collector는 MLB API에서 데이터를 주기적으로 수집하여 Redis 및 PostgreSQL에 저장하는 서비스입니다.

### Execution

Kubernetes **CronJob**으로 실행됩니다.

### Schedule

```
*/5 * * * *
```

5분마다 데이터 수집 실행

### Kubernetes Resources

| Resource  | Description    |
| --------- | -------------- |
| CronJob   | 데이터 수집 작업 스케줄링 |
| ConfigMap | Collector 설정   |

### ConfigMap

collector-config

### Container Image

Collector 컨테이너 이미지는 추후 설정 예정입니다.

```
TBD
```

---

# Backend Connection Information

Backend 서비스는 아래 정보를 사용하여 데이터 서비스에 연결합니다.

## Redis

```
REDIS_HOST=redis-service
REDIS_PORT=6379
```

## PostgreSQL

```
POSTGRES_HOST=postgresql-service
POSTGRES_PORT=5432
POSTGRES_DB=fullcount
```

---

# Directory Structure

```
data-platform
├── collector
│   ├── collector-configmap.yaml
│   └── collector-cronjob.yaml
│
├── postgresql
│   ├── postgresql-secret.yaml
│   ├── postgresql-service.yaml
│   ├── postgresql-pvc.yaml
│   └── postgresql-statefulset.yaml
│
└── redis
    ├── redis-deployment.yaml
    └── redis-service.yaml
```

---

# Notes

* StorageClass는 Kubernetes 클러스터 구성 후 설정 예정입니다.
* Collector 이미지 이름은 CI/CD 파이프라인에서 설정될 예정입니다.
* Namespace는 클러스터 아키텍처 설계 후 적용 예정입니다.

---

# Deployment Order

Kubernetes 리소스는 아래 순서로 배포합니다.

1. PostgreSQL
2. Redis
3. Collector

예시

kubectl apply -f postgresql/
kubectl apply -f redis/
kubectl apply -f collector/