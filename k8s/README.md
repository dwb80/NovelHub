# NovelHub Kubernetes 生产部署配置

**版本**: 1.0.0  
**最后更新**: 2026-04-15  
**优先级**: P2

---

## 1. 架构概述

### 1.1 部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Ingress Controller                       │
│                    (NGINX / Traefik / ALB)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Frontend       │ │   Backend API    │ │   Admin Panel    │
│   (Next.js)      │ │   (NestJS)       │ │   (Next.js)      │
│                  │ │                  │ │                  │
│  Replicas: 3     │ │  Replicas: 5     │ │  Replicas: 2     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │   Redis          │ │   OpenSearch     │
│   (Primary)      │ │   (Cluster)      │ │   (Cluster)      │
│                  │ │                  │ │                  │
│  Replicas: 2     │ │  Replicas: 3     │ │  Replicas: 3     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 2. 快速开始

### 2.1 前置要求

- Kubernetes 1.25+
- kubectl
- Helm 3.x
- 域名和 SSL 证书

### 2.2 部署步骤

```bash
# 1. 创建命名空间
kubectl create namespace novelhub

# 2. 部署基础设施
kubectl apply -k k8s/overlays/production

# 3. 验证部署
kubectl get pods -n novelhub
kubectl get svc -n novelhub
kubectl get ingress -n novelhub
```

---

## 3. 配置文件说明

### 3.1 目录结构

```
k8s/
├── base/                          # 基础配置
│   ├── frontend/                  # 前端服务
│   ├── backend/                   # 后端 API
│   ├── worker/                    # 异步任务 Worker
│   ├── postgres/                  # PostgreSQL
│   ├── redis/                     # Redis
│   └── opensearch/                # OpenSearch
├── overlays/                      # 环境覆盖配置
│   ├── development/               # 开发环境
│   ├── staging/                   # 测试环境
│   └── production/                # 生产环境
└── README.md                      # 本文件
```

### 3.2 核心配置

#### 前端部署

```yaml
# base/frontend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: novelhub-frontend
  namespace: novelhub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: novelhub-frontend
  template:
    metadata:
      labels:
        app: novelhub-frontend
    spec:
      containers:
        - name: frontend
          image: novelhub/frontend:latest
          ports:
            - containerPort: 3000
          env:
            - name: NEXT_PUBLIC_API_URL
              value: "https://api.novelhub.com"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

#### 后端 API 部署

```yaml
# base/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: novelhub-backend
  namespace: novelhub
spec:
  replicas: 5
  selector:
    matchLabels:
      app: novelhub-backend
  template:
    metadata:
      labels:
        app: novelhub-backend
    spec:
      containers:
        - name: backend
          image: novelhub/backend:latest
          ports:
            - containerPort: 4000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: novelhub-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: novelhub-secrets
                  key: redis-url
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
```

#### Worker 部署

```yaml
# base/worker/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: novelhub-worker-evolution
  namespace: novelhub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: novelhub-worker-evolution
  template:
    metadata:
      labels:
        app: novelhub-worker-evolution
    spec:
      containers:
        - name: worker
          image: novelhub/backend:latest
          command: ["npm", "run", "worker:evolution"]
          resources:
            requests:
              memory: "1Gi"
              cpu: "1000m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
```

#### 自动扩缩容 (HPA)

```yaml
# base/backend/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: novelhub-backend-hpa
  namespace: novelhub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: novelhub-backend
  minReplicas: 5
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

---

## 4. 运维命令

### 4.1 查看状态

```bash
# 查看所有 Pod
kubectl get pods -n novelhub

# 查看服务
kubectl get svc -n novelhub

# 查看 Ingress
kubectl get ingress -n novelhub

# 查看 HPA
kubectl get hpa -n novelhub
```

### 4.2 日志查看

```bash
# 查看后端日志
kubectl logs -f deployment/novelhub-backend -n novelhub

# 查看 Worker 日志
kubectl logs -f deployment/novelhub-worker-evolution -n novelhub

# 查看特定 Pod 日志
kubectl logs -f pod/novelhub-backend-xxx -n novelhub
```

### 4.3 扩缩容

```bash
# 手动扩容
kubectl scale deployment novelhub-backend --replicas=10 -n novelhub

# 滚动更新
kubectl set image deployment/novelhub-backend backend=novelhub/backend:v1.1.0 -n novelhub

# 回滚
kubectl rollout undo deployment/novelhub-backend -n novelhub
```

---

## 5. 监控集成

部署后会自动集成以下监控：

- **Prometheus**: 指标收集
- **Grafana**: 可视化
- **Loki**: 日志聚合
- **Jaeger**: 分布式追踪

访问地址：
- Grafana: https://grafana.novelhub.com
- Prometheus: https://prometheus.novelhub.com
- Jaeger: https://jaeger.novelhub.com

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15
