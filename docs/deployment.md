# Deployment Guide

## Architecture

This project deploys a React frontend, Node.js backend, and PostgreSQL database on AWS:

- React frontend builds to static assets and deploys to S3 static website hosting.
- Node.js backend builds as a Docker image and runs on an EC2 instance on port `8080`.
- RDS PostgreSQL runs in private subnets and only accepts traffic from the backend security group.
- Pulumi provisions networking, IAM, S3, EC2, ECR, RDS, SSM parameters, CloudWatch logs, and alarms.
- GitHub Actions builds, tests, pushes the backend Docker image, deploys the frontend to S3, and updates the backend container over SSH with rollback.

CloudFront is wired into the workflow as an optional cache invalidation step if `CLOUDFRONT_DISTRIBUTION_ID` is configured.

## Prerequisites

Install these locally:

- Node.js
- Docker Desktop
- AWS CLI
- Pulumi CLI
- Git

Configure AWS credentials locally before running Pulumi:

```bash
aws configure
```

Install all local dependencies:

```bash
npm run install:all
cd infra
npm install
```

## Pulumi Setup

Create a Pulumi stack:

```bash
cd infra
pulumi stack init dev
```

Set required config:

```bash
pulumi config set aws:region us-east-1
pulumi config set allowedSshCidr YOUR_PUBLIC_IP/32
pulumi config set dbName appdb
pulumi config set dbUsername appuser
pulumi config set dbPassword YOUR_DATABASE_PASSWORD --secret
pulumi config set keyPairPublicKey "ssh-rsa YOUR_PUBLIC_KEY"
```

Preview and deploy:

```bash
pulumi preview
pulumi up
```

Save these Pulumi outputs for GitHub Secrets:

```bash
pulumi stack output frontendBucketName
pulumi stack output backendPublicIp
pulumi stack output backendApiUrl
pulumi stack output backendRepositoryUrl
pulumi stack output alertsTopicArn
```

## GitHub Secrets

Add these repository secrets:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
FRONTEND_BUCKET_NAME
VITE_API_URL
ECR_REPOSITORY
EC2_HOST
EC2_USER
EC2_SSH_PRIVATE_KEY
CLOUDFRONT_DISTRIBUTION_ID
```

Notes:

- `VITE_API_URL` should look like `http://EC2_PUBLIC_IP:8080/api`.
- `ECR_REPOSITORY` is the ECR repository name, not the full repository URL.
- `EC2_USER` is usually `ec2-user` for Amazon Linux 2.
- `CLOUDFRONT_DISTRIBUTION_ID` can be blank if CloudFront is not implemented.

## Deployment Flow

Push to `main`:

```bash
git add .
git commit -m "Add cloud deployment infrastructure"
git push origin main
```

GitHub Actions will:

1. Install backend dependencies and run backend tests.
2. Install frontend dependencies and run frontend tests.
3. Build the frontend with the deployed API URL.
4. Sync frontend assets to S3.
5. Invalidate CloudFront if configured.
6. Build and push the backend Docker image to ECR.
7. SSH into EC2, replace the running backend container, health-check it, and roll back on failure.

## Security Controls

IAM:

- EC2 uses an instance profile.
- Backend runtime permissions are limited to required SSM parameter reads and CloudWatch log writes.
- GitHub Actions should use a least-privilege IAM user or role scoped to S3 deploys, ECR image pushes, and CloudFront invalidation if used.
- Database credentials are stored in SSM Parameter Store, with the password stored as `SecureString`.

Networking:

- Backend EC2 is in a public subnet and exposes SSH plus API port `8080`.
- RDS is in private subnets.
- RDS security group only allows PostgreSQL `5432` from the backend security group.
- SSH should be restricted to your IP with `allowedSshCidr`.

## Monitoring

Pulumi creates:

- CloudWatch log group `/full-stack-app/backend`
- API request-count metric from backend request logs
- API 5xx error-count metric from backend request logs
- EC2 CPU alarm
- RDS database connection alarm
- API error alarm
- API no-traffic health alarm
- SNS topic for alert notifications

To complete alert notifications, subscribe your email to the SNS topic:

```bash
aws sns subscribe --topic-arn TOPIC_ARN --protocol email --notification-endpoint YOUR_EMAIL
```

Confirm the subscription from your email inbox.

## Verification Checklist

Verify these before recording the video:

- S3 bucket contains frontend build files.
- Frontend URL loads in the browser.
- `http://EC2_PUBLIC_IP:8080/api/health` returns `{"status":"OK"}`.
- Frontend displays the backend message.
- Backend returns rows from RDS at `/api/data`.
- RDS is not publicly accessible.
- RDS security group only allows backend security group access.
- GitHub Actions shows a successful build and deployment.
- CloudWatch log group has backend request logs.
- CloudWatch alarms exist for API, EC2, and RDS health.
- SNS alert subscription exists and is confirmed.

## Video Deliverables

Show these screens in order:

1. GitHub repository with source code, Dockerfiles, Pulumi, workflow, and docs.
2. GitHub Actions workflow running or completed successfully.
3. Pulumi stack outputs and AWS resources created.
4. S3 frontend bucket and deployed frontend URL.
5. EC2 instance running Docker backend.
6. Backend health endpoint in browser.
7. Frontend calling backend and displaying data.
8. RDS database in private subnet and security group rules.
9. IAM role/instance profile and SSM parameters.
10. CloudWatch logs, metrics, alarms, and SNS alert topic.
