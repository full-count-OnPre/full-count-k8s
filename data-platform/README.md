# Data Platform

`data-platform` 디렉토리는 **Full Count 프로젝트의 데이터 플랫폼 구성
요소를 정의하는 Kubernetes YAML 파일**을 포함합니다.

데이터 플랫폼은 다음 역할을 담당합니다.

-   MLB API 데이터 수집 및 정규화
-   캐시 시스템 운영 (Redis)
-   영구 데이터 저장 (PostgreSQL)

------------------------------------------------------------------------

# Architecture

## System Architecture

    MLB API
       │
       ▼
    Data Collector (Namespace: data)
       │
    ┌──┴───────────┐
    ▼              ▼
    Redis      PostgreSQL (Namespace: db)
    (Namespace: data)
       │              │
       └──────┬───────┘
              ▼
         Backend API (Namespace: app)
              │
              ▼
           Frontend (Namespace: app)
              │
              ▼
             Users

------------------------------------------------------------------------

# Data Flow

1.  Collector가 **MLB API에서 데이터를 수집**합니다.
2.  수집된 데이터는 **Redis(Cache)** 와 **PostgreSQL(Persistent
    Storage)** 에 저장됩니다.
3.  Backend API는 **FQDN 주소를 통해 Redis 또는 PostgreSQL에서 데이터를
    조회**합니다.
4.  Frontend는 Backend API를 통해 데이터를 받아 사용자에게 제공합니다.

------------------------------------------------------------------------

# Components

## PostgreSQL (Namespace: db)

PostgreSQL은 프로젝트의 **영구 데이터 저장소(Persistent Storage)**
입니다.

### Kubernetes Resources

  Resource                Description
  ----------------------- ---------------------------------------------------
  StatefulSet             PostgreSQL Pod 관리 및 고유 식별자 유지
  Service                 db 네임스페이스 외부 접근을 위한 서비스 주소 제공
  PersistentVolumeClaim   데이터 영구 저장용 스토리지 요청
  Secret                  DB Root/User 인증 정보 및 DATABASE_URL 관리

### Connection Information

  Key                 Value
  ------------------- -------------------------------------------
  FQDN Service Name   `postgresql-service.db.svc.cluster.local`
  Port                `5432`
  Database Name       `fullcount`
  Secret Name         `postgresql-secret`

------------------------------------------------------------------------

## Redis (Namespace: data)

Redis는 **캐시 및 실시간 데이터 처리 시스템**입니다.

### Kubernetes Resources

  Resource     Description
  ------------ -----------------------------------------------------
  Deployment   Redis Pod 실행
  Service      data 네임스페이스 외부 접근을 위한 서비스 주소 제공

### Connection Information

  Key                 Value
  ------------------- ----------------------------------------
  FQDN Service Name   `redis-service.data.svc.cluster.local`
  Port                `6379`

------------------------------------------------------------------------

## MLB Data Collector (Namespace: data)

Collector는 MLB API 데이터를 **주기적으로 수집하여 Redis 및 PostgreSQL에
저장하는 서비스**입니다.

### Execution & Schedule

  Resource             Description
  -------------------- ------------------------------
  Kubernetes CronJob   데이터 수집 작업 실행
  Schedule             `*/5 * * * *` (5분마다 실행)
  ConfigMap            `collector-config`

ConfigMap에는 다음 환경변수가 포함됩니다.

    REDIS_HOST
    POSTGRES_HOST

모두 **FQDN 주소를 참조하도록 설정**되어 있습니다.

------------------------------------------------------------------------

# Backend Connection Information

Backend 서비스(`app` 네임스페이스)는 **네임스페이스 간 통신을 위해
FQDN(Fully Qualified Domain Name)** 을 사용합니다.

### Environment Variables

``` bash
# Redis Connection
REDIS_HOST=redis-service.data.svc.cluster.local
REDIS_PORT=6379

# PostgreSQL Connection (via Secret)
DATABASE_URL=postgresql://[USER]:[PASS]@postgresql-service.db.svc.cluster.local:5432/fullcount
```

------------------------------------------------------------------------

# Directory Structure

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

------------------------------------------------------------------------

# Notes

### StorageClass

클러스터 환경(NFS / Local)에 맞게\
`postgresql-pvc.yaml`의 `storageClassName`을 업데이트해야 합니다.

### Namespace

본 리소스들은 다음 네임스페이스에 배포됩니다.

-   `db`
-   `data`

### DNS Resolution

네임스페이스 간 통신을 위해\
**모든 접속 정보는 짧은 이름이 아닌 FQDN을 사용합니다.**

------------------------------------------------------------------------

# Deployment Order

### 1️⃣ Namespace 생성 (이미 존재하지 않을 경우)

``` bash
kubectl create namespace db
kubectl create namespace data
```

### 2️⃣ PostgreSQL 배포

``` bash
kubectl apply -f postgresql/ -n db
```

### 3️⃣ Redis 배포

``` bash
kubectl apply -f redis/ -n data
```

### 4️⃣ Collector 배포

``` bash
kubectl apply -f collector/ -n data
```
