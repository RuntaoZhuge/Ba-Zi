# Kubernetes Deployment

## Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- ArgoCD (optional, for GitOps)
- NGINX Ingress Controller
- cert-manager (for TLS)

## Environment Variables Setup

### 1. Create Secret File

Copy the secret template and fill in your values:

```bash
cd deploy/
cp secret.yaml.example secret.yaml
```

Edit `secret.yaml` and replace `your-deepseek-api-key-here` with your actual DeepSeek API key.

**⚠️ IMPORTANT:** Never commit `secret.yaml` to version control. It's already in `.gitignore`.

### 2. Apply Secret to Cluster

```bash
kubectl apply -f secret.yaml
```

Verify the secret was created:

```bash
kubectl get secret bazi-secrets -n bazi-prod
```

## Deployment

### Manual Deployment

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Apply secret (see above)
kubectl apply -f secret.yaml

# Deploy application
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

### With ArgoCD (Recommended)

1. Create an ArgoCD Application pointing to this repository
2. Set `path: bazi/deploy`
3. Enable auto-sync
4. **Manually apply the secret first** (secrets should not be in GitOps repo)

## Configuration

### Update Domain

Edit [ingress.yaml](ingress.yaml) and replace `bazi.yourdomain.com` with your actual domain:

```yaml
spec:
  tls:
  - hosts:
    - your-domain.com  # ← Change this
    secretName: bazi-tls
  rules:
  - host: your-domain.com  # ← Change this
```

### Update Image Tag

By default, deployment uses `:latest`. For production, consider using specific tags:

```yaml
image: ghcr.io/runtaozhuge/bazi-web:v1.0.0
```

## Monitoring

```bash
# Check pod status
kubectl get pods -n bazi-prod

# View logs
kubectl logs -f -n bazi-prod -l app=bazi-web

# Check health endpoint
kubectl port-forward -n bazi-prod svc/bazi-web 3000:80
curl http://localhost:3000/api/health
```

## Scaling

```bash
# Scale replicas
kubectl scale deployment bazi-web -n bazi-prod --replicas=3

# Or edit deployment.yaml and change `replicas: 2` to desired count
```
