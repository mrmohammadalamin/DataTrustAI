import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileCode,
  GitBranch,
  GitPullRequest,
  Layers,
  Lock,
  Network,
  Pause,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from 'lucide-react';

type MindmapViewMode =
  | 'OVERALL_MINDMAP'
  | 'AGENTIC_WORKFLOW'
  | 'MODULE_ARCHITECTURE'
  | 'TUTORIALS_AND_GCP_SETUP';

interface MindmapNodeData {
  id: string;
  title: string;
  subtitle: string;
  category: 'CORE' | 'DATA_ESTATE' | 'SECURITY' | 'AGENTIC_LOOP' | 'VERIFICATION' | 'GTM_DEPLOY';
  x: number;
  y: number;
  color: string;
  parentId?: string;
  activity: string;
  technicalDetails: string[];
  sampleOutput: string;
  problemSolved: string;
}

interface AgentStageStep {
  stepNumber: number;
  stageCode: string;
  agentName: string;
  modelOrEngine: string;
  color: string;
  inputTrigger: string;
  activities: string[];
  outputTitle: string;
  outputPayload: string;
  businessValue: string;
}

const OVERALL_MINDMAP_NODES: MindmapNodeData[] = [
  {
    id: 'core-hub',
    title: 'DataTrust AI Control Plane',
    subtitle: 'Cloud Run + FastAPI + Vertex AI',
    category: 'CORE',
    x: 500,
    y: 290,
    color: '#3b82f6',
    activity:
      'Orchestrates read-only telemetry ingestion, multi-agent root-cause diagnosis, 5-Gate SQL sandbox verification, and human-governed GitOps remediation across Google Cloud and Multi-Cloud.',
    technicalDetails: [
      'Stateless Cloud Run v2 Container (Python 3.13 FastAPI + React 19 TypeScript)',
      'Zero-Data-Exfiltration: Customer raw rows never leave customer VPC',
      'Cryptographic SHA-256 audit logging for every AI & human action',
    ],
    sampleOutput: `{
  "control_plane": "datatrust-ai-control-plane",
  "mode": "ZERO_DATA_EXFILTRATION",
  "active_connectors": 12,
  "closed_loop_stages": ["01_DETECT", "02_DIAGNOSE", "03_REPAIR", "04_VERIFY", "05_PR", "06_APPROVE"],
  "trust_score": 99.4
}`,
    problemSolved:
      'Eliminates the fragmented gap between passive alert-only observability tools and risky unverified AI SQL generators.',
  },
  // Left-Top: Data Estate
  {
    id: 'branch-data-estate',
    title: '1. Multi-Cloud & GCP Data Estate',
    subtitle: '12 Read-Only Database Adapters',
    category: 'DATA_ESTATE',
    x: 170,
    y: 110,
    color: '#06b6d4',
    parentId: 'core-hub',
    activity:
      'Connects via Workload Identity Federation (datatrust-agent-ro) to inspect INFORMATION_SCHEMA, query plans, CDC lag, and Dataplex DQ scans without write privileges.',
    technicalDetails: [
      'Analytical & Operational GCP: BigQuery, AlloyDB, Cloud Spanner, Cloud SQL, Bigtable, Firestore',
      'Pipelines & BI: Datastream, Dataflow, Cloud Composer (Airflow/dbt), Dataplex, Looker',
      'Cross-Cloud Federation: Snowflake, Databricks, AWS Redshift/S3 & Azure Synapse (BigQuery Omni)',
    ],
    sampleOutput: `{
  "connector_id": "conn-alloydb-prod",
  "service": "AlloyDB for PostgreSQL",
  "auth_mode": "WORKLOAD_IDENTITY_READ_ONLY",
  "schema_tables_discovered": 42,
  "latency_ms": 14.2,
  "write_permissions": false
}`,
    problemSolved:
      'Provides unified cross-engine visibility when an operational schema change in AlloyDB or Spanner silently breaks a downstream BigQuery mart or Looker KPI.',
  },
  // Left-Bottom: Security & IAP Gate
  {
    id: 'branch-security',
    title: '2. Zero-Trust IAP & RBAC Gate',
    subtitle: 'Cloud IAP + OIDC + 4-Tier RBAC',
    category: 'SECURITY',
    x: 170,
    y: 290,
    color: '#10b981',
    parentId: 'core-hub',
    activity:
      'Intercepts every user request at the Google Cloud Load Balancer via Identity-Aware Proxy (IAP), validates cryptographic JWT assertions, and enforces server-side RBAC.',
    technicalDetails: [
      'Header verified: X-Goog-IAP-JWT-Assertion (ES256 Google signature)',
      '4 Roles: DATA_VIEWER, DATA_ENGINEER, DATA_GOVERNANCE_APPROVER, GCP_PARTNER_ADMIN',
      'HTTP 403 Forbidden returned immediately on unauthorized approval or connector mutation',
    ],
    sampleOutput: `{
  "authenticated_user": "elena.rostova@globalretail.com",
  "role": "DATA_GOVERNANCE_APPROVER",
  "auth_provider": "GOOGLE_CLOUD_IAP",
  "gcp_iam_binding": "roles/dataplex.dataOwner",
  "permissions": ["VIEW_INCIDENTS", "RUN_5_GATE_SANDBOX", "APPROVE_PRODUCTION_PR"]
}`,
    problemSolved:
      'Ensures neither unauthorized users nor autonomous AI agents can push unapproved changes into production data pipelines.',
  },
  // Bottom-Left: Deployment & Partner GTM
  {
    id: 'branch-gtm',
    title: '3. Deployment & Partner Ecosystem',
    subtitle: 'Options A/B/C & Partner Routes 1/2/3',
    category: 'GTM_DEPLOY',
    x: 170,
    y: 470,
    color: '#a855f7',
    parentId: 'core-hub',
    activity:
      'Packages DataTrust AI for Google Cloud Marketplace self-hosted deployment, Vertex AI Agent Builder native deployment, and Multi-Tenant GSI Partner command centers.',
    technicalDetails: [
      'Option A: Customer VPC Cloud Run + Terraform IaC (deploy/terraform/main.tf)',
      'Option B: Vertex AI Agent Engine + Gemini 3.1 Pro (gemini-3.1-pro-preview) & Gemini 3 Flash Native',
      'Option C: Embedded Looker Action Hub & Dataplex Governance Extension',
    ],
    sampleOutput: `{
  "deployment_option": "OPTION_A_CLOUD_RUN_VPC",
  "service_account": "datatrust-agent-ro@customer-prod.iam.gserviceaccount.com",
  "partner_route": "ROUTE_2_MANAGED_DATA_TRUST_MSP",
  "mttr_reduction": "94.2%"
}`,
    problemSolved:
      'Allows regulated enterprises (Healthcare, Banking, Retail) and Google Cloud Partners (Deloitte, Accenture, Wipro, SADA) to deploy inside strict VPC boundaries.',
  },
  // Right-Top: 6-Stage Agentic Loop
  {
    id: 'branch-agentic-loop',
    title: '4. 6-Stage Autonomous Agentic Loop',
    subtitle: 'Detect -> Diagnose -> Repair -> Verify -> PR -> Approve',
    category: 'AGENTIC_LOOP',
    x: 830,
    y: 110,
    color: '#f59e0b',
    parentId: 'core-hub',
    activity:
      'Executes 6 specialized agents in a closed loop: detecting metric drift, traversing cross-DB lineage, ranking 6 root-cause hypotheses, and synthesizing dialect-accurate SQL fixes.',
    technicalDetails: [
      'Stage 01-02: Anomaly detection + 6-hypothesis Bayesian root-cause ranking (96.8% confidence)',
      'Stage 03: Dialect-aware SQL/dbt patch synthesis (BigQuery, PostgreSQL, GoogleSQL, Snowflake)',
      'Stage 04-06: 5-Gate Sandbox Proof -> Signed Git PR -> Human Governance Approval',
    ],
    sampleOutput: `{
  "incident_id": "INC-2026-001",
  "root_cause": "Duplicate webhook retries on order_id in stg_alloydb_payments",
  "synthesized_patch": "QUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) = 1",
  "confidence": 0.968
}`,
    problemSolved:
      'Compresses Mean-Time-To-Resolution (MTTR) from 18+ hours of manual war-room debugging down to under 5 minutes.',
  },
  // Right-Middle: 5-Gate Verification Sandbox
  {
    id: 'branch-verification',
    title: '5. Deterministic 5-Gate Sandbox',
    subtitle: 'Mathematical Before/After Proof Engine',
    category: 'VERIFICATION',
    x: 830,
    y: 290,
    color: '#ec4899',
    parentId: 'core-hub',
    activity:
      'Executes candidate SQL fixes inside an isolated ephemeral sandbox and mathematically proves that the exact metric variance is eliminated before any human is asked to approve.',
    technicalDetails: [
      'Gate 1: AST Destructive SQL Guardrail (Blocks DROP, DELETE, TRUNCATE, UPDATE, GRANT)',
      'Gate 2 & 3: IAM Policy Tag PII Verification + BigQuery Dry-Run Cost Estimator ($0.007)',
      'Gate 4 & 5: Live Before/After SQL Reconciliation (-$148,500.00 phantom rev removed) + 14/14 dbt tests',
    ],
    sampleOutput: `{
  "all_gates_passed": true,
  "before_metric": "$1,428,500.00 (3 duplicate order_ids)",
  "after_metric": "$1,280,000.00 (0 duplicate order_ids)",
  "variance_eliminated": "-$148,500.00",
  "sha256_proof": "8f9d2a7e4c1b...63e19a"
}`,
    problemSolved:
      'Solves the #1 enterprise barrier to AI adoption in data engineering: "How do we know the AI SQL patch will not corrupt production or explode cloud costs?"',
  },
  // Right-Bottom: Governed AI SQL Analytics
  {
    id: 'branch-analytics',
    title: '6. Governed NL-to-SQL Studio',
    subtitle: 'Self-Service BI on Verified Gold Views',
    category: 'VERIFICATION',
    x: 830,
    y: 470,
    color: '#6366f1',
    parentId: 'core-hub',
    activity:
      'Translates natural-language business questions into read-only, AST-validated SQL queries executed strictly against 5-Gate verified tables with automatic PII masking.',
    technicalDetails: [
      'Blocks querying unverified/broken tables or warns when upstream incidents exist',
      'Enforces Dataplex Policy Tags (PII_REDACTED) on customer email/tax identifiers',
      'Attaches live Trust & Lineage Provenance Certificate to every query result',
    ],
    sampleOutput: `{
  "question": "Compare broken vs 5-Gate verified net revenue in BigQuery",
  "ast_safety_check": "PASSED_READ_ONLY",
  "rows_returned": 2,
  "provenance_badge": "CERTIFIED_GOLD_VIEW_SHA256"
}`,
    problemSolved:
      'Empowers executives and analysts to query trusted data in plain English without risking SQL injection or reading corrupted/unverified numbers.',
  },
];

const AGENTIC_WORKFLOW_STEPS: AgentStageStep[] = [
  {
    stepNumber: 1,
    stageCode: '01_DETECT',
    agentName: 'Sentinel Telemetry & Drift Detector Agent',
    modelOrEngine: 'Dataplex DQ API + INFORMATION_SCHEMA Poller + Z-Score Engine',
    color: '#ef4444',
    inputTrigger:
      'Scheduled 60s metadata poll or real-time Pub/Sub webhook from Cloud Composer / Dataplex / Monte Carlo.',
    activities: [
      'Scans BigQuery INFORMATION_SCHEMA.PARTITIONS and Datastream CDC replication lag metrics.',
      'Detects a +11.6% ($148,500.00) sudden spike in bq_fct_daily_revenue_broken compared to AlloyDB source orders.',
      'Flags downstream Looker Executive Board Dashboard as AT_RISK and pauses automated executive email distribution.',
    ],
    outputTitle: 'Structured Anomaly Event Payload (JSON)',
    outputPayload: `{
  "incident_id": "INC-2026-001",
  "stage": "01_DETECT",
  "severity": "CRITICAL",
  "source_system": "AlloyDB -> Datastream -> BigQuery",
  "metric_name": "Net Recognized Daily Revenue (USD)",
  "expected_value": "$1,280,000.00",
  "reported_value": "$1,428,500.00",
  "variance_delta": "+$148,500.00 (+11.6% Phantom Inflation)",
  "downstream_assets_protected": ["Looker: CFO Executive Revenue Pulse"]
}`,
    businessValue:
      'Catches silent data corruption before executives make decisions on inflated or missing financial metrics.',
  },
  {
    stepNumber: 2,
    stageCode: '02_DIAGNOSE',
    agentName: 'Cross-System Lineage & Root-Cause Investigator Agent',
    modelOrEngine: 'Vertex AI Gemini 3.1 Pro (gemini-3.1-pro-preview) + Column DAG Analyzer',
    color: '#f59e0b',
    inputTrigger: 'Anomaly Event INC-2026-001 + Cross-Database Lineage Graph (AlloyDB -> BigQuery -> Looker).',
    activities: [
      'Traverses column-level lineage backward from Looker measure total_net_revenue to BigQuery mart and AlloyDB CDC tables.',
      'Evaluates 6 competing root-cause hypotheses in parallel (Schema Drift, PK Duplication, Late CDC Watermark, Currency Join Fanout, Null Filter Drop, Timezone Shift).',
      'Identifies that payment gateway retry webhooks inserted 3 duplicate CAPTURED rows for ORD-1001, ORD-1002, and ORD-1004, causing a 1-to-many join fanout.',
    ],
    outputTitle: 'Root-Cause Attribution & 6-Hypothesis Matrix',
    outputPayload: `{
  "incident_id": "INC-2026-001",
  "stage": "02_DIAGNOSE",
  "winning_hypothesis": "H1_PAYMENT_WEBHOOK_RETRY_FANOUT",
  "confidence_score": 96.8,
  "root_cause_node": "bigquery.stg_alloydb_payments",
  "evidence_query": "SELECT order_id, COUNT(*) c FROM alloydb_payments WHERE status='CAPTURED' GROUP BY 1 HAVING c > 1",
  "duplicate_orders_found": ["ORD-1001 (2x)", "ORD-1002 (2x)", "ORD-1004 (2x)"]
}`,
    businessValue:
      'Replaces 6+ hours of manual SQL archaeology across multiple teams with an evidence-backed root cause in 8 seconds.',
  },
  {
    stepNumber: 3,
    stageCode: '03_REPAIR',
    agentName: 'Dialect-Aware SQL & dbt Remediation Synthesizer Agent',
    modelOrEngine: 'Gemini 3.1 Pro Code Synthesizer + Multi-Dialect SQL Transpiler',
    color: '#3b82f6',
    inputTrigger: 'Verified Root Cause (1-to-many join fanout on order_id in alloydb_payments).',
    activities: [
      'Inspects existing production SQL/dbt model definition for bq_fct_daily_revenue.',
      'Synthesizes an idempotent deduplication CTE using deterministic windowing (ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY payment_id ASC) = 1).',
      'Generates a clean unified Git diff preserving all existing business logic, column aliases, and partitioning keys.',
    ],
    outputTitle: 'Synthesized Candidate SQL Patch',
    outputPayload: `WITH deduped_payments AS (
  SELECT
    payment_id, order_id, captured_amount_usd, payment_status,
    ROW_NUMBER() OVER (
      PARTITION BY order_id
      ORDER BY payment_id ASC
    ) AS rn
  FROM alloydb_payments
  WHERE payment_status = 'CAPTURED'
)
SELECT
  o.order_date,
  COUNT(DISTINCT o.order_id) AS total_orders,
  ROUND(SUM(p.captured_amount_usd), 2) AS total_revenue_usd,
  SUM(CASE WHEN p.rn > 1 THEN 1 ELSE 0 END) AS duplicate_rows_detected
FROM alloydb_orders o
JOIN deduped_payments p ON o.order_id = p.order_id AND p.rn = 1
GROUP BY o.order_date;`,
    businessValue:
      'Produces ready-to-review, dialect-accurate SQL/dbt code instead of vague text recommendations.',
  },
  {
    stepNumber: 4,
    stageCode: '04_VERIFY',
    agentName: 'Deterministic 5-Gate Sandbox Verifier Engine',
    modelOrEngine: 'MultiDatabaseSandboxEngine (SQLite/BQ Dry-Run) + AST Parser',
    color: '#ec4899',
    inputTrigger: 'Candidate SQL Patch + Broken Baseline SQL + Seeded/Sampled Production Data.',
    activities: [
      'Gate 1 (AST Safety): Parses SQL tokens to guarantee zero destructive DDL/DML (no DROP, DELETE, TRUNCATE, UPDATE).',
      'Gate 2 & 3 (IAM & Cost): Validates Dataplex PII policy tags and runs BigQuery dry_run=True (1.42 GB billed, $0.0071 USD).',
      'Gate 4 & 5 (Reconciliation & Regression): Executes both Broken and Repaired SQL in the isolated sandbox, proving revenue reconciles from $1,428,500.00 to exact AlloyDB truth $1,280,000.00 with 0 duplicates.',
    ],
    outputTitle: 'Cryptographic 5-Gate Verification Certificate',
    outputPayload: `{
  "stage": "04_VERIFY",
  "all_gates_passed": true,
  "gates": {
    "GATE_1_AST_SAFETY": "PASSED (Read-Only SELECT/CTE verified)",
    "GATE_2_IAM_DATAPLEX_PII": "PASSED (0 PII columns exposed)",
    "GATE_3_COST_DRY_RUN": "PASSED (1.42 GB / $0.0071 USD - Within $5.00 budget)",
    "GATE_4_RECONCILIATION": "PASSED ($1,428,500.00 -> $1,280,000.00 | -$148,500.00 fixed)",
    "GATE_5_DBT_REGRESSION": "PASSED (14/14 schema & uniqueness tests green)"
  },
  "sha256_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`,
    businessValue:
      'Guarantees zero production regressions through deterministic mathematical proof before any code is merged.',
  },
  {
    stepNumber: 5,
    stageCode: '05_PR_AND_GOVERNANCE',
    agentName: 'GitOps Pull Request & RBAC Governance Agent',
    modelOrEngine: 'EnterpriseAuthService + GitHub/GitLab PR Automation + Audit Ledger',
    color: '#a855f7',
    inputTrigger: '5-Gate Verification Certificate + Reviewer Session Token.',
    activities: [
      'Packages the unified SQL diff, root-cause diagnosis, and 5-Gate mathematical proof table into a GitHub Pull Request.',
      'Enforces Role-Based Access Control: verifies the acting user holds DATA_GOVERNANCE_APPROVER or GCP_PARTNER_ADMIN role.',
      'Blocks unauthorized roles (e.g., DATA_VIEWER or DATA_ENGINEER) with HTTP 403 Forbidden and logs the security event.',
    ],
    outputTitle: 'Signed GitOps Pull Request & RBAC Check',
    outputPayload: `{
  "stage": "05_PR_AND_GOVERNANCE",
  "git_pull_request_url": "https://github.com/enterprise-data/gcp-dbt-commerce/pull/418",
  "branch": "fix/datatrust-inc-2026-001-dedup-payments",
  "rbac_check": {
    "required_permission": "APPROVE_PRODUCTION_PR",
    "actor_role": "DATA_GOVERNANCE_APPROVER",
    "authorized": true
  }
}`,
    businessValue:
      'Integrates natively with enterprise CI/CD and SOX/SOC2 change-management controls.',
  },
  {
    stepNumber: 6,
    stageCode: '06_APPROVE',
    agentName: 'Production Promotion & Immutable Audit Ledger Agent',
    modelOrEngine: 'SHA-256 Compliance Ledger + Looker Cache Refresh Webhook',
    color: '#10b981',
    inputTrigger: 'Human Governance Approver clicks "Approve & Merge Verified Fix".',
    activities: [
      'Merges the verified dbt/SQL patch and triggers incremental backfill on the target BigQuery partition.',
      'Unpauses the downstream Looker CFO Executive Dashboard and marks the KPI badge as 5-Gate Certified.',
      'Writes an immutable, cryptographically signed audit record to the DataTrust AI Governance Ledger.',
    ],
    outputTitle: 'Immutable Audit Ledger Record & Restored SLA',
    outputPayload: `{
  "stage": "06_APPROVE",
  "status": "RESOLVED_AND_DEPLOYED",
  "approved_by": "Elena Rostova (VP Data Governance)",
  "mttr_total_minutes": 4.2,
  "financial_exposure_prevented": "$148,500.00",
  "audit_log_sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
}`,
    businessValue:
      'Closes the loop with full regulatory traceability and restores executive data trust in minutes.',
  },
];

export const ArchitectureMindmapStudioTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<MindmapViewMode>('OVERALL_MINDMAP');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core-hub');
  const [activeAgentStep, setActiveAgentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      if (viewMode === 'AGENTIC_WORKFLOW') {
        setActiveAgentStep((prev) => (prev >= AGENTIC_WORKFLOW_STEPS.length ? 1 : prev + 1));
      } else if (viewMode === 'OVERALL_MINDMAP') {
        setSelectedNodeId((prev) => {
          const idx = OVERALL_MINDMAP_NODES.findIndex((n) => n.id === prev);
          const nextIdx = (idx + 1) % OVERALL_MINDMAP_NODES.length;
          return OVERALL_MINDMAP_NODES[nextIdx].id;
        });
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, viewMode]);

  const selectedNode =
    OVERALL_MINDMAP_NODES.find((n) => n.id === selectedNodeId) || OVERALL_MINDMAP_NODES[0];
  const currentAgent =
    AGENTIC_WORKFLOW_STEPS.find((s) => s.stepNumber === activeAgentStep) ||
    AGENTIC_WORKFLOW_STEPS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101c38] to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Interactive Animated Architecture, Mindmap &amp; Agentic Workflow Studio
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              DataTrust AI &bull; End-to-End Solution, Module &amp; Agentic Mindmap
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl">
              Explore how DataTrust AI connects to any Google Cloud or Multi-Cloud data platform,
              orchestrates 6 autonomous agents, proves SQL repairs mathematically in the 5-Gate
              Sandbox, and enforces IAP + RBAC governance.
            </p>
          </div>

          {/* Animation Play / Pause Controller */}
          <div className="flex items-center gap-2 self-start lg:self-center bg-slate-950/90 border border-slate-800 rounded-xl p-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isPlaying
                  ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Auto-Animating
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Resume Animation
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                if (viewMode === 'AGENTIC_WORKFLOW') {
                  setActiveAgentStep((prev) =>
                    prev >= AGENTIC_WORKFLOW_STEPS.length ? 1 : prev + 1
                  );
                } else {
                  const idx = OVERALL_MINDMAP_NODES.findIndex((n) => n.id === selectedNodeId);
                  setSelectedNodeId(
                    OVERALL_MINDMAP_NODES[(idx + 1) % OVERALL_MINDMAP_NODES.length].id
                  );
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Next Node
            </button>
          </div>
        </div>

        {/* 4 View Mode Sub-Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          {[
            {
              id: 'OVERALL_MINDMAP' as MindmapViewMode,
              label: '1. Overall Solution Mindmap',
              sub: 'Interactive Animated Ecosystem & Outputs',
              icon: Network,
            },
            {
              id: 'AGENTIC_WORKFLOW' as MindmapViewMode,
              label: '2. Full Agentic Workflow',
              sub: '6-Stage Activities, Prompts & Live Payloads',
              icon: Bot,
            },
            {
              id: 'MODULE_ARCHITECTURE' as MindmapViewMode,
              label: '3. Technical Module Architecture',
              sub: 'Frontend, FastAPI, Sandbox & Terraform Map',
              icon: Layers,
            },
            {
              id: 'TUTORIALS_AND_GCP_SETUP' as MindmapViewMode,
              label: '4. User & GCP Config Tutorials',
              sub: 'Step-by-Step Usage & Cloud Run Setup Guide',
              icon: BookOpen,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                  active
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-950/50'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{tab.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: OVERALL SOLUTION ARCHITECTURE ANIMATED MINDMAP */}
      {viewMode === 'OVERALL_MINDMAP' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Animated SVG Mindmap Canvas */}
          <div className="xl:col-span-7 bg-[#0c1324] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-400" />
                  Interactive Solution Mindmap (Click Any Branch Node to Inspect Activity &amp; Output)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Animated pulses show live telemetry, root-cause reasoning, and 5-Gate verification
                  flowing through the control plane.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Active Focus: {selectedNode.title}
              </span>
            </div>

            <div className="relative w-full overflow-x-auto bg-[#070c18] border border-slate-800/80 rounded-xl p-2">
              <svg viewBox="0 0 1000 580" className="w-full h-auto min-w-[680px]">
                <defs>
                  <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                  <style>
                    {`
                      @keyframes dashFlow {
                        to { stroke-dashoffset: -40; }
                      }
                      .mindmap-stream {
                        stroke-dasharray: 8 6;
                        animation: dashFlow 1.6s linear infinite;
                      }
                    `}
                  </style>
                </defs>

                {/* Subtle Grid Background */}
                <circle cx="500" cy="290" r="220" fill="url(#hubGlow)" />
                <circle
                  cx="500"
                  cy="290"
                  r="160"
                  fill="none"
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="500"
                  cy="290"
                  r="260"
                  fill="none"
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />

                {/* Curved Mindmap Connectors from Core Hub to Each Branch */}
                {OVERALL_MINDMAP_NODES.filter((n) => n.parentId === 'core-hub').map((branch) => {
                  const isSelected = selectedNodeId === branch.id;
                  const pathD = `M 500 290 C ${(500 + branch.x) / 2} 290, ${(500 + branch.x) / 2} ${branch.y}, ${branch.x} ${branch.y}`;
                  return (
                    <g key={`edge-${branch.id}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={branch.color}
                        strokeOpacity={isSelected ? 0.45 : 0.18}
                        strokeWidth={isSelected ? 6 : 3}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={branch.color}
                        strokeWidth={isSelected ? 3 : 2}
                        className="mindmap-stream"
                      />
                    </g>
                  );
                })}

                {/* Render All Mindmap Nodes */}
                {OVERALL_MINDMAP_NODES.map((node) => {
                  const isCore = node.id === 'core-hub';
                  const isSelected = selectedNodeId === node.id;
                  const boxWidth = isCore ? 250 : 260;
                  const boxHeight = isCore ? 92 : 78;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x - boxWidth / 2}, ${node.y - boxHeight / 2})`}
                      onClick={() => {
                        setIsPlaying(false);
                        setSelectedNodeId(node.id);
                      }}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <rect
                          x={-6}
                          y={-6}
                          width={boxWidth + 12}
                          height={boxHeight + 12}
                          rx={18}
                          fill="none"
                          stroke={node.color}
                          strokeWidth={2.5}
                          strokeDasharray="6 4"
                        />
                      )}
                      <rect
                        width={boxWidth}
                        height={boxHeight}
                        rx={14}
                        fill={isCore ? '#172554' : '#0f172a'}
                        stroke={node.color}
                        strokeWidth={isSelected ? 3 : 1.8}
                      />
                      <circle cx={22} cy={26} r={7} fill={node.color} />
                      <text
                        x={38}
                        y={30}
                        fill="#ffffff"
                        fontSize={isCore ? 14 : 13}
                        fontWeight="bold"
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        {node.title}
                      </text>
                      <text
                        x={38}
                        y={50}
                        fill="#94a3b8"
                        fontSize={11}
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        {node.subtitle}
                      </text>
                      <text
                        x={38}
                        y={68}
                        fill={node.color}
                        fontSize={10}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {isSelected ? '● ACTIVE INSPECTOR VIEW' : 'Click to inspect activity & output'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Node Selector Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {OVERALL_MINDMAP_NODES.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedNodeId(node.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                    selectedNodeId === node.id
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {node.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Live Activity, Architecture Details & Concrete Output for Selected Mindmap Node */}
          <div className="xl:col-span-5 bg-[#0c1324] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span
                    className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded mb-1"
                    style={{
                      backgroundColor: `${selectedNode.color}25`,
                      color: selectedNode.color,
                      border: `1px solid ${selectedNode.color}55`,
                    }}
                  >
                    {selectedNode.category}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedNode.title}</h3>
                  <p className="text-xs text-slate-400">{selectedNode.subtitle}</p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="text-[11px] font-bold uppercase text-blue-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Live Engine Activity &amp; Working Process
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedNode.activity}</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Technical Implementation Specifications
                </div>
                <ul className="space-y-1.5">
                  {selectedNode.technicalDetails.map((item, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Concrete Activity Output Payload
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">JSON / SQL Contract</span>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {selectedNode.sampleOutput}
                </pre>
              </div>
            </div>

            <div className="bg-indigo-950/35 border border-indigo-500/40 rounded-xl p-3.5">
              <div className="text-[10px] font-bold uppercase text-indigo-300 mb-1">
                How This Solves the Enterprise Problem
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedNode.problemSolved}</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL AGENTIC SOLUTION ARCHITECTURE & ANIMATED STEP-BY-STEP WORKFLOW */}
      {viewMode === 'AGENTIC_WORKFLOW' && (
        <div className="space-y-6">
          {/* Animated 6-Agent Pipeline Stepper */}
          <div className="bg-[#0c1324] border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  Full Agentic Solution Architecture &bull; 6-Stage Autonomous Closed-Loop Pipeline
                </h2>
                <p className="text-xs text-slate-400">
                  Click any agent stage below or watch the live animation step through each agent’s
                  trigger, internal activity, and verified output.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
                Stage {currentAgent.stepNumber} of {AGENTIC_WORKFLOW_STEPS.length}:{' '}
                {currentAgent.stageCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {AGENTIC_WORKFLOW_STEPS.map((step) => {
                const isActive = step.stepNumber === activeAgentStep;
                const isCompleted = step.stepNumber < activeAgentStep;
                return (
                  <button
                    key={step.stageCode}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveAgentStep(step.stepNumber);
                    }}
                    className={`relative p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-950/60 ring-2 ring-blue-500/40'
                        : isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1.5">
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${step.color}25`,
                            color: step.color,
                          }}
                        >
                          {step.stageCode}
                        </span>
                        {isActive && (
                          <span className="text-blue-300 animate-pulse">● RUNNING</span>
                        )}
                        {isCompleted && <span className="text-emerald-400">✓ DONE</span>}
                      </div>
                      <div className="text-xs font-bold text-white leading-snug">
                        {step.agentName}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 truncate">
                      {step.modelOrEngine}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Agent Deep-Dive: Input Trigger -> Autonomous Activities -> Live Output Payload */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-[#0c1324] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-mono font-bold text-blue-400">
                    AGENT STAGE {currentAgent.stepNumber}: {currentAgent.stageCode}
                  </div>
                  <h3 className="text-lg font-bold text-white">{currentAgent.agentName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Powered by: <strong className="text-slate-200">{currentAgent.modelOrEngine}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-400">
                  1. Input Trigger &amp; Context
                </div>
                <p className="text-xs text-slate-200">{currentAgent.inputTrigger}</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="text-[11px] font-bold uppercase text-blue-400">
                  2. Autonomous Agent Activities Performed
                </div>
                <div className="space-y-2">
                  {currentAgent.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5">
                <div className="text-[11px] font-bold uppercase text-emerald-400 mb-1">
                  3. How This Agent Solves the Customer Problem
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentAgent.businessValue}
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#0c1324] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      LIVE AGENT OUTPUT ARTIFACT
                    </div>
                    <h3 className="text-base font-bold text-white">{currentAgent.outputTitle}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                    Verified Output
                  </span>
                </div>

                <pre className="bg-[#070b14] border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {currentAgent.outputPayload}
                </pre>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  Next Stage in Closed Loop:{' '}
                  <strong className="text-white">
                    {
                      AGENTIC_WORKFLOW_STEPS[
                        activeAgentStep % AGENTIC_WORKFLOW_STEPS.length
                      ].stageCode
                    }
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveAgentStep((prev) =>
                      prev >= AGENTIC_WORKFLOW_STEPS.length ? 1 : prev + 1
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-blue-600 text-white text-xs font-bold transition"
                >
                  Step to Next Agent
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: TECHNICAL MODULE ARCHITECTURE MINDMAP */}
      {viewMode === 'MODULE_ARCHITECTURE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Frontend TypeScript Modules */}
            <div className="bg-[#0c1324] border border-blue-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    1. Google Cloud Console Frontend (`frontend/src/`)
                  </h3>
                  <p className="text-[11px] text-slate-400">React 19 + TypeScript + Tailwind CSS</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    file: 'App.tsx',
                    role: 'Master state shell, GCP Project/Tenant switcher, RBAC session bar, and Gemini Copilot drawer.',
                  },
                  {
                    file: 'components/AuthGateModal.tsx',
                    role: 'Google Cloud IAP / OIDC 1-Click SSO, Corporate Login, Organization Sign-Up & 4-Role RBAC switcher.',
                  },
                  {
                    file: 'components/OverviewAndConnectorsTab.tsx',
                    role: '12 Google Cloud & Multi-Cloud connector cards, live connection handshake modal & webhook simulator.',
                  },
                  {
                    file: 'components/InvestigationAndLineageTab.tsx',
                    role: 'Interactive cross-database DAG lineage explorer & 6-hypothesis Bayesian root-cause matrix.',
                  },
                  {
                    file: 'components/RepairAndVerificationTab.tsx',
                    role: 'Side-by-side SQL diff viewer, interactive SQL sandbox editor & 5-Gate mathematical reconciliation.',
                  },
                  {
                    file: 'components/GovernedAnalyticsAndGovernanceTab.tsx',
                    role: 'NL-to-SQL Studio, Git PR Approval Gate, SHA-256 Audit Ledger & Partner GTM Matrix.',
                  },
                  {
                    file: 'components/ArchitectureMindmapStudioTab.tsx',
                    role: 'Interactive animated solution mindmap, 6-agent workflow simulator & GCP deployment tutorials.',
                  },
                ].map((m) => (
                  <div
                    key={m.file}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1"
                  >
                    <div className="font-mono font-bold text-blue-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      {m.file}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: FastAPI Backend & Multi-DB Sandbox Engines */}
            <div className="bg-[#0c1324] border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    2. FastAPI Agentic Backend (`backend/`)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Python 3.13 + Pydantic v2 + SQLite/BigQuery SDK
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    file: 'main.py',
                    role: '22 REST API endpoints orchestrating overview, auth, connector testing, 5-Gate verification, and PR approval.',
                  },
                  {
                    file: 'database_engine.py',
                    role: 'MultiDatabaseSandboxEngine with 8 seeded relational tables & validate_read_only_sql() AST safety parser.',
                  },
                  {
                    file: 'verifier.py',
                    role: 'VerificationSandboxService executing Gate 1-5 checks, before/after variance math, and SHA-256 signing.',
                  },
                  {
                    file: 'auth_service.py',
                    role: 'EnterpriseAuthService handling IAP JWT inspection, OIDC SSO personas, org signup, and HTTP 403 RBAC gates.',
                  },
                  {
                    file: 'live_connector_adapters.py',
                    role: '12 Google Cloud & Multi-Cloud connection presets, URI format validators, and schema introspection probes.',
                  },
                  {
                    file: 'analytics_service.py',
                    role: 'GovernedAnalyticsService translating natural-language questions into read-only SQL on verified views.',
                  },
                  {
                    file: 'gcp_production_bridge.py',
                    role: 'Live google-cloud-bigquery dry_run=True SDK integration & Vertex AI / Gemini 3.1 Pro (gemini-3.1-pro-preview) live API bridge.',
                  },
                ].map((m) => (
                  <div
                    key={m.file}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1"
                  >
                    <div className="font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      {m.file}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Cloud Run, CI/CD & Terraform Infrastructure Modules */}
            <div className="bg-[#0c1324] border border-purple-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    3. Production Cloud Run &amp; IaC (`deploy/`)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Docker + Cloud Build + Terraform Least-Privilege IAM
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    file: 'Dockerfile',
                    role: 'Multi-stage build compiling TypeScript frontend (Node 22) + Python 3.13-slim non-root container (datatrust:10001).',
                  },
                  {
                    file: 'cloudbuild.yaml',
                    role: 'Automated Google Cloud Build pipeline: runs pytest suite -> builds image -> pushes to Artifact Registry -> deploys to Cloud Run.',
                  },
                  {
                    file: 'deploy/terraform/main.tf',
                    role: 'Provisions datatrust-agent-ro service account, read-only IAM bindings (bigquery.metadataViewer, dataplex.viewer), and Cloud Run v2.',
                  },
                  {
                    file: 'backend/test_api.py',
                    role: 'Automated pytest verification suite testing overview, 5-Gate math, AST destructive SQL blocking, and RBAC 403 enforcement.',
                  },
                ].map((m) => (
                  <div
                    key={m.file}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1"
                  >
                    <div className="font-mono font-bold text-purple-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      {m.file}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: STEP-BY-STEP USER TUTORIAL & GOOGLE CLOUD CONFIGURATION GUIDE */}
      {viewMode === 'TUTORIALS_AND_GCP_SETUP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tutorial 1: How End-Users Use DataTrust AI */}
          <div className="bg-[#0c1324] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-xs font-mono font-bold text-blue-400 uppercase">
                Tutorial Part 1 &bull; End-User Operational Guide
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                How Users Use DataTrust AI (Step-by-Step Workflow)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  step: 'Step 1: Authenticate via Google Cloud IAP / OIDC SSO',
                  desc: 'Click "Switch Role / SSO" in the top-right header. Choose one of the 4 enterprise personas (Viewer, Data Engineer, Governance Approver, or Partner Admin) or register a new organization account.',
                },
                {
                  step: 'Step 2: Connect Any Google Cloud or Multi-Cloud Database',
                  desc: 'In "1. Command Center & DBs", click "+ Connect GCP / Multi-Cloud Platform". Pick from 12 presets (BigQuery, AlloyDB, Spanner, Snowflake, AWS/Azure Omni), click "Test Live Connection & Introspect Schema", and register in Read-Only mode.',
                },
                {
                  step: 'Step 3: Inspect Root Cause & Cross-System Lineage',
                  desc: 'Click any incident or go to "2. Root Cause & Lineage". Inspect the end-to-end lineage graph (e.g. AlloyDB -> Datastream -> BigQuery -> Looker) and review the 6-Hypothesis Matrix showing why the primary root cause scored 96.8% confidence.',
                },
                {
                  step: 'Step 4: Run the 5-Gate Verification Sandbox',
                  desc: 'Open "3. SQL Repair & 5-Gate Proof". Review the side-by-side SQL diff, optionally edit the candidate SQL patch, and click "Run 5-Gate Sandbox Verification". Try typing DROP TABLE to see Gate 1 AST Safety block it immediately.',
                },
                {
                  step: 'Step 5: Approve & Merge via RBAC Governance Gate',
                  desc: 'Open "5. Approval, PR & Partners". While signed in as Elena Rostova (DATA_GOVERNANCE_APPROVER), click "Approve & Deploy Verified Fix" to generate the signed Git PR and record the SHA-256 audit log.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1"
                >
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {item.step}
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tutorial 2: How to Configure & Deploy in Google Cloud */}
          <div className="bg-[#0c1324] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Tutorial Part 2 &bull; Google Cloud Production Setup
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                How to Configure &amp; Deploy DataTrust AI in Google Cloud
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-bold text-emerald-300">
                  1. Provision Least-Privilege IAM &amp; Cloud Run via Terraform
                </div>
                <p className="text-slate-300">
                  Creates the read-only service account (`datatrust-agent-ro`) with `bigquery.metadataViewer`, `bigquery.jobUser`, `dataplex.viewer`, and `cloudsql.viewer`:
                </p>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`terraform -chdir=deploy/terraform init
terraform -chdir=deploy/terraform apply \\
  -var="project_id=your-gcp-project-id" \\
  -var="region=us-central1"`}
                </pre>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-bold text-blue-300">
                  2. Build &amp; Deploy Container via Google Cloud Build
                </div>
                <p className="text-slate-300">
                  Runs the `pytest` suite, builds the multi-stage Docker container, pushes to Artifact Registry, and deploys to Cloud Run:
                </p>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-blue-300 overflow-x-auto">
{`gcloud builds submit --config=cloudbuild.yaml .`}
                </pre>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-bold text-purple-300">
                  3. Enable Google Cloud Identity-Aware Proxy (IAP) &amp; Live Gemini 3.1 Pro API
                </div>
                <p className="text-slate-300">
                  Configure Cloud Run environment variables to activate live BigQuery SDK dry-runs, Gemini 3.1 Pro (`gemini-3.1-pro-preview`) synthesis, and edge IAP JWT verification:
                </p>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-purple-300 overflow-x-auto">
{`gcloud run services update datatrust-ai-control-plane \\
  --region=us-central1 \\
  --set-env-vars="GOOGLE_CLOUD_PROJECT=your-gcp-project-id,GEMINI_REASONING_MODEL=gemini-3.1-pro-preview" \\
  --set-env-vars="IAP_AUDIENCE=/projects/12345/global/backendServices/67890" \\
  --set-secrets="GEMINI_API_KEY=datatrust-gemini-key:latest"`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ArchitectureMindmapStudioTab;
