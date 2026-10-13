from __future__ import annotations
from typing import Dict, List, Optional, Tuple
from .database_engine import sandbox_db
from .models import GovernedAnalyticsRequest, GovernedAnalyticsResponse


PRESET_GOVERNED_QUESTIONS: List[Dict[str, str]] = [
    {
        "id": "q-revenue-drop",
        "label": "Why did daily retail revenue fall by 32% (£100k -> £68k) overnight?",
        "database": "AlloyDB for PostgreSQL + BigQuery",
        "question": "Why did daily retail revenue fall by 32% overnight across UK and EU regions?",
    },
    {
        "id": "q-alloydb-drift",
        "label": "Show AlloyDB payment_status vs settlement_state schema drift impact by region",
        "database": "AlloyDB for PostgreSQL",
        "question": "Show me the breakdown of AlloyDB payment_status vs settlement_state by region and schema_version",
    },
    {
        "id": "q-spanner-duplicates",
        "label": "What is causing the duplicate charge spike in Region West in Cloud Spanner?",
        "database": "Cloud Spanner + BigQuery",
        "question": "What's causing the duplicate charge spike in Region West in Cloud Spanner?",
    },
    {
        "id": "q-cloudsql-nulls",
        "label": "Which Cloud SQL regional shards have NULL dispatch timestamps?",
        "database": "Cloud SQL (MySQL) + Cloud Composer",
        "question": "Which Cloud SQL regional shards have NULL dispatch timestamps and why?",
    },
    {
        "id": "q-bigtable-iot",
        "label": "Inspect Warehouse B3 sensor heartbeat gap in Cloud Bigtable",
        "database": "Cloud Bigtable Federated SQL",
        "question": "Compare cold-chain sensor readings across Warehouse A1, B3, and C2 in Cloud Bigtable",
    },
    {
        "id": "q-firestore-mrr",
        "label": "Audit Firestore Enterprise SaaS MRR schema drift (v1 flat vs v2 nested)",
        "database": "Firestore + BigQuery Export",
        "question": "Show Firestore subscription MRR split between v1 flat schema and v2 nested map schema",
    },
]


def _translate_nl_to_governed_sql(question: str) -> Tuple[str, str, str, List[str]]:
    """
    Translates natural-language analytical & root-cause questions into governed, read-only SQL
    against the multi-database Google Cloud sandbox, returning:
    (sql, dialect, explanation, ai_insights)
    """
    q_lower = question.lower()

    if "spanner" in q_lower or "duplicate" in q_lower or "region west" in q_lower or "charge" in q_lower:
        sql = (
            "SELECT\n"
            "    region,\n"
            "    gateway_timeout_ms,\n"
            "    COUNT(*) AS total_ingested_events,\n"
            "    COUNT(DISTINCT idempotency_key) AS unique_idempotent_charges,\n"
            "    SUM(CASE WHEN retry_attempt > 1 THEN 1 ELSE 0 END) AS duplicate_retry_events,\n"
            "    SUM(charge_amount_gbp) AS raw_billed_gbp,\n"
            "    SUM(CASE WHEN retry_attempt = 1 THEN charge_amount_gbp ELSE 0 END) AS deduplicated_billed_gbp,\n"
            "    SUM(CASE WHEN retry_attempt > 1 THEN charge_amount_gbp ELSE 0 END) AS duplicate_exposure_gbp\n"
            "FROM spanner_payment_events\n"
            "GROUP BY region, gateway_timeout_ms\n"
            "ORDER BY duplicate_exposure_gbp DESC\n"
            "LIMIT 25;"
        )
        dialect = "GoogleSQL (Cloud Spanner + BigQuery)"
        explanation = (
            "Aggregates Cloud Spanner payment change-stream events by region and gateway timeout, comparing raw ingested events "
            "against unique `idempotency_key` counts to isolate duplicate retry charges."
        )
        insights = [
            "Region West experienced a gateway timeout reduction from 30,000ms to 10,000ms, triggering 50 premature retry events.",
            "Batch processor v2.3 lacked `idempotency_key` deduplication, inflating Region West billing from £5,000 to £9,850 (+£4,850 exposure).",
            "Region East and Region North remain at 30,000ms timeout with 0 duplicate retry events.",
        ]
        return sql, dialect, explanation, insights

    if "cloud sql" in q_lower or "cloudsql" in q_lower or "shipment" in q_lower or "apac" in q_lower or "timestamp" in q_lower:
        sql = (
            "SELECT\n"
            "    shard_region,\n"
            "    carrier,\n"
            "    ts_format_version,\n"
            "    COUNT(*) AS total_shipments,\n"
            "    COUNT(parsed_iso_only_ts) AS valid_iso_timestamps,\n"
            "    SUM(CASE WHEN parsed_iso_only_ts IS NULL THEN 1 ELSE 0 END) AS null_timestamps,\n"
            "    COUNT(COALESCE(parsed_iso_only_ts, raw_dispatched_ts)) AS after_polymorphic_fix_valid\n"
            "FROM cloudsql_shipments\n"
            "GROUP BY shard_region, carrier, ts_format_version\n"
            "ORDER BY null_timestamps DESC\n"
            "LIMIT 25;"
        )
        dialect = "GoogleSQL / Cloud SQL MySQL Federation"
        explanation = (
            "Compares shipment timestamp parsing across EMEA, AMER, and APAC Cloud SQL MySQL shards, highlighting where "
            "`EPOCH_MS_V2` serialization caused `parsed_iso_only_ts` to return NULL."
        )
        insights = [
            "100% of APAC-CloudSQL rows (28 shipments) use `EPOCH_MS_V2` (13-digit epoch ms), causing a 28.0% global NULL spike.",
            "Applying polymorphic timestamp normalization restores 100 / 100 valid shipment timestamps (0% NULLs).",
        ]
        return sql, dialect, explanation, insights

    if "bigtable" in q_lower or "warehouse b3" in q_lower or "sensor" in q_lower or "cold-chain" in q_lower or "telemetry" in q_lower:
        sql = (
            "SELECT\n"
            "    warehouse_id,\n"
            "    firmware_version,\n"
            "    COUNT(*) AS total_row_keys,\n"
            "    COUNT(cf_telemetry_temp_c) AS legacy_qualifier_readings,\n"
            "    COUNT(cf_telemetry_temp_c_v2) AS v2_qualifier_readings,\n"
            "    COUNT(COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)) AS coalesced_readings,\n"
            "    ROUND(AVG(COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)), 2) AS avg_temp_celsius\n"
            "FROM bigtable_sensor_telemetry\n"
            "GROUP BY warehouse_id, firmware_version\n"
            "ORDER BY warehouse_id\n"
            "LIMIT 25;"
        )
        dialect = "GoogleSQL (BigQuery Federated over Cloud Bigtable)"
        explanation = (
            "Queries the Cloud Bigtable federated table across `cf_telemetry_temp_c` and `cf_telemetry_temp_c_v2` column qualifiers "
            "to verify sensor heartbeat completeness by warehouse and firmware version."
        )
        insights = [
            "Warehouse-B3 sensors upgraded to `fw-v3.1-ota` write 100% of temperature readings to `cf_telemetry_temp_c_v2` (avg 2.1°C).",
            "Coalescing both Bigtable column qualifiers recovers all 30 missing sensor heartbeats in Warehouse-B3.",
        ]
        return sql, dialect, explanation, insights

    if "firestore" in q_lower or "mrr" in q_lower or "subscription" in q_lower or "nested" in q_lower:
        sql = (
            "SELECT\n"
            "    doc_schema_version,\n"
            "    plan_tier_legacy,\n"
            "    nested_subscription_tier_code,\n"
            "    COUNT(*) AS subscription_docs,\n"
            "    SUM(CASE WHEN plan_tier_legacy = 'ENTERPRISE' THEN mrr_gbp ELSE 0 END) AS legacy_query_mrr_gbp,\n"
            "    SUM(CASE WHEN COALESCE(plan_tier_legacy, nested_subscription_tier_code) = 'ENTERPRISE' THEN mrr_gbp ELSE 0 END) AS reconciled_mrr_gbp\n"
            "FROM firestore_subscriptions_raw\n"
            "GROUP BY doc_schema_version, plan_tier_legacy, nested_subscription_tier_code\n"
            "ORDER BY doc_schema_version\n"
            "LIMIT 25;"
        )
        dialect = "GoogleSQL (BigQuery Firestore Export)"
        explanation = (
            "Inspects Firestore subscription documents exported to BigQuery, comparing flat `plan_tier_legacy` projection "
            "against `COALESCE(plan_tier_legacy, nested_subscription_tier_code)`."
        )
        insights = [
            "21 Firestore documents using `v2_nested_map` store `'ENTERPRISE'` inside `nested_subscription_tier_code`, leaving `plan_tier_legacy` NULL.",
            "Coalescing both document paths recovers £42,000 in monthly recurring revenue (£50,000 -> £92,000 total MRR).",
        ]
        return sql, dialect, explanation, insights

    if "schema_version" in q_lower or "settlement_state" in q_lower or "alloydb" in q_lower:
        sql = (
            "SELECT\n"
            "    o.region,\n"
            "    p.schema_version,\n"
            "    COALESCE(p.payment_status, 'NULL (Drifted)') AS payment_status_col,\n"
            "    p.settlement_state,\n"
            "    COUNT(o.order_id) AS order_batches,\n"
            "    SUM(o.net_revenue_gbp) AS revenue_gbp\n"
            "FROM alloydb_orders o\n"
            "INNER JOIN alloydb_payments p ON o.order_id = p.order_id\n"
            "GROUP BY o.region, p.schema_version, p.payment_status, p.settlement_state\n"
            "ORDER BY o.region, p.schema_version\n"
            "LIMIT 50;"
        )
        dialect = "PostgreSQL / GoogleSQL (AlloyDB + BigQuery)"
        explanation = (
            "Joins `alloydb_orders` with `alloydb_payments` grouped by region and `schema_version` to expose exact row counts "
            "and revenue totals impacted by the AlloyDB v4.2 `settlement_state` migration."
        )
        insights = [
            "Every region has both `v4.1-legacy` (`payment_status = 'COMPLETED'`) and `v4.2-drifted` (`payment_status IS NULL`, `settlement_state = 'SETTLED_OK'`) records.",
            "Total `v4.2-drifted` revenue across all 5 regions is exactly £32,000 (32 order batches), matching the 32% Looker dashboard drop.",
        ]
        return sql, dialect, explanation, insights

    # Default flagship question: "Why did revenue fall this week / overnight?"
    sql = (
        "SELECT\n"
        "    o.region,\n"
        "    COUNT(o.order_id) AS total_alloydb_batches,\n"
        "    SUM(o.net_revenue_gbp) AS expected_alloydb_revenue_gbp,\n"
        "    SUM(CASE WHEN p.payment_status = 'COMPLETED' THEN o.net_revenue_gbp ELSE 0 END) AS reported_broken_bq_gbp,\n"
        "    SUM(CASE WHEN p.payment_status IS NULL AND p.settlement_state = 'SETTLED_OK' THEN o.net_revenue_gbp ELSE 0 END) AS excluded_by_schema_drift_gbp,\n"
        "    SUM(CASE WHEN COALESCE(p.payment_status, p.settlement_state) IN ('COMPLETED', 'SETTLED_OK') THEN o.net_revenue_gbp ELSE 0 END) AS repaired_bq_revenue_gbp\n"
        "FROM alloydb_orders o\n"
        "INNER JOIN alloydb_payments p ON o.order_id = p.order_id\n"
        "GROUP BY o.region\n"
        "ORDER BY expected_alloydb_revenue_gbp DESC\n"
        "LIMIT 25;"
    )
    dialect = "GoogleSQL (BigQuery + AlloyDB Federated Reconciliation)"
    explanation = (
        "Reconciles AlloyDB source order revenue against the broken BigQuery mart (`payment_status = 'COMPLETED'`) and "
        "the repaired transformation (`COALESCE(payment_status, settlement_state) IN ('COMPLETED', 'SETTLED_OK')`) by region."
    )
    insights = [
        "Expected Daily Revenue across all 5 regions in AlloyDB is £100,000 (UK-London £35k, UK-Manchester £20k, EU-Dublin £16k, UK-Edinburgh £15k, EU-Berlin £14k).",
        "Broken BigQuery mart reports only £68,000 (-32.0%) because 32 order batches (£32,000) have `payment_status IS NULL` and `settlement_state = 'SETTLED_OK'`.",
        "Applying the `COALESCE(p.payment_status, p.settlement_state)` repair restores 100% (£100,000) across all regions.",
    ]
    return sql, dialect, explanation, insights


def run_governed_analytics_query(req: GovernedAnalyticsRequest) -> GovernedAnalyticsResponse:
    """
    Executes a governed, read-only analytical query (either translated from natural language or custom SQL)
    against the multi-database sandbox with AST safety and row limits enforced.
    """
    if req.custom_sql and req.custom_sql.strip():
        sql = req.custom_sql.strip()
        question_label = req.question or "Custom Governed Read-Only SQL Execution"
        dialect = "GoogleSQL / ANSI SQL Sandbox"
        explanation = "Executed custom engineer-provided read-only SQL query under AST safety and row-limit guardrails."
        insights = [
            "AST safety check confirmed read-only SELECT execution with zero destructive DDL/DML tokens.",
            "Results fetched directly from the live multi-database Google Cloud sandbox.",
        ]
    else:
        question_label = req.question or "Why did daily retail revenue fall by 32% overnight?"
        sql, dialect, explanation, insights = _translate_nl_to_governed_sql(question_label)

    ast_ok, ast_details = sandbox_db.validate_sql_ast_safety(sql)
    if not ast_ok:
        raise ValueError("; ".join(ast_details))

    cols, rows, duration_ms = sandbox_db.execute_read_only_query(sql, max_rows=req.max_rows)

    return GovernedAnalyticsResponse(
        question=question_label,
        generated_sql=sql,
        dialect=dialect,
        target_database=req.target_database,
        ast_safety_passed=True,
        read_only_enforced=True,
        estimated_bytes_scanned=max(4096, len(rows) * 1024),
        explanation=explanation,
        ai_insights=insights,
        columns=cols,
        rows=rows,
        row_count=len(rows),
        execution_ms=duration_ms,
    )
