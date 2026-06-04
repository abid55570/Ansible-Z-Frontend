export type PciLevel = "core" | "capable" | "scope-reducer" | "none";

export interface TemplateCard {
  slug: string;
  name: string;
  pci: PciLevel;
  summary: string;
}

/** The 11 infrastructure blueprints offered by the platform. */
export const TEMPLATES: TemplateCard[] = [
  { slug: "web-3tier", name: "Secure 3-Tier Web App", pci: "capable", summary: "Public ALB → private app tier → private DB, with bastion/SSM admin." },
  { slug: "ha-multi-az", name: "Multi-AZ High Availability", pci: "none", summary: "Auto-scaling app across AZs + RDS Multi-AZ failover." },
  { slug: "dr-multi-region", name: "Multi-Region DR", pci: "none", summary: "Primary + warm standby region with Route 53 failover." },
  { slug: "landing-zone-hub-spoke", name: "Hub-and-Spoke Landing Zone", pci: "capable", summary: "Transit Gateway, multi-account, central egress & logging." },
  { slug: "pci-cde-enclave", name: "PCI CDE Enclave", pci: "core", summary: "Isolated cardholder-data environment with vault, FIM, AV & logging." },
  { slug: "k8s-platform", name: "Kubernetes Platform", pci: "capable", summary: "EKS private nodes, ingress + WAF, mesh mTLS, network policies." },
  { slug: "hybrid-onprem-cloud", name: "Hybrid On-Prem ↔ Cloud", pci: "capable", summary: "Direct Connect / VPN boundary between data center and cloud." },
  { slug: "zero-trust", name: "Zero-Trust Access", pci: "core", summary: "SSM, PrivateLink, mTLS, IdP + MFA — no bastion, deny by default." },
  { slug: "serverless-eventdriven", name: "Serverless Event-Driven", pci: "scope-reducer", summary: "API Gateway + Lambda + managed data — minimal audit surface." },
  { slug: "immutable-blue-green", name: "Immutable Blue/Green", pci: "capable", summary: "Golden-AMI pipeline with zero-downtime blue/green deploys." },
  { slug: "vietpay-bastion-alb", name: "Bastion + Control + ALB", pci: "capable", summary: "Bastion → private Ansible control host → app fleet behind an ALB." },
];

export const PCI_LABEL: Record<PciLevel, string> = {
  core: "PCI · core",
  capable: "PCI · capable",
  "scope-reducer": "PCI · scope-reducer",
  none: "general",
};
