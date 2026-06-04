"use client";

import { motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";

const BLOCKS = [
  "vpc", "subnet", "security_group", "ec2_instance", "alb", "rds", "igw", "nat_gateway",
  "route_table", "s3_bucket", "s3_website", "target_group", "launch_template", "lambda",
  "dynamodb", "kms_key", "iam_role", "eks_cluster", "eks_nodegroup", "transit_gateway",
  "vpn_gateway", "cloudtrail", "api_gateway", "eventbridge", "vpc_endpoint",
];

export default function BuildingBlocks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-400">
          <MousePointerClick className="h-3.5 w-3.5" /> Visual designer
        </span>
        <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Or design your own — block by block</h2>
        <p className="mt-4 text-slate-400">
          Drag {BLOCKS.length} infrastructure blocks onto a canvas, wire them together with type-checked
          connections, and our compiler turns the graph into a runnable Ansible project — the same pipeline the
          templates use.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-2.5">
        {BLOCKS.map((b, i) => (
          <motion.span
            key={b}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (i % 8) * 0.03 }}
            className="rounded-lg border border-white/10 bg-panel px-3 py-1.5 font-mono text-xs text-slate-300 transition hover:border-brand/40 hover:text-white"
          >
            {b}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
