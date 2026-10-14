from __future__ import annotations
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .analytics_service import PRESET_GOVERNED_QUESTIONS, run_governed_analytics_query
from .database_engine import sandbox_db
from .models import (
    ApprovalActionRequest,
    AuditLogEntry,
    CreateConnectorRequest,
    DataConnector,
    GitPullRequestArtifact,
    GovernedAnalyticsRequest,
    GovernedAnalyticsResponse,
    HypothesisItem,
    HypothesisVerdict,
    Incident,
    IncidentLoopStage,
    IncidentSeverity,
    LineageEdge,
    LineageNode,
    RepairProposal,
    RunVerificationRequest,
    SimulateWebhookRequest,
    TenantWorkspace,
)
from .seed_data import (
    build_initial_audit_logs,
    build_initial_connectors,
    build_initial_incidents,
    build_initial_tenants,
)
from .verifier import run_five_gate_verification

app = FastAPI(
    title="DataTrust AI — Autonomous Data Quality & Incident Resolution Engineer API",
    description=(
        "Enterprise Google Cloud Multi-Database Reliability, Lineage Investigation, "
        "Dialect-Aware SQL Repair, and 5-Gate Deterministic Verification Platform."
    ),
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state initialized with deterministic seed data
TENANTS: List[TenantWorkspace] = build_initial_tenants()
CONNECTORS: List[DataConnector] = build_initial_connectors()
INCIDENTS: Dict[str, Incident] = build_initial_incidents()
AUDIT_LOGS: List[AuditLogEntry] = build_initial_audit_logs()

# Pre-compute 5-Gate Verification Bundles on startup so every incident has live sandbox proof ready
for _inc_id, _inc in INCIDENTS.items():
    _inc.verification_proof = run_five_gate_verification(_inc)


def _record_audit(
    tenant_id: str,
    incident_id: Optional[str],
    actor: str,
    role: str,
    action: str,
    resources: List[str],
    access_mode: str,
    details: str,
) -> AuditLogEntry:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    raw_hash = hashlib.sha256(f"{now_str}:{actor}:{action}:{details}".encode("utf-8")).hexdigest()[:16]
    entry = AuditLogEntry(
        audit_id=f"AUD-2026-{9000 + len(AUDIT_LOGS) + 1}",
        timestamp=now_str,
        tenant_id=tenant_id,
        incident_id=incident_id,
        actor=actor,
        role=role,
        action=action,
        gcp_resources_touched=resources,
        access_mode=access_mode,
        verification_hash=f"sha256:{raw_hash}",
        details=details,
    )
    AUDIT_LOGS.insert(0, entry)
    return entry


@app.get("/api/health")
def get_health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "service": "DataTrust AI Core Engine",
        "ai_orchestrator": "Vertex AI Gemini 3.1 Pro (gemini-3.1-pro-preview) + Deterministic 5-Gate Verifier",
        "zero_data_exfiltration": True,
        "sandbox_tables_count": len(sandbox_db.get_table_catalog_summary()),
        "active_connectors": len(CONNECTORS),
        "incidents_tracked": len(INCIDENTS),
    }


@app.get("/api/auth/blueprint")
def get_auth_blueprint_endpoint() -> Dict[str, Any]:
    from .auth_service import get_google_cloud_auth_blueprint
    return get_google_cloud_auth_blueprint()


@app.post("/api/auth/google-sso")
def google_sso_endpoint(req: Dict[str, Any]) -> Any:
    from .auth_service import GoogleSSORequest, login_with_google_sso
    parsed = GoogleSSORequest(**req)
    session = login_with_google_sso(parsed)
    _record_audit(
        tenant_id=session.user.tenant_id,
        incident_id=None,
        actor=f"{session.user.full_name} ({session.user.email})",
        role=f"{session.user.role.value} ({session.user.gcp_iam_binding})",
        action="IAM_GOOGLE_CLOUD_SSO_AUTHENTICATED",
        resources=[f"iap://{session.user.gcp_project_id}"],
        access_mode="OIDC_BEARER_JWT_ISSUED",
        details=f"Authenticated via {session.user.auth_provider.value} with MFA verified.",
    )
    return session


@app.post("/api/auth/login")
def email_login_endpoint(req: Dict[str, Any]) -> Any:
    from .auth_service import LoginRequest, login_with_email_password
    try:
        parsed = LoginRequest(**req)
        session = login_with_email_password(parsed)
        _record_audit(
            tenant_id=session.user.tenant_id,
            incident_id=None,
            actor=f"{session.user.full_name} ({session.user.email})",
            role=session.user.role.value,
            action="IAM_EMAIL_PASSWORD_LOGIN",
            resources=[f"project://{session.user.gcp_project_id}"],
            access_mode="OIDC_BEARER_JWT_ISSUED",
            details=f"Enterprise login succeeded for {session.user.email}.",
        )
        return session
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))


@app.post("/api/auth/signup")
def signup_endpoint(req: Dict[str, Any]) -> Any:
    from .auth_service import SignupRequest, signup_enterprise_user
    from .models import DeploymentOption
    parsed = SignupRequest(**req)
    session = signup_enterprise_user(parsed)

    # Automatically register customer GCP project in TENANTS if new
    if not any(t.gcp_project_id == session.user.gcp_project_id for t in TENANTS):
        new_tenant = TenantWorkspace(
            tenant_id=f"tenant-custom-{len(TENANTS) + 1}",
            organization_name=session.user.organization_name,
            gcp_project_id=session.user.gcp_project_id,
            region="europe-west2 / us-central1",
            deployment_option=DeploymentOption.OPTION_A_CUSTOMER_GCP,
            partner_name="Self-Service Google Cloud Onboarding",
            industry="Enterprise Data Platform",
            service_account_email=f"datatrust-agent-ro@{session.user.gcp_project_id}.iam.gserviceaccount.com",
            zero_data_exfiltration=True,
            connected_products=["BigQuery", "AlloyDB for PostgreSQL", "Dataplex Universal Catalog"],
            monthly_incidents_avg=15,
            mttr_minutes_before=210,
            mttr_minutes_datatrust=12,
        )
        TENANTS.append(new_tenant)

    _record_audit(
        tenant_id=session.user.tenant_id,
        incident_id=None,
        actor=f"{session.user.full_name} ({session.user.email})",
        role=session.user.role.value,
        action="IAM_ORGANIZATION_SIGNUP_COMPLETED",
        resources=[f"project://{session.user.gcp_project_id}"],
        access_mode="WORKLOAD_IDENTITY_PROVISIONED",
        details=f"Onboarded new user {session.user.email} for organization '{session.user.organization_name}' ({session.user.gcp_project_id}).",
    )
    return session


@app.get("/api/overview")
def get_overview(tenant_id: Optional[str] = None) -> Dict[str, Any]:
    incidents_list = list(INCIDENTS.values())
    if tenant_id and tenant_id != "all":
        filtered_incidents = [i for i in incidents_list if i.tenant_id == tenant_id]
    else:
        filtered_incidents = incidents_list

    critical_count = sum(1 for i in filtered_incidents if i.severity == IncidentSeverity.CRITICAL)
    verified_count = sum(1 for i in filtered_incidents if i.verification_proof and i.verification_proof.overall_passed)
    resolved_count = sum(1 for i in filtered_incidents if i.loop_stage == IncidentLoopStage.RESOLVED)

    return {
        "tagline": "Trust your data. Understand every anomaly. Fix problems with evidence.",
        "positioning": "Autonomous Data Quality & Incident Resolution Engineer for Google Cloud Databases & Partner Ecosystems",
        "metrics": {
            "total_incidents": len(filtered_incidents),
            "critical_incidents": critical_count,
            "sandbox_verified_count": verified_count,
            "resolved_incidents": resolved_count,
            "revenue_protected_display": "£104,850 / day",
            "avg_detection_confidence_pct": 97.9,
            "mttr_reduction_pct": 93.8,
            "avg_mttr_minutes": 14,
            "baseline_manual_mttr_minutes": 240,
            "connectors_healthy": sum(1 for c in CONNECTORS if c.status == "HEALTHY"),
            "connectors_total": len(CONNECTORS),
        },
        "closed_loop_stages": [
            {"step": "01", "name": "Detect", "description": "Identify broken metrics, SLA breaches, or schema drift across GCP databases."},
            {"step": "02", "name": "Investigate", "description": "Trace upstream OLTP sources, CDC streams, SQL transforms, and BI assets."},
            {"step": "03", "name": "Explain", "description": "Present ranked hypotheses, SQL evidence, confidence score, and ruled-out causes."},
            {"step": "04", "name": "Repair", "description": "Synthesize dialect-aware SQL, DDL, or dbt patches with rollback plans."},
            {"step": "05", "name": "Prove", "description": "Execute 5-Gate deterministic verification and before/after reconciliation in sandbox."},
            {"step": "06", "name": "Approve", "description": "Human-in-the-loop governance approval, Git PR generation, and immutable audit log."},
        ],
        "incidents": filtered_incidents,
        "connectors": CONNECTORS,
        "tenants": TENANTS,
    }


@app.get("/api/tenants", response_model=List[TenantWorkspace])
def list_tenants() -> List[TenantWorkspace]:
    return TENANTS


@app.get("/api/connectors", response_model=List[DataConnector])
def list_connectors() -> List[DataConnector]:
    return CONNECTORS


@app.get("/api/connectors/presets")
def list_connector_presets() -> List[Any]:
    from .live_connector_adapters import MULTI_CLOUD_CATALOG
    return MULTI_CLOUD_CATALOG


@app.post("/api/connectors/test")
def test_connector_endpoint(req: Dict[str, Any]) -> Any:
    from .live_connector_adapters import ConnectionTestRequest, test_live_or_federated_connection
    parsed_req = ConnectionTestRequest(**req)
    res = test_live_or_federated_connection(parsed_req)
    _record_audit(
        tenant_id="tenant-retail-uk",
        incident_id=None,
        actor="Cloud Platform Architect",
        role="Multi-Cloud Integration Engineer",
        action="LIVE_CONNECTOR_HANDSHAKE_TEST",
        resources=[parsed_req.host_or_uri],
        access_mode="READ_ONLY_SCHEMA_INTROSPECTION",
        details=(
            f"Verified {parsed_req.cloud_provider} / {parsed_req.gcp_service} ({parsed_req.dialect}) "
            f"via {res.driver_used} in {res.latency_ms} ms."
        ),
    )
    return res


@app.post("/api/connectors", response_model=DataConnector)
def create_connector(req: CreateConnectorRequest) -> DataConnector:
    new_conn = DataConnector(
        connector_id=f"conn-custom-{len(CONNECTORS) + 1}",
        name=req.name,
        product_family="Google Cloud Custom Database / Partner Integration",
        gcp_service=req.gcp_service,
        dialect=req.dialect,
        status="HEALTHY",
        host_or_uri=req.host_or_uri,
        auth_mode=req.auth_mode,
        access_level="READ_ONLY_PRODUCTION",
        tables_monitored=16,
        active_rules=12,
        freshness_sla_minutes=req.freshness_sla_minutes,
        current_lag_minutes=0.9,
        capabilities=[
            "Zero-Trust Metadata Introspection",
            "Automated Schema & Distribution Drift Scan",
            "5-Gate Sandbox Dry-Run Verification",
        ],
        sandbox_tables=[],
    )
    CONNECTORS.append(new_conn)
    _record_audit(
        tenant_id="tenant-retail-uk",
        incident_id=None,
        actor="Cloud Platform Architect",
        role="GCP Partner Administrator",
        action="CONNECTOR_REGISTERED",
        resources=[req.host_or_uri],
        access_mode="READ_ONLY_METADATA_HANDSHAKE",
        details=f"Registered new {req.gcp_service} ({req.dialect}) connector '{req.name}'.",
    )
    return new_conn


@app.get("/api/sandbox/catalog")
def get_sandbox_catalog() -> Dict[str, Any]:
    return {
        "sandbox_engine": "DataTrust AI Multi-Database SQL Sandbox (BigQuery, AlloyDB, Spanner, Cloud SQL, Bigtable, Firestore)",
        "tables": sandbox_db.get_table_catalog_summary(),
    }


@app.get("/api/incidents", response_model=List[Incident])
def list_incidents(tenant_id: Optional[str] = None) -> List[Incident]:
    items = list(INCIDENTS.values())
    if tenant_id and tenant_id != "all":
        items = [i for i in items if i.tenant_id == tenant_id]
    return items


@app.get("/api/incidents/{incident_id}", response_model=Incident)
def get_incident(incident_id: str) -> Incident:
    inc = INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    if inc.verification_proof is None:
        inc.verification_proof = run_five_gate_verification(inc)
    return inc


@app.post("/api/incidents/{incident_id}/verify", response_model=Incident)
def verify_incident_repair(incident_id: str, req: RunVerificationRequest) -> Incident:
    inc = INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    if req.custom_proposed_sql and req.custom_proposed_sql.strip():
        inc.repair_proposal.proposed_sql = req.custom_proposed_sql.strip()

    proof = run_five_gate_verification(inc, custom_proposed_sql=req.custom_proposed_sql)
    inc.verification_proof = proof
    if proof.overall_passed and inc.loop_stage not in (IncidentLoopStage.APPROVED if hasattr(IncidentLoopStage, "APPROVED") else IncidentLoopStage.RESOLVED, IncidentLoopStage.RESOLVED):
        inc.loop_stage = IncidentLoopStage.PROVE

    _record_audit(
        tenant_id=inc.tenant_id,
        incident_id=inc.incident_id,
        actor=req.executed_by,
        role="Data Reliability Engineer",
        action="SANDBOX_5_GATE_VERIFICATION_EXECUTED",
        resources=[inc.repair_proposal.target_asset],
        access_mode="ISOLATED_SANDBOX_CLONE",
        details=(
            f"5-Gate verification {'PASSED' if proof.overall_passed else 'FAILED'}: "
            f"Before={proof.reported_broken_metric_display} -> After={proof.repaired_metric_display} "
            f"({proof.reconciliation_match_pct}% reconciliation match)."
        ),
    )
    return inc


@app.post("/api/incidents/{incident_id}/approve", response_model=Incident)
def approve_or_manage_incident(incident_id: str, req: ApprovalActionRequest) -> Incident:
    inc = INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if "VIEWER" in req.reviewer_role.upper():
        _record_audit(
            tenant_id=inc.tenant_id,
            incident_id=inc.incident_id,
            actor=req.reviewer_name,
            role=req.reviewer_role,
            action="RBAC_ACCESS_DENIED_403",
            resources=[inc.repair_proposal.target_asset],
            access_mode="BLOCKED_BY_IAM_POLICY",
            details=f"Blocked {req.action} attempt by read-only role '{req.reviewer_role}'. Requires DATA_GOVERNANCE_APPROVER or GCP_PARTNER_ADMIN.",
        )
        raise HTTPException(
            status_code=403,
            detail=f"RBAC Policy Violation (403 Forbidden): Role '{req.reviewer_role}' has Read-Only access and is not authorized to execute '{req.action}'. Switch to a Data Governance Approver or GCP Partner Admin account.",
        )

    if req.action in ("APPROVE_AND_DEPLOY", "GENERATE_GIT_PR"):
        if inc.verification_proof is None:
            inc.verification_proof = run_five_gate_verification(inc)
        if not inc.verification_proof.overall_passed:
            raise HTTPException(
                status_code=400,
                detail="Cannot approve repair: 5-Gate Deterministic Verification Sandbox has not passed.",
            )

        inc.loop_stage = IncidentLoopStage.RESOLVED if req.action == "APPROVE_AND_DEPLOY" else IncidentLoopStage.APPROVE
        inc.approved_by = req.reviewer_name
        inc.approved_role = req.reviewer_role
        inc.approved_at = now_str

        # Mark lineage nodes as REPAIRED / HEALTHY when deployed
        if req.action == "APPROVE_AND_DEPLOY":
            for node in inc.lineage_nodes:
                if node.status in ("ROOT_CAUSE_DEFECT", "IMPACTED_DOWNSTREAM"):
                    node.status = "REPAIRED"
            for edge in inc.lineage_edges:
                edge.is_broken_path = False

        if inc.git_pr is None:
            inc.git_pr = GitPullRequestArtifact(
                pr_number=1400 + len(AUDIT_LOGS),
                repository="gcp-enterprise-data/analytics-dbt-models",
                branch_name=f"datatrust-ai/fix-{inc.incident_id.lower()}",
                base_branch="main",
                title=f"fix({inc.repair_proposal.target_asset}): verified resolution for {inc.incident_id}",
                status="MERGED" if req.action == "APPROVE_AND_DEPLOY" else "OPEN_APPROVED",
                author="DataTrust AI Autonomous Engineer",
                reviewer_role=req.reviewer_role,
                files_changed=[
                    inc.repair_proposal.file_path_in_repo,
                    "tests/reconciliation/assert_zero_variance.sql",
                ],
                markdown_body=(
                    f"## DataTrust AI Verified Remediation — {inc.incident_id}\n"
                    f"- **Approved By**: {req.reviewer_name} ({req.reviewer_role})\n"
                    f"- **Root Cause**: {inc.root_cause_technical}\n"
                    f"- **Before Fix**: `{inc.reported_value}`\n"
                    f"- **After Fix (Verified)**: `{inc.expected_value}` (`100.0%` reconciliation match)\n"
                    f"- **Reviewer Comment**: {req.comment}"
                ),
                created_at=now_str,
            )
        else:
            inc.git_pr.status = "MERGED" if req.action == "APPROVE_AND_DEPLOY" else "OPEN_APPROVED"

        _record_audit(
            tenant_id=inc.tenant_id,
            incident_id=inc.incident_id,
            actor=req.reviewer_name,
            role=req.reviewer_role,
            action=f"GOVERNANCE_{req.action}",
            resources=[inc.repair_proposal.target_asset, inc.git_pr.repository],
            access_mode="HUMAN_APPROVED_CONTROLLED_RELEASE",
            details=f"{req.action} completed by {req.reviewer_name}. Comment: {req.comment}",
        )

    elif req.action == "ROLLBACK":
        inc.loop_stage = IncidentLoopStage.ROLLED_BACK
        for node in inc.lineage_nodes:
            if node.status == "REPAIRED":
                node.status = "ROOT_CAUSE_DEFECT"
        if inc.git_pr:
            inc.git_pr.status = "REVERTED"

        _record_audit(
            tenant_id=inc.tenant_id,
            incident_id=inc.incident_id,
            actor=req.reviewer_name,
            role=req.reviewer_role,
            action="GOVERNANCE_SAFE_ROLLBACK_EXECUTED",
            resources=[inc.repair_proposal.target_asset],
            access_mode="BIGQUERY_TIME_TRAVEL_RESTORE",
            details=f"Executed 1-click safe rollback script for {inc.incident_id}. Comment: {req.comment}",
        )

    return inc


@app.post("/api/incidents/simulate-webhook", response_model=Incident)
def simulate_incoming_webhook_incident(req: SimulateWebhookRequest) -> Incident:
    """
    Simulates a live incoming alert from Dataplex, Firestore->BigQuery Export, Monte Carlo, or Soda AI
    and runs the autonomous 6-stage investigation & 5-Gate sandbox proof.
    """
    inc_id = "INC-2026-005" if "INC-2026-005" not in INCIDENTS else f"INC-2026-00{len(INCIDENTS) + 1}"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    new_inc = Incident(
        incident_id=inc_id,
        tenant_id="tenant-logistics-saas",
        title=req.custom_title or "Enterprise SaaS MRR Attribution Drop (-45.6% / £42,000 Missing MRR)",
        subtitle=f"Triggered via {req.alert_source} across {req.gcp_database}",
        severity=IncidentSeverity.CRITICAL,
        loop_stage=IncidentLoopStage.PROVE,
        detected_at=now_str,
        alert_source=req.alert_source,
        source_database="Firestore Document Database (collections/subscriptions)",
        pipeline_layer="BigQuery Firestore Export Extension -> dbt Mart",
        target_warehouse="BigQuery (saas_finance.fct_enterprise_mrr)",
        bi_Consumer="Looker (Executive ARR & Net Dollar Retention Board View)",
        metric_name="Enterprise Tier Monthly Recurring Revenue (GBP)",
        expected_value="£92,000",
        reported_value="£50,000",
        variance_pct=-45.6,
        financial_exposure="£42,000 / month MRR (£504,000 ARR) unattributed in Looker",
        confidence_score=98.9,
        executive_summary=(
            "DataTrust AI ingested a live webhook alert and traced a £42,000 drop in reported Enterprise MRR across "
            "Looker, BigQuery, and Firestore. Firestore document schema v2 (`v2_nested_map`) moved the subscription tier "
            "field from flat `plan_tier_legacy` to nested `nested_subscription_tier_code`. The BigQuery analytics view "
            "filtered only on `plan_tier_legacy = 'ENTERPRISE'`, omitting 21 new enterprise accounts (£42,000 MRR)."
        ),
        root_cause_technical=(
            "Firestore document schema migration (`v1_flat` -> `v2_nested_map`) moved `plan_tier_legacy` to "
            "`nested_subscription_tier_code` without updating the BigQuery Firestore export projection view."
        ),
        hypotheses=[
            HypothesisItem(
                hypothesis_id="H5-1",
                category="3. Source System Document Schema Drift (Firestore NoSQL)",
                title="Did Firestore subscription documents migrate `plan_tier` into a nested JSON map?",
                verdict=HypothesisVerdict.PROVEN_ROOT_CAUSE,
                confidence_pct=98.9,
                diagnostic_sql=(
                    "SELECT doc_schema_version, plan_tier_legacy, nested_subscription_tier_code, "
                    "COUNT(*) AS docs, SUM(mrr_gbp) AS mrr_gbp FROM firestore_subscriptions_raw GROUP BY 1, 2, 3;"
                ),
                evidence_summary="PROVEN: 21 `v2_nested_map` documents (£42,000 MRR) have `plan_tier_legacy = NULL` and `nested_subscription_tier_code = 'ENTERPRISE'`.",
                metric_observed="21 enterprise subscriptions (£42,000 MRR) stored in nested field",
            )
        ],
        lineage_nodes=[
            LineageNode(
                node_id="node-firestore-coll",
                label="firestore_subscriptions_raw",
                gcp_product="Firestore",
                layer="OLTP_SOURCE",
                status="ROOT_CAUSE_DEFECT",
                schema_fields=["doc_id", "customer_org", "plan_tier_legacy", "nested_subscription_tier_code", "mrr_gbp"],
                dataplex_policy_tags=["DATAPLEX:CUSTOMER_CONTRACT_TIER"],
                freshness_lag="1.4 min",
                row_count=46,
                defect_note="21 v2 documents write 'ENTERPRISE' to nested_subscription_tier_code",
            ),
            LineageNode(
                node_id="node-bq-mrr-mart",
                label="fct_enterprise_mrr (BigQuery)",
                gcp_product="BigQuery",
                layer="WAREHOUSE_MART",
                status="IMPACTED_DOWNSTREAM",
                schema_fields=["doc_schema_version", "subscription_count", "reported_revenue_gbp"],
                dataplex_policy_tags=["DATAPLEX:REVENUE_ARR"],
                freshness_lag="3.0 min",
                row_count=2,
                defect_note="Excludes £42,000 MRR when filtering only on plan_tier_legacy",
            ),
        ],
        lineage_edges=[
            LineageEdge(source="node-firestore-coll", target="node-bq-mrr-mart", relationship="Firebase BigQuery Export Stream", is_broken_path=True),
        ],
        repair_proposal=RepairProposal(
            proposal_id=f"PROP-{inc_id}",
            target_asset="saas_finance.fct_enterprise_mrr",
            target_gcp_product="Firestore + BigQuery",
            sql_dialect="GoogleSQL (BigQuery)",
            file_path_in_repo="models/marts/saas/fct_enterprise_mrr.sql",
            explanation=(
                "Coalesce `plan_tier_legacy` and `nested_subscription_tier_code` so both v1 flat and v2 nested Firestore "
                "documents are included in Enterprise MRR calculations."
            ),
            root_cause_commit_or_event="Firestore Billing Microservice v2.0 nested document deployment",
            original_sql=(
                "SELECT\n"
                "    'Enterprise SaaS' AS region,\n"
                "    COUNT(*) AS order_batches,\n"
                "    SUM(CASE WHEN plan_tier_legacy = 'ENTERPRISE' THEN mrr_gbp ELSE 0 END) AS reported_revenue_gbp\n"
                "FROM firestore_subscriptions_raw"
            ),
            proposed_sql=(
                "SELECT\n"
                "    'Enterprise SaaS' AS region,\n"
                "    COUNT(*) AS order_batches,\n"
                "    SUM(CASE WHEN COALESCE(plan_tier_legacy, nested_subscription_tier_code) = 'ENTERPRISE' THEN mrr_gbp ELSE 0 END) AS reported_revenue_gbp\n"
                "FROM firestore_subscriptions_raw"
            ),
            backfill_sql="-- Refresh materialized BigQuery view saas_finance.fct_enterprise_mrr",
            rollback_sql="-- Restore previous view definition via BigQuery metadata snapshot",
            sandbox_verify_before_query=(
                "SELECT 'Enterprise SaaS' AS region, COUNT(*) AS order_batches, "
                "SUM(CASE WHEN plan_tier_legacy = 'ENTERPRISE' THEN mrr_gbp ELSE 0 END) AS reported_revenue_gbp "
                "FROM firestore_subscriptions_raw"
            ),
            sandbox_verify_after_query=(
                "SELECT 'Enterprise SaaS' AS region, COUNT(*) AS order_batches, "
                "SUM(CASE WHEN COALESCE(plan_tier_legacy, nested_subscription_tier_code) = 'ENTERPRISE' THEN mrr_gbp ELSE 0 END) AS reported_revenue_gbp "
                "FROM firestore_subscriptions_raw"
            ),
            affected_downstream_assets=[
                "Looker: Executive ARR & Net Dollar Retention Board View",
                "BigQuery: saas_finance.fct_enterprise_mrr",
            ],
        ),
    )

    new_inc.verification_proof = run_five_gate_verification(new_inc)
    INCIDENTS[new_inc.incident_id] = new_inc

    _record_audit(
        tenant_id=new_inc.tenant_id,
        incident_id=new_inc.incident_id,
        actor=req.alert_source,
        role="Autonomous Webhook & Vertex AI Gemini 3.1 Pro Investigator",
        action="WEBHOOK_INCIDENT_INVESTIGATED_AND_VERIFIED",
        resources=["firestore://collections/subscriptions", "bigquery://saas_finance.fct_enterprise_mrr"],
        access_mode="ISOLATED_SANDBOX_EXECUTION",
        details=f"Ingested live alert {new_inc.incident_id}, diagnosed Firestore nested schema drift, and verified £42,000 MRR recovery.",
    )
    return new_inc


@app.get("/api/analytics/presets")
def get_analytics_presets() -> List[Dict[str, str]]:
    return PRESET_GOVERNED_QUESTIONS


@app.post("/api/analytics/query", response_model=GovernedAnalyticsResponse)
def execute_analytics_query(req: GovernedAnalyticsRequest) -> GovernedAnalyticsResponse:
    try:
        res = run_governed_analytics_query(req)
        _record_audit(
            tenant_id="tenant-retail-uk",
            incident_id=None,
            actor="Data Engineer / Analyst",
            role="Governed Analytics User (Read-Only)",
            action="GOVERNED_AI_SQL_QUERY",
            resources=[req.target_database],
            access_mode="READ_ONLY_SELECT_ENFORCED",
            details=f"Executed governed query '{res.question}' ({res.row_count} rows, {res.execution_ms} ms).",
        )
        return res
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api/audit-logs", response_model=List[AuditLogEntry])
def list_audit_logs() -> List[AuditLogEntry]:
    return AUDIT_LOGS


@app.get("/api/partner-ecosystem")
def get_partner_ecosystem_blueprint() -> Dict[str, Any]:
    """
    Returns the complete Google Cloud Deployment Models, Partner Commercialization Routes,
    Market Differentiation vs. Existing Tools, and Production Readiness Checklist from datatrust.docx.
    """
    return {
        "deployment_models": [
            {
                "id": "OPTION_A_CUSTOMER_GCP",
                "title": "Option A — Customer's Own Google Cloud Project (Recommended for Enterprise)",
                "badge": "Best for Enterprise Security & Data Residency",
                "architecture": "Cloud Run / GKE inside Customer VPC + Workload Identity + Least-Privilege IAM Service Account",
                "summary": (
                    "DataTrust AI runs strictly inside the customer's Google Cloud perimeter. It accesses approved BigQuery, "
                    "AlloyDB, Cloud Spanner, Cloud SQL, Bigtable, Dataplex lineage, and Cloud Logging via narrowly scoped "
                    "read-only roles. Zero raw data ever leaves the customer's project."
                ),
                "best_for": "Enterprises with strict security, SOX/PCI/GDPR compliance, and data residency mandates.",
            },
            {
                "id": "OPTION_B_MANAGED_SAAS",
                "title": "Option B — Managed DataTrust AI SaaS on Google Cloud",
                "badge": "Fastest Onboarding & Centralized Updates",
                "architecture": "Multi-Tenant Cloud Run Control Plane + Cross-Project Scoped IAM Service Account Impersonation",
                "summary": (
                    "Hosted on Google Cloud Run with strict tenant isolation, Secret Manager / Cloud KMS encryption, "
                    "and separate cryptographic audit trails. Connects to customer databases using read-only metadata & aggregate probes."
                ),
                "best_for": "Mid-market data engineering teams wanting turnkey incident resolution in under 15 minutes.",
            },
            {
                "id": "OPTION_C_PARTNER_DELIVERED",
                "title": "Option C — Google Cloud Partner-Delivered Managed Reliability",
                "badge": "Built for GCP Consulting & MSP Partners",
                "architecture": "Partner Multi-Tenant Control Plane + Reusable Industry Playbooks + Client VPC Execution Runners",
                "summary": (
                    "Google Cloud Partner Advantage consultancies and system integrators deploy and operate DataTrust AI across "
                    "dozens of client environments, standardizing L2/L3 incident triage and delivering verified Git PR fixes."
                ),
                "best_for": "Google Cloud consulting partners, data practices, and large enterprises using managed data services.",
            },
        ],
        "commercial_routes": [
            {
                "route": "Route 1 — Google Cloud Consulting Partners",
                "description": "Systems integrators and data consultancies recommend, deploy, and manage DataTrust AI as part of data modernization and managed reliability retainers.",
                "deliverable": "Terraform / IaC deployment package, custom policy templates, and partner enablement playbooks.",
            },
            {
                "route": "Route 2 — Google Cloud Marketplace",
                "description": "Commercial SaaS or deployable container/agent listing allowing enterprise procurement through existing Google Cloud commit spend.",
                "deliverable": "Validated Cloud Run / GKE package with usage/subscription metering and SLA support.",
            },
            {
                "route": "Route 3 — Partner-Embedded API Solution",
                "description": "Consultancies and platform providers embed DataTrust AI's investigation and 5-Gate verification API directly into their internal delivery portals.",
                "deliverable": "REST/Webhook APIs, white-label/co-branded PR templates, and configurable governance gates.",
            },
        ],
        "competitor_comparison": [
            {
                "vendor": "Monte Carlo",
                "current_capability": "Data observability, lineage alerts, and AI hypothesis troubleshooting in warehouses.",
                "datatrust_wedge": "DataTrust AI accepts Monte Carlo alerts via webhook, traces upstream into AlloyDB/Spanner/Cloud SQL, generates the code fix, and proves 100% reconciliation in an isolated sandbox.",
            },
            {
                "vendor": "Soda AI",
                "current_capability": "Data contracts, natural-language quality checks, and table-level data cleansing.",
                "datatrust_wedge": "DataTrust AI repairs multi-dialect transformation logic (BigQuery, dbt, Spanner, AlloyDB) and validates downstream Looker blast radius before opening a Git PR.",
            },
            {
                "vendor": "dbt Core / Cloud",
                "current_capability": "SQL transformation DAGs, schema tests, and CI execution.",
                "datatrust_wedge": "When a dbt test fails due to an upstream AlloyDB/Cloud SQL schema change, DataTrust AI diagnoses the cross-database root cause and writes the verified dbt model PR.",
            },
            {
                "vendor": "Native BigQuery & Dataplex Scans",
                "current_capability": "Native data-quality rules and Data Lineage API records within Google Cloud.",
                "datatrust_wedge": "Builds directly on top of Dataplex scans & Lineage API as the autonomous investigation, repair, verification, and approval layer.",
            },
        ],
        "production_guardrails": [
            "Start with strictly Read-Only access to production Google Cloud databases.",
            "Execute all proposed SQL/DDL patches against an isolated sandbox or zero-copy table clone first.",
            "Enforce the principle: AI proposes and explains; deterministic code validates (5-Gate Sandbox).",
            "Never send raw customer PII rows to the LLM when structural metadata and aggregate stats suffice.",
            "Require explicit human-in-the-loop RBAC approval before merging a Git PR or modifying production views.",
        ],
    }
