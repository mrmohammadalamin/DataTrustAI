export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentLoopStage =
  | '01_DETECT'
  | '02_INVESTIGATE'
  | '03_EXPLAIN'
  | '04_REPAIR'
  | '05_PROVE'
  | '06_APPROVE'
  | '07_RESOLVED'
  | '08_ROLLED_BACK';

export type HypothesisVerdict = 'PROVEN_ROOT_CAUSE' | 'CONTRIBUTING_FACTOR' | 'RULED_OUT';

export interface TenantWorkspace {
  tenant_id: string;
  organization_name: string;
  gcp_project_id: string;
  region: string;
  deployment_option: 'OPTION_A_CUSTOMER_GCP' | 'OPTION_B_MANAGED_SAAS' | 'OPTION_C_PARTNER_DELIVERED';
  partner_name?: string;
  partner_route?: string;
  industry: string;
  service_account_email: string;
  zero_data_exfiltration: boolean;
  connected_products: string[];
  monthly_incidents_avg: number;
  mttr_minutes_before: number;
  mttr_minutes_datatrust: number;
}

export interface DataConnector {
  connector_id: string;
  name: string;
  product_family: string;
  gcp_service: string;
  dialect: string;
  status: string;
  host_or_uri: string;
  auth_mode: string;
  access_level: string;
  tables_monitored: number;
  active_rules: number;
  freshness_sla_minutes: number;
  current_lag_minutes: number;
  capabilities: string[];
  sandbox_tables: string[];
}

export interface HypothesisItem {
  hypothesis_id: string;
  category: string;
  title: string;
  verdict: HypothesisVerdict;
  confidence_pct: number;
  diagnostic_sql: string;
  evidence_summary: string;
  metric_observed: string;
}

export interface LineageNode {
  node_id: string;
  label: string;
  gcp_product: string;
  layer: string;
  status: 'HEALTHY' | 'ROOT_CAUSE_DEFECT' | 'IMPACTED_DOWNSTREAM' | 'REPAIRED';
  schema_fields: string[];
  dataplex_policy_tags: string[];
  freshness_lag: string;
  row_count: number;
  defect_note?: string;
}

export interface LineageEdge {
  source: string;
  target: string;
  relationship: string;
  is_broken_path: boolean;
}

export interface GateCheckResult {
  gate_number: number;
  gate_name: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  duration_ms: number;
  summary: string;
  technical_details: string[];
}

export interface RegressionTestResult {
  test_id: string;
  test_name: string;
  assertion_type: string;
  status_before_fix: string;
  status_after_fix: string;
  before_value: string;
  after_value: string;
  expected_threshold: string;
  sql_assertion: string;
}

export interface ReconciliationRow {
  dimension_key: string;
  source_oltp_value: string;
  before_fix_warehouse_value: string;
  after_fix_warehouse_value: string;
  variance_before: string;
  variance_after: string;
  status: string;
}

export interface VerificationProofBundle {
  verified_at: string;
  overall_passed: boolean;
  sandbox_environment: string;
  gates: GateCheckResult[];
  expected_metric_display: string;
  reported_broken_metric_display: string;
  repaired_metric_display: string;
  recovered_delta_display: string;
  reconciliation_match_pct: number;
  bytes_scanned_before: number;
  bytes_scanned_after: number;
  estimated_cost_usd: number;
  reconciliation_rows: ReconciliationRow[];
  regression_tests: RegressionTestResult[];
  sample_recovered_records: Record<string, unknown>[];
}

export interface RepairProposal {
  proposal_id: string;
  target_asset: string;
  target_gcp_product: string;
  sql_dialect: string;
  file_path_in_repo: string;
  explanation: string;
  root_cause_commit_or_event: string;
  original_sql: string;
  proposed_sql: string;
  backfill_sql: string;
  rollback_sql: string;
  sandbox_verify_before_query: string;
  sandbox_verify_after_query: string;
  affected_downstream_assets: string[];
}

export interface GitPullRequestArtifact {
  pr_number: number;
  repository: string;
  branch_name: string;
  base_branch: string;
  title: string;
  status: string;
  author: string;
  reviewer_role: string;
  files_changed: string[];
  markdown_body: string;
  created_at: string;
}

export interface Incident {
  incident_id: string;
  tenant_id: string;
  title: string;
  subtitle: string;
  severity: IncidentSeverity;
  loop_stage: IncidentLoopStage;
  detected_at: string;
  alert_source: string;
  source_database: string;
  pipeline_layer: string;
  target_warehouse: string;
  bi_Consumer: string;
  metric_name: string;
  expected_value: string;
  reported_value: string;
  variance_pct: number;
  financial_exposure: string;
  confidence_score: number;
  executive_summary: string;
  root_cause_technical: string;
  hypotheses: HypothesisItem[];
  lineage_nodes: LineageNode[];
  lineage_edges: LineageEdge[];
  repair_proposal: RepairProposal;
  verification_proof?: VerificationProofBundle;
  git_pr?: GitPullRequestArtifact;
  approved_by?: string;
  approved_role?: string;
  approved_at?: string;
  rollback_available: boolean;
}

export interface AuditLogEntry {
  audit_id: string;
  timestamp: string;
  tenant_id: string;
  incident_id?: string;
  actor: string;
  role: string;
  action: string;
  gcp_resources_touched: string[];
  access_mode: string;
  verification_hash: string;
  details: string;
}

export interface GovernedAnalyticsResponse {
  question: string;
  generated_sql: string;
  dialect: string;
  target_database: string;
  ast_safety_passed: boolean;
  read_only_enforced: boolean;
  estimated_bytes_scanned: number;
  explanation: string;
  ai_insights: string[];
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  execution_ms: number;
}

export interface OverviewPayload {
  tagline: string;
  positioning: string;
  metrics: {
    total_incidents: number;
    critical_incidents: number;
    sandbox_verified_count: number;
    resolved_incidents: number;
    revenue_protected_display: string;
    avg_detection_confidence_pct: number;
    mttr_reduction_pct: number;
    avg_mttr_minutes: number;
    baseline_manual_mttr_minutes: number;
    connectors_healthy: number;
    connectors_total: number;
  };
  closed_loop_stages: { step: string; name: string; description: string }[];
  incidents: Incident[];
  connectors: DataConnector[];
  tenants: TenantWorkspace[];
}

export interface PartnerEcosystemPayload {
  deployment_models: {
    id: string;
    title: string;
    badge: string;
    architecture: string;
    summary: string;
    best_for: string;
  }[];
  commercial_routes: {
    route: string;
    description: string;
    deliverable: string;
  }[];
  competitor_comparison: {
    vendor: string;
    current_capability: string;
    datatrust_wedge: string;
  }[];
  production_guardrails: string[];
}

export type UserRole =
  | 'DATA_VIEWER'
  | 'DATA_ENGINEER'
  | 'DATA_GOVERNANCE_APPROVER'
  | 'GCP_PARTNER_ADMIN';

export interface UserAccount {
  user_id: string;
  email: string;
  full_name: string;
  organization_name: string;
  gcp_project_id: string;
  tenant_id: string;
  role: UserRole;
  gcp_iam_binding: string;
  auth_provider: string;
  mfa_verified: boolean;
  permissions: string[];
  created_at: string;
}

export interface AuthSessionResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  iap_jwt_header_simulated: string;
  user: UserAccount;
}

export interface AuthBlueprintPayload {
  identity_layers: {
    layer: string;
    mechanism: string;
    how_it_works: string;
  }[];
  demo_personas: UserAccount[];
  role_permissions_matrix: Record<string, string[]>;
}

