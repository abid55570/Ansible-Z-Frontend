export type PciLevel = "core" | "capable" | "scope-reducer" | "none";
export type Tier = "starter" | "enterprise";

export interface TemplateCard {
  slug: string;
  name: string;
  pci: PciLevel;
  tier: Tier;
  summary: string;
}

/** The infrastructure blueprints offered by the platform (landing-page showcase). */
export const TEMPLATES: TemplateCard[] = [
  // Starter tier — small, single-purpose, provision in minutes.
  { slug: "single-vm-app", name: "Single VM App", pci: "none", tier: "starter", summary: "One Docker-ready EC2 in a public subnet — provision, then ship apps with the Day-2 layer." },
  { slug: "simple-static-site", name: "Simple Static Site", pci: "none", tier: "starter", summary: "An S3 bucket configured for public static website hosting — host a site with no servers." },
  { slug: "basic-secure-vpc", name: "Basic Secure VPC", pci: "capable", tier: "starter", summary: "Public + private subnets, IGW, NAT egress and a locked-down base security group." },
  // Enterprise tier — full, audit-ready blueprints.
  { slug: "web-3tier", name: "Secure 3-Tier Web App", pci: "capable", tier: "enterprise", summary: "Public ALB → private app tier → private DB, with bastion/SSM admin." },
  { slug: "ha-multi-az", name: "Multi-AZ High Availability", pci: "none", tier: "enterprise", summary: "Auto-scaling app across AZs + RDS Multi-AZ failover." },
  { slug: "dr-multi-region", name: "Multi-Region DR", pci: "none", tier: "enterprise", summary: "Primary + warm standby region with Route 53 failover." },
  { slug: "landing-zone-hub-spoke", name: "Hub-and-Spoke Landing Zone", pci: "capable", tier: "enterprise", summary: "Transit Gateway, multi-account, central egress & logging." },
  { slug: "pci-cde-enclave", name: "PCI CDE Enclave", pci: "core", tier: "enterprise", summary: "Isolated cardholder-data environment with vault, FIM, AV & logging." },
  { slug: "k8s-platform", name: "Kubernetes Platform", pci: "capable", tier: "enterprise", summary: "EKS private nodes, ingress + WAF, mesh mTLS, network policies." },
  { slug: "hybrid-onprem-cloud", name: "Hybrid On-Prem ↔ Cloud", pci: "capable", tier: "enterprise", summary: "Direct Connect / VPN boundary between data center and cloud." },
  { slug: "zero-trust", name: "Zero-Trust Access", pci: "core", tier: "enterprise", summary: "SSM, PrivateLink, mTLS, IdP + MFA — no bastion, deny by default." },
  { slug: "serverless-eventdriven", name: "Serverless Event-Driven", pci: "scope-reducer", tier: "enterprise", summary: "API Gateway + Lambda + managed data — minimal audit surface." },
  { slug: "immutable-blue-green", name: "Immutable Blue/Green", pci: "capable", tier: "enterprise", summary: "Golden-AMI pipeline with zero-downtime blue/green deploys." },
  { slug: "vietpay-bastion-alb", name: "Bastion + Control + ALB", pci: "capable", tier: "enterprise", summary: "Bastion → private Ansible control host → app fleet behind an ALB." },
  { slug: "wordpress-lamp", name: "WordPress on LAMP", pci: "none", tier: "enterprise", summary: "A WordPress web server (Apache/PHP) backed by a managed RDS MySQL database." },
  { slug: "ecs-fargate-service", name: "ECS Fargate Service", pci: "capable", tier: "enterprise", summary: "Serverless containers behind an Application Load Balancer — no servers to manage." },
  { slug: "static-spa-cloudfront", name: "Static SPA on CloudFront", pci: "none", tier: "enterprise", summary: "A single-page app served globally over HTTPS from a private S3 origin." },
  { slug: "data-lake-analytics", name: "Data Lake + Analytics", pci: "scope-reducer", tier: "enterprise", summary: "An S3 data lake with a Glue crawler + ETL job, query-ready for Athena." },
  { slug: "kong-ecs-microservices", name: "Kong + ECS Microservices", pci: "capable", tier: "enterprise", summary: "VPN-only access → ALB → Kong API gateway → private ECS Fargate microservices + RDS MySQL." },
  { slug: "sqs-worker-queue", name: "SQS Worker Queue", pci: "scope-reducer", tier: "enterprise", summary: "Decoupled async processing: SQS queue + dead-letter queue, SNS topic, and a Lambda worker." },
  { slug: "backup-vault-dr", name: "Centralized Backup Vault", pci: "capable", tier: "enterprise", summary: "AWS Backup vault with a scheduled plan and a tag-based selection across services." },
];

export const PCI_LABEL: Record<PciLevel, string> = {
  core: "PCI · core",
  capable: "PCI · capable",
  "scope-reducer": "PCI · scope-reducer",
  none: "general",
};
