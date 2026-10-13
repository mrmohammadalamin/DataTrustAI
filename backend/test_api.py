from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_and_overview():
    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    data = r_health.json()
    assert data["status"] == "ok"
    assert data["sandbox_tables_count"] == 8
    assert data["active_connectors"] >= 10

    r_ov = client.get("/api/overview")
    assert r_ov.status_code == 200
    ov = r_ov.json()
    assert len(ov["closed_loop_stages"]) == 6
    assert len(ov["incidents"]) >= 4


def test_flagship_incident_001_verification_proof():
    r = client.get("/api/incidents/INC-2026-001")
    assert r.status_code == 200
    inc = r.json()
    assert inc["expected_value"] == "£100,000"
    assert inc["reported_value"] == "£68,000"
    assert len(inc["hypotheses"]) == 6

    proof = inc["verification_proof"]
    assert proof is not None
    assert proof["overall_passed"] is True
    assert proof["reported_broken_metric_display"] == "£68,000"
    assert proof["repaired_metric_display"] == "£100,000"
    assert len(proof["gates"]) == 5
    assert all(g["status"] == "PASSED" for g in proof["gates"])


def test_verify_and_approve_and_rollback_workflow():
    # Re-run 5-gate verification on INC-2026-002 (Cloud Spanner Duplicate Charge Spike)
    r_ver = client.post(
        "/api/incidents/INC-2026-002/verify",
        json={"executed_by": "Pytest Verification Runner"},
    )
    assert r_ver.status_code == 200
    inc2 = r_ver.json()
    assert inc2["verification_proof"]["overall_passed"] is True
    assert inc2["verification_proof"]["reported_broken_metric_display"] == "£18,350"
    assert inc2["verification_proof"]["repaired_metric_display"] == "£13,500"

    # Approve and deploy INC-2026-002
    r_app = client.post(
        "/api/incidents/INC-2026-002/approve",
        json={
            "action": "APPROVE_AND_DEPLOY",
            "reviewer_name": "Alex Rivera",
            "reviewer_role": "Principal Data Reliability Architect",
            "comment": "Verified Spanner idempotency deduplication.",
        },
    )
    assert r_app.status_code == 200
    assert r_app.json()["loop_stage"] == "07_RESOLVED"

    # Rollback INC-2026-002
    r_rb = client.post(
        "/api/incidents/INC-2026-002/approve",
        json={
            "action": "ROLLBACK",
            "reviewer_name": "Alex Rivera",
            "reviewer_role": "Principal Data Reliability Architect",
            "comment": "Testing safe rollback workflow.",
        },
    )
    assert r_rb.status_code == 200
    assert r_rb.json()["loop_stage"] == "08_ROLLED_BACK"


def test_governed_ai_analytics_and_destructive_sql_blocker():
    # Natural language query
    r_nl = client.post(
        "/api/analytics/query",
        json={"question": "Why did daily retail revenue fall by 32% overnight?"},
    )
    assert r_nl.status_code == 200
    nl_data = r_nl.json()
    assert nl_data["ast_safety_passed"] is True
    assert nl_data["row_count"] == 5

    # Destructive SQL must be blocked by Gate 1 AST safety validator
    r_bad = client.post(
        "/api/analytics/query",
        json={"custom_sql": "DROP TABLE alloydb_orders;"},
    )
    assert r_bad.status_code == 400


def test_webhook_simulation_and_partner_ecosystem():
    r_sim = client.post(
        "/api/incidents/simulate-webhook",
        json={
            "alert_source": "Dataplex Universal Catalog Quality Scan",
            "gcp_database": "Firestore -> BigQuery Export",
            "anomaly_type": "SCHEMA_AND_METRIC_DRIFT",
        },
    )
    assert r_sim.status_code == 200
    sim_inc = r_sim.json()
    assert sim_inc["verification_proof"]["overall_passed"] is True
    assert sim_inc["verification_proof"]["repaired_metric_display"] == "£92,000"

    r_part = client.get("/api/partner-ecosystem")
    assert r_part.status_code == 200
    assert len(r_part.json()["deployment_models"]) == 3
    assert len(r_part.json()["commercial_routes"]) == 3


def test_auth_sso_signup_and_rbac_enforcement():
    # 1. Google Cloud SSO Login
    r_sso = client.post(
        "/api/auth/google-sso",
        json={"persona_email": "sarah.chen@omniretail-gcp.com"},
    )
    assert r_sso.status_code == 200
    assert r_sso.json()["user"]["role"] == "DATA_GOVERNANCE_APPROVER"

    # 2. Sign-Up New Enterprise User & GCP Organization
    r_sup = client.post(
        "/api/auth/signup",
        json={
            "full_name": "Mohammed Cloud Lead",
            "email": "mohammed@gcp-customer.io",
            "password": "SecurePass#2026",
            "organization_name": "Global Data Cloud Ltd",
            "gcp_project_id": "gcp-global-data-prod-01",
            "role": "GCP_PARTNER_ADMIN",
        },
    )
    assert r_sup.status_code == 200
    assert r_sup.json()["user"]["gcp_project_id"] == "gcp-global-data-prod-01"

    # 3. Verify RBAC 403 Forbidden when DATA_VIEWER tries to approve production fix
    r_denied = client.post(
        "/api/incidents/INC-2026-001/approve",
        json={
            "action": "APPROVE_AND_DEPLOY",
            "reviewer_name": "Elena Rostova",
            "reviewer_role": "DATA_VIEWER (roles/bigquery.metadataViewer)",
            "comment": "Viewer attempting production approval",
        },
    )
    assert r_denied.status_code == 403

