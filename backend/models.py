from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DeploymentOption(str, Enum):
    OPTION_A_CUSTOMER_GCP = "OPTION_A_CUSTOMER_GCP"
    OPTION_B_MANAGED_SAAS = "OPTION_B_MANAGED_SAAS"
    OPTION_C_PARTNER_DELIVERED = "OPTION_C_PARTNER_DELIVERED"


class PartnerRoute(str, Enum):
    ROUTE_1_CONSULTING_PARTNER = "ROUTE_1_CONSULTING_PARTNER"
    ROUTE_2_GCP_MARKETPLACE = "ROUTE_2_GCP_MARKETPLACE"
    ROUTE_3_PARTNER_EMBEDDED = "ROUTE_3_PARTNER_EMBEDDED"


class IncidentSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class IncidentLoopStage(str, Enum):
    DETECT = "01_DETECT"
    INVESTIGATE = "02_INVESTIGATE"
    EXPLAIN = "03_EXPLAIN"
    REPAIR = "04_REPAIR"
    PROVE = "05_PROVE"
    APPROVE = "06_APPROVE"
    RESOLVED = "07_RESOLVED"
    ROLLED_BACK = "08_ROLLED_BACK"


class HypothesisVerdict(str, Enum):
    PROVEN_ROOT_CAUSE = "PROVEN_ROOT_CAUSE"
    CONTRIBUTING_FACTOR = "CONTRIBUTING_FACTOR"
    RULED_OUT = "RULED_OUT"


class TenantWorkspace(BaseModel):
    tenant_id: str
    organization_name: str
    gcp_project_id: str
    region: str
    deployment_option: DeploymentOption
    partner_name: Optional[str] = None
    partner_route: Optional[PartnerRoute] = None
    industry: str
    service_account_email: str
    zero_data_exfiltration: bool = True
    connected_products: List[str]
    monthly_incidents_avg: int
    mttr_minutes_before: int
    mttr_minutes_datatrust: int


class DataConnector(BaseModel):
    connector_id: str
    name: str
    product_family: str  # e.g., "Google Cloud Database", "Google Cloud Data Platform", "Partner Ecosystem"
    gcp_service: str  # e.g., "BigQuery", "AlloyDB", "Cloud Spanner", "Cloud SQL", "Cloud Bigtable", "Firestore", "Datastream", "Dataflow", "Cloud Composer", "Dataplex", "dbt", "Looker"
    dialect: str  # e.g., "GoogleSQL", "PostgreSQL", "MySQL", "Wide-Column / HBase", "Document JSON", "Jinja-SQL"
    status: str  # "HEALTHY", "DEGRADED", "SCHEMA_DRIFT_DETECTED", "SLA_WARNING"
    host_or_uri: str
    auth_mode: str
    access_level: str  # "READ_ONLY_PRODUCTION", "SANDBOX_ISOLATED_EXECUTION"
    tables_monitored: int
    active_rules: int
    freshness_sla_minutes: int
    current_lag_minutes: float
    capabilities: List[str]
    sandbox_tables: List[str] = Field(default_factory=list)


class CreateConnectorRequest(BaseModel):
    name: str
    gcp_service: str
    dialect: str
    host_or_uri: str
    auth_mode: str = "Workload Identity Federation (Read-Only)"
    freshness_sla_minutes: int = 15


class HypothesisItem(BaseModel):
    hypothesis_id: str
    category: str  # One of the 6 core candidate causes from datatrust.docx
    title: str
    verdict: HypothesisVerdict
    confidence_pct: float
    diagnostic_sql: str
    evidence_summary: str
    metric_observed: str


class LineageNode(BaseModel):
    node_id: str
    label: str
    gcp_product: str  # "AlloyDB", "Cloud Spanner", "Cloud SQL", "Cloud Bigtable", "Firestore", "Datastream", "Dataflow", "Cloud Composer", "BigQuery", "dbt", "Dataplex", "Looker"
    layer: str  # "OLTP_SOURCE", "INGESTION_CDC", "STAGING_LAYER", "TRANSFORMATION_DBT", "WAREHOUSE_MART", "BI_CONSUMPTION"
    status: str  # "HEALTHY", "ROOT_CAUSE_DEFECT", "IMPACTED_DOWNSTREAM", "REPAIRED"
    schema_fields: List[str]
    dataplex_policy_tags: List[str] = Field(default_factory=list)
    freshness_lag: str
    row_count: int
    defect_note: Optional[str] = None


class LineageEdge(BaseModel):
    source: str
    target: str
    relationship: str  # e.g., "Datastream CDC Stream", "JOIN ON order_id", "dbt ref('stg_payments')", "Looker Explore Query"
    is_broken_path: bool = False


class GateCheckResult(BaseModel):
    gate_number: int
    gate_name: str
    status: str  # "PASSED", "FAILED", "WARNING"
    duration_ms: int
    summary: str
    technical_details: List[str]


class RegressionTestResult(BaseModel):
    test_id: str
    test_name: str
    assertion_type: str  # "RECONCILIATION_MATCH", "NOT_NULL", "UNIQUE_PRIMARY_KEY", "ACCEPTED_VALUES", "REFERENTIAL_INTEGRITY", "SCHEMA_COMPATIBILITY"
    status_before_fix: str  # "FAILED", "PASSED"
    status_after_fix: str  # "PASSED", "FAILED"
    before_value: str
    after_value: str
    expected_threshold: str
    sql_assertion: str


class ReconciliationRow(BaseModel):
    dimension_key: str
    source_oltp_value: str
    before_fix_warehouse_value: str
    after_fix_warehouse_value: str
    variance_before: str
    variance_after: str
    status: str


class VerificationProofBundle(BaseModel):
    verified_at: str
    overall_passed: bool
    sandbox_environment: str
    gates: List[GateCheckResult]
    expected_metric_display: str
    reported_broken_metric_display: str
    repaired_metric_display: str
    recovered_delta_display: str
    reconciliation_match_pct: float
    bytes_scanned_before: int
    bytes_scanned_after: int
    estimated_cost_usd: float
    reconciliation_rows: List[ReconciliationRow]
    regression_tests: List[RegressionTestResult]
    sample_recovered_records: List[Dict[str, Any]]


class RepairProposal(BaseModel):
    proposal_id: str
    target_asset: str
    target_gcp_product: str
    sql_dialect: str
    file_path_in_repo: str
    explanation: str
    root_cause_commit_or_event: str
    original_sql: str
    proposed_sql: str
    backfill_sql: str
    rollback_sql: str
    sandbox_verify_before_query: str
    sandbox_verify_after_query: str
    affected_downstream_assets: List[str]


class GitPullRequestArtifact(BaseModel):
    pr_number: int
    repository: str
    branch_name: str
    base_branch: str
    title: str
    status: str  # "DRAFT_READY", "OPEN_APPROVED", "MERGED", "REVERTED"
    author: str
    reviewer_role: str
    files_changed: List[str]
    markdown_body: str
    created_at: str


class Incident(BaseModel):
    incident_id: str
    tenant_id: str
    title: str
    subtitle: str
    severity: IncidentSeverity
    loop_stage: IncidentLoopStage
    detected_at: str
    alert_source: str  # e.g., "BigQuery Data Quality Scan + Dataplex", "Cloud Spanner Change Stream Monitor", "Monte Carlo Webhook", "dbt Cloud Test Failure"
    source_database: str
    pipeline_layer: str
    target_warehouse: str
    bi_Consumer: str
    metric_name: str
    expected_value: str
    reported_value: str
    variance_pct: float
    financial_exposure: str
    confidence_score: float
    executive_summary: str
    root_cause_technical: str
    hypotheses: List[HypothesisItem]
    lineage_nodes: List[LineageNode]
    lineage_edges: List[LineageEdge]
    repair_proposal: RepairProposal
    verification_proof: Optional[VerificationProofBundle] = None
    git_pr: Optional[GitPullRequestArtifact] = None
    approved_by: Optional[str] = None
    approved_role: Optional[str] = None
    approved_at: Optional[str] = None
    rollback_available: bool = True


class AuditLogEntry(BaseModel):
    audit_id: str
    timestamp: str
    tenant_id: str
    incident_id: Optional[str] = None
    actor: str
    role: str
    action: str
    gcp_resources_touched: List[str]
    access_mode: str
    verification_hash: str
    details: str


class RunVerificationRequest(BaseModel):
    custom_proposed_sql: Optional[str] = None
    executed_by: str = "Principal Analytics Engineer"


class ApprovalActionRequest(BaseModel):
    action: str  # "APPROVE_AND_DEPLOY", "GENERATE_GIT_PR", "REJECT", "ROLLBACK"
    reviewer_name: str = "Sarah Chen (Lead Data Reliability Engineer)"
    reviewer_role: str = "Data Platform Approver (IAM: roles/dataplex.dataOwner)"
    comment: str = "Verified 5-gate sandbox proof and 100% KPI reconciliation against source ledger."


class GovernedAnalyticsRequest(BaseModel):
    question: Optional[str] = None
    custom_sql: Optional[str] = None
    target_database: str = "BigQuery + AlloyDB Federated Sandbox"
    max_rows: int = 50


class GovernedAnalyticsResponse(BaseModel):
    question: str
    generated_sql: str
    dialect: str
    target_database: str
    ast_safety_passed: bool
    read_only_enforced: bool
    estimated_bytes_scanned: int
    explanation: str
    ai_insights: List[str]
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_ms: float


class SimulateWebhookRequest(BaseModel):
    alert_source: str = "Dataplex Universal Catalog Quality Scan"
    gcp_database: str = "AlloyDB for PostgreSQL -> BigQuery"
    anomaly_type: str = "SCHEMA_AND_METRIC_DRIFT"
    custom_title: Optional[str] = None
