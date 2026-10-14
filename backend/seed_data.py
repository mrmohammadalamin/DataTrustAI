from __future__ import annotations
from typing import Dict, List
from .models import (
    AuditLogEntry,
    DataConnector,
    DeploymentOption,
    GitPullRequestArtifact,
    HypothesisItem,
    HypothesisVerdict,
    Incident,
    IncidentLoopStage,
    IncidentSeverity,
    LineageEdge,
    LineageNode,
    PartnerRoute,
    RepairProposal,
    TenantWorkspace,
)


def build_initial_tenants() -> List[TenantWorkspace]:
    return [
        TenantWorkspace(
            tenant_id="tenant-retail-uk",
            organization_name="OmniRetail UK & EMEA Group",
            gcp_project_id="gcp-omniretail-prod-eu-west2",
            region="europe-west2 (London)",
            deployment_option=DeploymentOption.OPTION_A_CUSTOMER_GCP,
            partner_name="Direct Enterprise VPC (Customer-Controlled)",
            partner_route=None,
            industry="Retail & E-Commerce",
            service_account_email="datatrust-agent-ro@gcp-omniretail-prod-eu-west2.iam.gserviceaccount.com",
            zero_data_exfiltration=True,
            connected_products=[
                "BigQuery",
                "AlloyDB for PostgreSQL",
                "Datastream",
                "Dataplex Universal Catalog",
                "dbt Cloud",
                "Looker",
            ],
            monthly_incidents_avg=22,
            mttr_minutes_before=240,
            mttr_minutes_datatrust=14,
        ),
        TenantWorkspace(
            tenant_id="tenant-fintech-global",
            organization_name="ApexPay Global FinTech",
            gcp_project_id="gcp-apexpay-ledger-multi",
            region="us-central1 / europe-west1 (Multi-Region)",
            deployment_option=DeploymentOption.OPTION_C_PARTNER_DELIVERED,
            partner_name="Radiant Digital & Altimate GCP Partner Practice",
            partner_route=PartnerRoute.ROUTE_1_CONSULTING_PARTNER,
            industry="Financial Services & Payments",
            service_account_email="datatrust-partner-agent@gcp-apexpay-ledger-multi.iam.gserviceaccount.com",
            zero_data_exfiltration=True,
            connected_products=[
                "Cloud Spanner",
                "Dataflow",
                "BigQuery",
                "Dataplex Universal Catalog",
                "Cloud Monitoring",
                "Monte Carlo Webhook",
            ],
            monthly_incidents_avg=31,
            mttr_minutes_before=310,
            mttr_minutes_datatrust=18,
        ),
        TenantWorkspace(
            tenant_id="tenant-logistics-saas",
            organization_name="VelocitySupply & CloudScale Logistics",
            gcp_project_id="gcp-velocity-platform-global",
            region="asia-northeast1 / us-east1",
            deployment_option=DeploymentOption.OPTION_B_MANAGED_SAAS,
            partner_name="Google Cloud Marketplace SaaS Subscription",
            partner_route=PartnerRoute.ROUTE_2_GCP_MARKETPLACE,
            industry="Supply Chain, Cold-Chain IoT & B2B SaaS",
            service_account_email="datatrust-saas-federated@gcp-velocity-platform-global.iam.gserviceaccount.com",
            zero_data_exfiltration=True,
            connected_products=[
                "Cloud SQL (MySQL)",
                "Cloud Bigtable",
                "Firestore",
                "Cloud Composer (Airflow)",
                "BigQuery",
                "Vertex AI",
            ],
            monthly_incidents_avg=18,
            mttr_minutes_before=195,
            mttr_minutes_datatrust=12,
        ),
    ]


def build_initial_connectors() -> List[DataConnector]:
    return [
        DataConnector(
            connector_id="conn-bigquery",
            name="BigQuery & BigLake Enterprise Warehouse",
            product_family="Google Cloud Analytics & Lakehouse",
            gcp_service="BigQuery",
            dialect="GoogleSQL",
            status="HEALTHY",
            host_or_uri="bigquery://gcp-omniretail-prod-eu-west2/finance_mart",
            auth_mode="Workload Identity + Least-Privilege IAM (bigquery.MetadataViewer, bigquery.jobUser)",
            access_level="READ_ONLY_PRODUCTION + SANDBOX_ISOLATED_CLONE",
            tables_monitored=148,
            active_rules=64,
            freshness_sla_minutes=15,
            current_lag_minutes=3.2,
            capabilities=[
                "Dry-Run Cost & Bytes Estimator",
                "Time Travel (FOR SYSTEM_TIME AS OF)",
                "Native Data Quality Scans",
                "INFORMATION_SCHEMA.JOBS Lineage",
                "Zero-Copy Sandbox Table Clones",
            ],
            sandbox_tables=["bq_fct_daily_revenue_broken", "bq_fct_daily_revenue_fixed"],
        ),
        DataConnector(
            connector_id="conn-alloydb",
            name="AlloyDB for PostgreSQL (Checkout & Orders OLTP)",
            product_family="Google Cloud Operational Databases (OLTP)",
            gcp_service="AlloyDB for PostgreSQL",
            dialect="PostgreSQL 15",
            status="SCHEMA_DRIFT_DETECTED",
            host_or_uri="alloydb://projects/gcp-omniretail-prod/locations/europe-west2/clusters/checkout-primary",
            auth_mode="AlloyDB Auth Proxy + IAM Database Authentication (Read-Only Replica)",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=42,
            active_rules=28,
            freshness_sla_minutes=5,
            current_lag_minutes=1.1,
            capabilities=[
                "Column & Enum Drift Introspection",
                "Logical Replication Slot Health",
                "Cross-System OLTP-to-BigQuery Checksum Probe",
                "AlloyDB Columnar Engine Stats",
            ],
            sandbox_tables=["alloydb_orders", "alloydb_payments"],
        ),
        DataConnector(
            connector_id="conn-spanner",
            name="Cloud Spanner (Global Payment Ledger)",
            product_family="Google Cloud Operational Databases (Distributed Relational)",
            gcp_service="Cloud Spanner",
            dialect="GoogleSQL / Spanner PostgreSQL",
            status="DEGRADED",
            host_or_uri="spanner://projects/gcp-apexpay-ledger-multi/instances/global-ledger/databases/payments-db",
            auth_mode="IAM Fine-Grained Access Control (roles/spanner.databaseReader)",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=36,
            active_rules=31,
            freshness_sla_minutes=1,
            current_lag_minutes=0.4,
            capabilities=[
                "Spanner Change Streams Lag & Retry Detection",
                "Interleaved Table Parent-Child Integrity",
                "Idempotency Key Collision Probe",
                "Query Plan & Lock Contention Analysis",
            ],
            sandbox_tables=["spanner_payment_events"],
        ),
        DataConnector(
            connector_id="conn-cloudsql",
            name="Cloud SQL (MySQL / PostgreSQL / SQL Server Shards)",
            product_family="Google Cloud Operational Databases (Managed Relational)",
            gcp_service="Cloud SQL",
            dialect="MySQL 8.0 / PostgreSQL / T-SQL",
            status="SLA_WARNING",
            host_or_uri="cloudsql://gcp-velocity-platform-global:asia-northeast1:fulfilment-mysql-apac",
            auth_mode="Cloud SQL Python Connector + IAM Auth",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=54,
            active_rules=22,
            freshness_sla_minutes=30,
            current_lag_minutes=18.5,
            capabilities=[
                "Multi-Shard Schema Consistency Check",
                "Timezone & Epoch Timestamp Format Validator",
                "Binlog / GTID Replication Verification",
            ],
            sandbox_tables=["cloudsql_shipments"],
        ),
        DataConnector(
            connector_id="conn-bigtable",
            name="Cloud Bigtable (Cold-Chain IoT Telemetry)",
            product_family="Google Cloud NoSQL Databases",
            gcp_service="Cloud Bigtable",
            dialect="Wide-Column / BigQuery Federated SQL",
            status="SCHEMA_DRIFT_DETECTED",
            host_or_uri="bigtable://projects/gcp-velocity-platform-global/instances/iot-telemetry-cluster",
            auth_mode="Service Account Read-Only (roles/bigtable.reader)",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=19,
            active_rules=15,
            freshness_sla_minutes=5,
            current_lag_minutes=0.8,
            capabilities=[
                "Column Family & Qualifier Drift Detection",
                "BigQuery External Federated Table Mapping",
                "Row-Key Prefix Hotspot & Heartbeat Gap Monitor",
            ],
            sandbox_tables=["bigtable_sensor_telemetry"],
        ),
        DataConnector(
            connector_id="conn-firestore",
            name="Firestore (SaaS Subscription Document Store)",
            product_family="Google Cloud NoSQL Databases",
            gcp_service="Firestore",
            dialect="Document JSON / BigQuery Firestore Export",
            status="SCHEMA_DRIFT_DETECTED",
            host_or_uri="firestore://gcp-velocity-platform-global/databases/(default)/collections/subscriptions",
            auth_mode="IAM Datastore Viewer (Zero-PII JSON Schema Sampling)",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=24,
            active_rules=18,
            freshness_sla_minutes=15,
            current_lag_minutes=4.0,
            capabilities=[
                "Nested JSON Document Path Drift Inference",
                "BigQuery Firestore Export Schema Sync",
                "Collection Group Type Mutation Detection",
            ],
            sandbox_tables=["firestore_subscriptions_raw"],
        ),
        DataConnector(
            connector_id="conn-datastream-dataflow",
            name="Datastream CDC & Dataflow Streaming Pipelines",
            product_family="Google Cloud Data Integration & Streaming",
            gcp_service="Datastream & Dataflow",
            dialect="Apache Beam / Serverless CDC",
            status="HEALTHY",
            host_or_uri="datastream://projects/gcp-omniretail-prod/locations/europe-west2/streams/alloydb-to-bq",
            auth_mode="Cloud Monitoring & Dataflow Viewer API",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=84,
            active_rules=40,
            freshness_sla_minutes=10,
            current_lag_minutes=2.1,
            capabilities=[
                "CDC Backfill & Unsupported DDL Alerting",
                "Dataflow Dead-Letter Queue Inspection",
                "Pub/Sub Watermark & Throughput Correlation",
            ],
            sandbox_tables=[],
        ),
        DataConnector(
            connector_id="conn-composer-dbt",
            name="Cloud Composer (Airflow) & dbt Core/Cloud",
            product_family="Google Cloud Orchestration & Transformation",
            gcp_service="Cloud Composer & dbt",
            dialect="dbt Jinja + GoogleSQL + Airflow DAGs",
            status="HEALTHY",
            host_or_uri="git://github.com/omniretail-data/analytics-dbt-bigquery.git",
            auth_mode="GitHub App Token + Composer Environment Read-Only API",
            access_level="SANDBOX_ISOLATED_EXECUTION",
            tables_monitored=112,
            active_rules=95,
            freshness_sla_minutes=60,
            current_lag_minutes=12.0,
            capabilities=[
                "dbt manifest.json & run_results.json Ingestion",
                "Automated Git Pull Request Generation",
                "DAG Task Failure to SQL Model Correlation",
            ],
            sandbox_tables=[],
        ),
        DataConnector(
            connector_id="conn-dataplex",
            name="Dataplex Universal Catalog & Data Lineage API",
            product_family="Google Cloud Governance & Metadata",
            gcp_service="Dataplex Universal Catalog",
            dialect="Dataplex Policy Tags & Lineage Graph",
            status="HEALTHY",
            host_or_uri="dataplex://projects/gcp-omniretail-prod/locations/eu/lakes/enterprise-data-mesh",
            auth_mode="IAM Dataplex Catalog & Lineage Viewer",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=310,
            active_rules=120,
            freshness_sla_minutes=15,
            current_lag_minutes=1.0,
            capabilities=[
                "Automated Data Quality Scan Alert Ingestion",
                "Column-Level PII Policy Tag Enforcement",
                "Cross-System Upstream/Downstream Lineage Traversal",
            ],
            sandbox_tables=[],
        ),
        DataConnector(
            connector_id="conn-looker",
            name="Looker & Vertex AI Downstream Impact Bridge",
            product_family="Google Cloud BI & AI Consumption",
            gcp_service="Looker & Vertex AI",
            dialect="LookML & Vertex Feature Views",
            status="HEALTHY",
            host_or_uri="looker://omniretail.cloud.looker.com/projects/executive_finance",
            auth_mode="Looker Read-Only Metadata SDK",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=68,
            active_rules=25,
            freshness_sla_minutes=30,
            current_lag_minutes=5.0,
            capabilities=[
                "Executive Dashboard Blast-Radius Mapping",
                "LookML Explore Metric Dependency Verification",
                "Automated Stakeholder Incident Banner Notification",
            ],
            sandbox_tables=[],
        ),
        DataConnector(
            connector_id="conn-snowflake-databricks",
            name="Snowflake & Databricks Unity Catalog Bridge",
            product_family="Multi-Cloud Lakehouse & Warehouse (GCP / AWS / Azure)",
            gcp_service="Snowflake & Databricks",
            dialect="Snowflake SQL / Spark SQL / Delta Lake",
            status="HEALTHY",
            host_or_uri="snowflake://omniretail.eu-west-2.gcp/FINANCE_DW + databricks://unity-catalog",
            auth_mode="Workload Identity Federation + RSA Key-Pair (Read-Only)",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=96,
            active_rules=52,
            freshness_sla_minutes=15,
            current_lag_minutes=2.4,
            capabilities=[
                "Cross-Cloud BigQuery <-> Snowflake / Databricks Reconciliation",
                "Unity Catalog & ACCOUNT_USAGE Lineage Sync",
                "Delta Lake & Snowflake Time-Travel Diffing",
            ],
            sandbox_tables=[],
        ),
        DataConnector(
            connector_id="conn-aws-azure-omni",
            name="AWS (Redshift/Aurora/S3) & Azure (Synapse/Fabric/ADLS) via BigQuery Omni",
            product_family="Multi-Cloud Cross-Platform Federation (AWS & Azure)",
            gcp_service="BigQuery Omni + AWS / Azure Connectors",
            dialect="GoogleSQL / PostgreSQL / T-SQL",
            status="HEALTHY",
            host_or_uri="bq-omni://aws-eu-west-1.s3-iceberg & azure-westeurope.adls-gen2",
            auth_mode="AWS AssumeRoleWithWebIdentity & Azure Entra ID Federation",
            access_level="READ_ONLY_PRODUCTION",
            tables_monitored=74,
            active_rules=38,
            freshness_sla_minutes=20,
            current_lag_minutes=3.5,
            capabilities=[
                "Zero-Egress Cross-Cloud Querying via BigQuery Omni",
                "AWS Aurora/RDS & Azure SQL Schema Drift Introspection",
                "Multi-Cloud Dialect Transpilation (T-SQL / Redshift <-> GoogleSQL)",
            ],
            sandbox_tables=[],
        ),
    ]


def build_initial_incidents() -> Dict[str, Incident]:
    inc1 = Incident(
        incident_id="INC-2026-001",
        tenant_id="tenant-retail-uk",
        title="Executive Retail Revenue Drop (-32.0% Overnight Anomaly)",
        subtitle="Expected daily net revenue £100,000 vs. Reported £68,000 in Looker Executive P&L Dashboard",
        severity=IncidentSeverity.CRITICAL,
        loop_stage=IncidentLoopStage.PROVE,
        detected_at="2026-10-12T06:15:00Z",
        alert_source="BigQuery Data Quality Scan + Dataplex Metric Monitor",
        source_database="AlloyDB for PostgreSQL (checkout-primary)",
        pipeline_layer="Datastream CDC -> dbt Cloud (fct_daily_revenue.sql)",
        target_warehouse="BigQuery (finance_mart.fct_daily_revenue)",
        bi_Consumer="Looker (Executive Retail P&L Board Dashboard)",
        metric_name="Daily Net Revenue (GBP)",
        expected_value="£100,000",
        reported_value="£68,000",
        variance_pct=-32.0,
        financial_exposure="£32,000 / day (£960,000 / month annualized metric distortion)",
        confidence_score=98.4,
        executive_summary=(
            "DataTrust AI traced the 32% overnight drop in reported daily retail revenue (£68,000 reported vs. "
            "£100,000 expected baseline) across Looker, BigQuery, dbt, Datastream, and AlloyDB for PostgreSQL. "
            "Gross order volume in AlloyDB (`alloydb_orders`) did NOT drop (£100,000 committed across 100 order batches). "
            "Instead, Checkout Service release v4.2 at 03:40 UTC migrated the AlloyDB `alloydb_payments` table to write "
            "settled transactions into `settlement_state = 'SETTLED_OK'` while leaving legacy `payment_status` as NULL "
            "for Express Checkout orders. Because the downstream BigQuery dbt model `fct_daily_revenue.sql` filters "
            "strictly on `WHERE p.payment_status = 'COMPLETED'`, 32 valid order batches (£32,000) were silently excluded."
        ),
        root_cause_technical=(
            "Upstream schema & semantic drift in AlloyDB `alloydb_payments` (`payment_status` -> `settlement_state` = 'SETTLED_OK' "
            "in schema_version `v4.2-drifted`) combined with an unguarded hard filter `WHERE p.payment_status = 'COMPLETED'` "
            "in `models/marts/finance/fct_daily_revenue.sql`."
        ),
        hypotheses=[
            HypothesisItem(
                hypothesis_id="H1",
                category="1. Genuine Business Revenue Decrease",
                title="Did customer order volume genuinely fall by 32% in AlloyDB?",
                verdict=HypothesisVerdict.RULED_OUT,
                confidence_pct=99.8,
                diagnostic_sql="SELECT COUNT(*) AS batches, SUM(net_revenue_gbp) AS alloydb_total_gbp FROM alloydb_orders WHERE order_date = '2026-10-12';",
                evidence_summary="Ruled out: AlloyDB `alloydb_orders` recorded 100 order batches totaling exactly £100,000.00 on 2026-10-12.",
                metric_observed="£100,000.00 in AlloyDB source (0% drop)",
            ),
            HypothesisItem(
                hypothesis_id="H2",
                category="2. Upstream Data Pipeline Failure",
                title="Did Datastream CDC or Cloud Composer fail to replicate rows into BigQuery?",
                verdict=HypothesisVerdict.RULED_OUT,
                confidence_pct=99.5,
                diagnostic_sql="SELECT COUNT(*) AS replicated_payments, SUM(captured_amount_gbp) AS total_captured FROM alloydb_payments;",
                evidence_summary="Ruled out: All 100 payment batches (£100,000.00) were replicated into BigQuery raw staging with 1.1m CDC lag.",
                metric_observed="100 / 100 payment records present in staging",
            ),
            HypothesisItem(
                hypothesis_id="H3",
                category="3. Source System Schema / Semantic Drift",
                title="Did an upstream AlloyDB schema change rename or alter the payment-status column?",
                verdict=HypothesisVerdict.PROVEN_ROOT_CAUSE,
                confidence_pct=98.4,
                diagnostic_sql=(
                    "SELECT schema_version, payment_status, settlement_state, COUNT(*) AS batches, "
                    "SUM(captured_amount_gbp) AS revenue_gbp FROM alloydb_payments GROUP BY 1, 2, 3;"
                ),
                evidence_summary=(
                    "PROVEN: 32 batches (£32,000.00) written by `v4.2-drifted` have `payment_status = NULL` and "
                    "`settlement_state = 'SETTLED_OK'`."
                ),
                metric_observed="32 batches (£32,000) have NULL payment_status & 'SETTLED_OK' settlement_state",
            ),
            HypothesisItem(
                hypothesis_id="H4",
                category="4. Incorrect Duplicate Record Removal",
                title="Did a deduplication macro over-aggressively purge valid transactions?",
                verdict=HypothesisVerdict.RULED_OUT,
                confidence_pct=97.0,
                diagnostic_sql="SELECT COUNT(DISTINCT order_id) AS unique_orders, COUNT(*) AS total_rows FROM alloydb_orders;",
                evidence_summary="Ruled out: 1:1 cardinality verified between `order_id` and `payment_id` (100 unique keys).",
                metric_observed="0 duplicate keys dropped",
            ),
            HypothesisItem(
                hypothesis_id="H5",
                category="5. Transformation Filter Excluded Valid Transactions",
                title="Did the BigQuery / dbt SQL transformation exclude valid settled orders?",
                verdict=HypothesisVerdict.CONTRIBUTING_FACTOR,
                confidence_pct=98.1,
                diagnostic_sql="SELECT SUM(reported_revenue_gbp) AS broken_mart_total FROM bq_fct_daily_revenue_broken;",
                evidence_summary=(
                    "CONFIRMED MECHANISM: `bq_fct_daily_revenue_broken` filters `WHERE p.payment_status = 'COMPLETED'`, "
                    "dropping all 32 `v4.2-drifted` batches and outputting £68,000.00 instead of £100,000.00."
                ),
                metric_observed="£68,000.00 output (-£32,000.00 excluded by WHERE clause)",
            ),
            HypothesisItem(
                hypothesis_id="H6",
                category="6. Dashboard Query or Metric Definition Change",
                title="Did someone modify the Looker LookML measure definition for Daily Net Revenue?",
                verdict=HypothesisVerdict.RULED_OUT,
                confidence_pct=99.2,
                diagnostic_sql="-- Looker Git commit history check: executive_finance.model.lkml unchanged for 19 days",
                evidence_summary="Ruled out: LookML view `executive_revenue.view.lkml` had zero commits in the last 19 days.",
                metric_observed="0 LookML changes",
            ),
        ],
        lineage_nodes=[
            LineageNode(
                node_id="node-alloydb-orders",
                label="alloydb_orders",
                gcp_product="AlloyDB for PostgreSQL",
                layer="OLTP_SOURCE",
                status="HEALTHY",
                schema_fields=["order_id (PK)", "order_date", "customer_id", "region", "net_revenue_gbp"],
                dataplex_policy_tags=["DATAPLEX:CUSTOMER_ID_PSEUDONYM"],
                freshness_lag="0.8 min",
                row_count=100,
                defect_note="100% healthy (£100,000 across 100 order batches)",
            ),
            LineageNode(
                node_id="node-alloydb-payments",
                label="alloydb_payments",
                gcp_product="AlloyDB for PostgreSQL",
                layer="OLTP_SOURCE",
                status="ROOT_CAUSE_DEFECT",
                schema_fields=[
                    "payment_id (PK)",
                    "order_id (FK)",
                    "payment_status (NULL on v4.2!)",
                    "settlement_state ('SETTLED_OK')",
                    "captured_amount_gbp",
                ],
                dataplex_policy_tags=["DATAPLEX:PCI_PAYMENT_METADATA"],
                freshness_lag="1.1 min",
                row_count=100,
                defect_note="Checkout v4.2 writes 'SETTLED_OK' to settlement_state; payment_status is NULL for 32% of rows",
            ),
            LineageNode(
                node_id="node-datastream-cdc",
                label="alloydb_to_bq_cdc_stream",
                gcp_product="Datastream",
                layer="INGESTION_CDC",
                status="HEALTHY",
                schema_fields=["_metadata_change_type", "_metadata_read_timestamp", "order_id", "payment_status", "settlement_state"],
                dataplex_policy_tags=[],
                freshness_lag="1.9 min",
                row_count=200,
                defect_note="Replicated new column `settlement_state` automatically to BigQuery staging",
            ),
            LineageNode(
                node_id="node-dbt-mart",
                label="fct_daily_revenue (dbt + BigQuery)",
                gcp_product="BigQuery",
                layer="WAREHOUSE_MART",
                status="ROOT_CAUSE_DEFECT",
                schema_fields=["order_date", "region", "order_batches", "reported_revenue_gbp"],
                dataplex_policy_tags=["DATAPLEX:FINANCE_SOX_TIER1"],
                freshness_lag="4.2 min",
                row_count=5,
                defect_note="Filter `WHERE p.payment_status = 'COMPLETED'` drops £32,000 of v4.2 settled orders",
            ),
            LineageNode(
                node_id="node-looker-exec",
                label="Executive Retail Revenue Dashboard",
                gcp_product="Looker",
                layer="BI_CONSUMPTION",
                status="IMPACTED_DOWNSTREAM",
                schema_fields=["measure: total_daily_revenue_gbp", "dimension: region", "kpi_alert: -32% drop"],
                dataplex_policy_tags=["DATAPLEX:BOARD_REPORTING"],
                freshness_lag="5.0 min",
                row_count=5,
                defect_note="Displays £68,000 instead of £100,000 (-32% anomaly)",
            ),
        ],
        lineage_edges=[
            LineageEdge(source="node-alloydb-orders", target="node-datastream-cdc", relationship="Datastream WAL CDC", is_broken_path=False),
            LineageEdge(source="node-alloydb-payments", target="node-datastream-cdc", relationship="Datastream WAL CDC (Schema Drift v4.2)", is_broken_path=True),
            LineageEdge(source="node-datastream-cdc", target="node-dbt-mart", relationship="INNER JOIN + WHERE payment_status = 'COMPLETED'", is_broken_path=True),
            LineageEdge(source="node-dbt-mart", target="node-looker-exec", relationship="LookML Explore Query", is_broken_path=True),
        ],
        repair_proposal=RepairProposal(
            proposal_id="PROP-INC-001",
            target_asset="finance_mart.fct_daily_revenue (dbt model: fct_daily_revenue.sql)",
            target_gcp_product="BigQuery + dbt Core/Cloud",
            sql_dialect="GoogleSQL (BigQuery)",
            file_path_in_repo="models/marts/finance/fct_daily_revenue.sql",
            explanation=(
                "Replace the brittle filter `WHERE p.payment_status = 'COMPLETED'` with a backward- and forward-compatible "
                "coalesce predicate `WHERE COALESCE(p.payment_status, p.settlement_state) IN ('COMPLETED', 'SETTLED_OK')`. "
                "This preserves all historical v4.1 records while accurately capturing all v4.2 AlloyDB settled payments."
            ),
            root_cause_commit_or_event="AlloyDB Migration PR #842 (`ALTER TABLE alloydb_payments ADD COLUMN settlement_state`) deployed at 03:40 UTC",
            original_sql=(
                "SELECT\n"
                "    o.order_date,\n"
                "    o.region,\n"
                "    COUNT(o.order_id) AS order_batches,\n"
                "    SUM(o.net_revenue_gbp) AS reported_revenue_gbp\n"
                "FROM alloydb_orders o\n"
                "INNER JOIN alloydb_payments p\n"
                "    ON o.order_id = p.order_id\n"
                "WHERE p.payment_status = 'COMPLETED'\n"
                "GROUP BY o.order_date, o.region\n"
                "ORDER BY reported_revenue_gbp DESC"
            ),
            proposed_sql=(
                "SELECT\n"
                "    o.order_date,\n"
                "    o.region,\n"
                "    COUNT(o.order_id) AS order_batches,\n"
                "    SUM(o.net_revenue_gbp) AS reported_revenue_gbp\n"
                "FROM alloydb_orders o\n"
                "INNER JOIN alloydb_payments p\n"
                "    ON o.order_id = p.order_id\n"
                "WHERE COALESCE(p.payment_status, p.settlement_state) IN ('COMPLETED', 'SETTLED_OK')\n"
                "GROUP BY o.order_date, o.region\n"
                "ORDER BY reported_revenue_gbp DESC"
            ),
            backfill_sql=(
                "-- Idempotent BigQuery Partition Backfill for 2026-10-12\n"
                "MERGE INTO `gcp-omniretail-prod-eu-west2.finance_mart.fct_daily_revenue` T\n"
                "USING `gcp-omniretail-prod-eu-west2.finance_mart.fct_daily_revenue_sandbox_verified` S\n"
                "ON T.order_date = S.order_date AND T.region = S.region\n"
                "WHEN MATCHED THEN UPDATE SET\n"
                "    T.order_batches = S.order_batches,\n"
                "    T.reported_revenue_gbp = S.reported_revenue_gbp;"
            ),
            rollback_sql=(
                "-- Instant Zero-Downtime Rollback via BigQuery Time Travel & View Restore\n"
                "CREATE OR REPLACE TABLE `gcp-omniretail-prod-eu-west2.finance_mart.fct_daily_revenue` AS\n"
                "SELECT * FROM `gcp-omniretail-prod-eu-west2.finance_mart.fct_daily_revenue`\n"
                "FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR);"
            ),
            sandbox_verify_before_query=(
                "SELECT region, order_batches, reported_revenue_gbp FROM bq_fct_daily_revenue_broken ORDER BY reported_revenue_gbp DESC"
            ),
            sandbox_verify_after_query=(
                "SELECT\n"
                "    o.region,\n"
                "    COUNT(o.order_id) AS order_batches,\n"
                "    SUM(o.net_revenue_gbp) AS reported_revenue_gbp\n"
                "FROM alloydb_orders o\n"
                "INNER JOIN alloydb_payments p ON o.order_id = p.order_id\n"
                "WHERE COALESCE(p.payment_status, p.settlement_state) IN ('COMPLETED', 'SETTLED_OK')\n"
                "GROUP BY o.region\n"
                "ORDER BY reported_revenue_gbp DESC"
            ),
            affected_downstream_assets=[
                "Looker: Executive Retail P&L Board Dashboard",
                "Looker: EMEA Regional Store Performance Explore",
                "BigQuery: finance_mart.fct_daily_revenue",
                "BigQuery: executive_reporting.vw_quarterly_board_kpi",
                "Vertex AI: retail_demand_forecasting_v3 feature table",
            ],
        ),
        git_pr=GitPullRequestArtifact(
            pr_number=1408,
            repository="omniretail-data/analytics-dbt-bigquery",
            branch_name="datatrust-ai/fix-inc-2026-001-alloydb-payment-status",
            base_branch="main",
            title="fix(finance_mart): handle AlloyDB v4.2 settlement_state schema drift in fct_daily_revenue",
            status="DRAFT_READY",
            author="DataTrust AI Autonomous Engineer (verified by 5-Gate Sandbox)",
            reviewer_role="Analytics Engineering Lead / Data Platform Owner",
            files_changed=[
                "models/marts/finance/fct_daily_revenue.sql",
                "models/marts/finance/schema.yml",
                "tests/reconciliation/assert_daily_revenue_matches_alloydb.sql",
            ],
            markdown_body=(
                "## Automated Incident Resolution — INC-2026-001\n"
                "- **Root Cause**: AlloyDB checkout service v4.2 writes `'SETTLED_OK'` to `settlement_state` while leaving `payment_status` NULL.\n"
                "- **Before Fix**: `£68,000.00` reported (`-32.0%` variance, 32 order batches excluded).\n"
                "- **After Fix (Sandbox Verified)**: `£100,000.00` (`100.0%` reconciliation with AlloyDB `alloydb_orders`).\n"
                "- **5-Gate Deterministic Verification**: PASSED (AST Safety, Dataplex PII Policy, Dry-Run Cost, Shadow Reconciliation, 5/5 Regression Tests)."
            ),
            created_at="2026-10-12T06:18:20Z",
        ),
    )

    # =========================================================================
    # INCIDENT 2: Cloud Spanner -> Change Streams -> Dataflow -> BigQuery
    # =========================================================================
    inc2 = Incident(
        incident_id="INC-2026-002",
        tenant_id="tenant-fintech-global",
        title="Duplicate Charge Cluster — Region West (+140% Anomaly / £4,850 at Risk)",
        subtitle="Spanner payment gateway timeout reduction (30s -> 10s) triggered non-idempotent retry ingestion into BigQuery",
        severity=IncidentSeverity.CRITICAL,
        loop_stage=IncidentLoopStage.PROVE,
        detected_at="2026-10-12T04:12:00Z",
        alert_source="Cloud Spanner Change Stream Monitor + Monte Carlo Webhook",
        source_database="Cloud Spanner (global-ledger.payments-db)",
        pipeline_layer="Spanner Change Streams -> Dataflow Beam -> BigQuery",
        target_warehouse="BigQuery (billing_mart.fct_regional_charges)",
        bi_Consumer="Looker (FinTech Risk & Settlement Console)",
        metric_name="Region West Billed Volume (GBP)",
        expected_value="£13,500",
        reported_value="£18,350",
        variance_pct=35.9,
        financial_exposure="£4,850 duplicate charges across 50 accounts in Region West",
        confidence_score=96.8,
        executive_summary=(
            "DataTrust AI correlated a +140% spike in duplicate billing events in Region West with three factors: "
            "(1) Payment gateway timeout in Region West was reduced from 30,000ms to 10,000ms at 02:00 UTC, causing premature retries; "
            "(2) Batch processor v2.3 ingested Cloud Spanner Change Stream records without deduplicating on `idempotency_key`; "
            "(3) 50 retry events (`retry_attempt = 2`) inflated reported billing by £4,850."
        ),
        root_cause_technical=(
            "Missing `idempotency_key` deduplication in BigQuery billing rollup over Cloud Spanner Change Stream table `spanner_payment_events`."
        ),
        hypotheses=[
            HypothesisItem(
                hypothesis_id="H2-1",
                category="1. Gateway Timeout & Retry Loop",
                title="Did a payment gateway timeout change trigger retry records in Cloud Spanner?",
                verdict=HypothesisVerdict.PROVEN_ROOT_CAUSE,
                confidence_pct=97.5,
                diagnostic_sql=(
                    "SELECT region, retry_attempt, gateway_timeout_ms, COUNT(*) AS events, SUM(charge_amount_gbp) AS total_gbp "
                    "FROM spanner_payment_events GROUP BY 1, 2, 3;"
                ),
                evidence_summary="PROVEN: Region West has 50 retry_attempt=2 events at 10,000ms timeout totaling £4,850.00.",
                metric_observed="50 duplicate retry rows (£4,850.00) in Region West",
            ),
            HypothesisItem(
                hypothesis_id="H2-2",
                category="2. Missing Idempotency Deduplication in Warehouse View",
                title="Does the BigQuery transformation deduplicate by `idempotency_key`?",
                verdict=HypothesisVerdict.CONTRIBUTING_FACTOR,
                confidence_pct=99.0,
                diagnostic_sql="SELECT COUNT(*) AS raw_rows, COUNT(DISTINCT idempotency_key) AS unique_charges FROM spanner_payment_events;",
                evidence_summary="CONFIRMED: Raw table has 185 rows for only 135 unique `idempotency_key` values.",
                metric_observed="50 un-deduplicated retry rows included in billing total",
            ),
        ],
        lineage_nodes=[
            LineageNode(
                node_id="node-spanner-ledger",
                label="spanner_payment_events",
                gcp_product="Cloud Spanner",
                layer="OLTP_SOURCE",
                status="ROOT_CAUSE_DEFECT",
                schema_fields=["event_id (PK)", "idempotency_key", "account_id", "region", "charge_amount_gbp", "retry_attempt"],
                dataplex_policy_tags=["DATAPLEX:PCI_DSS_SCOPE"],
                freshness_lag="0.4 min",
                row_count=185,
                defect_note="Contains 50 retry_attempt=2 duplicate events in Region West (£4,850)",
            ),
            LineageNode(
                node_id="node-dataflow-stream",
                label="spanner_changestream_to_bq",
                gcp_product="Dataflow",
                layer="INGESTION_CDC",
                status="HEALTHY",
                schema_fields=["event_id", "idempotency_key", "charge_amount_gbp", "committed_at"],
                dataplex_policy_tags=[],
                freshness_lag="1.2 min",
                row_count=185,
                defect_note="At-least-once streaming delivery active",
            ),
            LineageNode(
                node_id="node-bq-billing",
                label="fct_regional_charges",
                gcp_product="BigQuery",
                layer="WAREHOUSE_MART",
                status="IMPACTED_DOWNSTREAM",
                schema_fields=["region", "charge_count", "total_billed_gbp"],
                dataplex_policy_tags=["DATAPLEX:FINANCE_LEDGER"],
                freshness_lag="2.0 min",
                row_count=3,
                defect_note="Over-reports Region West by +£4,850 due to missing idempotency deduplication",
            ),
        ],
        lineage_edges=[
            LineageEdge(source="node-spanner-ledger", target="node-dataflow-stream", relationship="Spanner Change Stream", is_broken_path=True),
            LineageEdge(source="node-dataflow-stream", target="node-bq-billing", relationship="Append-Only Streaming Ingestion", is_broken_path=True),
        ],
        repair_proposal=RepairProposal(
            proposal_id="PROP-INC-002",
            target_asset="billing_mart.fct_regional_charges",
            target_gcp_product="Cloud Spanner + BigQuery",
            sql_dialect="GoogleSQL (BigQuery / Cloud Spanner)",
            file_path_in_repo="models/marts/billing/fct_regional_charges.sql",
            explanation=(
                "Enforce deterministic idempotency deduplication per `idempotency_key` (retaining only the initial committed "
                "transaction `retry_attempt = 1` / earliest `committed_at`) before aggregating regional billing totals."
            ),
            root_cause_commit_or_event="Gateway config change `timeout_ms: 30000 -> 10000` in Region West + Batch Processor v2.3",
            original_sql=(
                "SELECT\n"
                "    region,\n"
                "    COUNT(*) AS charge_count,\n"
                "    SUM(charge_amount_gbp) AS reported_revenue_gbp\n"
                "FROM spanner_payment_events\n"
                "GROUP BY region\n"
                "ORDER BY region"
            ),
            proposed_sql=(
                "WITH deduplicated_events AS (\n"
                "    SELECT\n"
                "        idempotency_key,\n"
                "        region,\n"
                "         MIN(charge_amount_gbp) AS charge_amount_gbp\n"
                "    FROM spanner_payment_events\n"
                "    WHERE retry_attempt = 1\n"
                "    GROUP BY idempotency_key, region\n"
                ")\n"
                "SELECT\n"
                "    region,\n"
                "    COUNT(*) AS charge_count,\n"
                "    SUM(charge_amount_gbp) AS reported_revenue_gbp\n"
                "FROM deduplicated_events\n"
                "GROUP BY region\n"
                "ORDER BY region"
            ),
            backfill_sql=(
                "-- Purge duplicate retry charges from BigQuery billing mart and trigger Spanner settlement reconciliation\n"
                "DELETE FROM `gcp-apexpay-ledger-multi.billing_mart.fct_regional_charges_raw`\n"
                "WHERE retry_attempt > 1;"
            ),
            rollback_sql=(
                "CREATE OR REPLACE VIEW `gcp-apexpay-ledger-multi.billing_mart.fct_regional_charges` AS\n"
                "SELECT region, COUNT(*) AS charge_count, SUM(charge_amount_gbp) AS reported_revenue_gbp\n"
                "FROM `gcp-apexpay-ledger-multi.billing_mart.spanner_payment_events` GROUP BY region;"
            ),
            sandbox_verify_before_query=(
                "SELECT region, COUNT(*) AS order_batches, SUM(charge_amount_gbp) AS reported_revenue_gbp FROM spanner_payment_events GROUP BY region ORDER BY region"
            ),
            sandbox_verify_after_query=(
                "SELECT region, COUNT(DISTINCT idempotency_key) AS order_batches, SUM(charge_amount_gbp) AS reported_revenue_gbp "
                "FROM spanner_payment_events WHERE retry_attempt = 1 GROUP BY region ORDER BY region"
            ),
            affected_downstream_assets=[
                "Looker: FinTech Risk & Settlement Console",
                "BigQuery: billing_mart.fct_regional_charges",
                "Cloud Spanner: settlement_reconciliation_job",
            ],
        ),
    )

    # =========================================================================
    # INCIDENT 3: Cloud SQL (MySQL) -> Cloud Composer -> BigQuery SLA Null Spike
    # =========================================================================
    inc3 = Incident(
        incident_id="INC-2026-003",
        tenant_id="tenant-logistics-saas",
        title="Global Fulfilment Dispatch Timestamp Null Spike (28.0% NULLs)",
        subtitle="APAC Cloud SQL MySQL shard migrated dispatch timestamps from ISO-8601 to Epoch Milliseconds",
        severity=IncidentSeverity.HIGH,
        loop_stage=IncidentLoopStage.REPAIR,
        detected_at="2026-10-12T07:45:00Z",
        alert_source="Dataplex Auto Data Quality Scan (NOT_NULL breach on dispatched_ts)",
        source_database="Cloud SQL for MySQL (fulfilment-mysql-apac)",
        pipeline_layer="Cloud Composer (Airflow DAG: sync_regional_shipments)",
        target_warehouse="BigQuery (logistics_mart.fct_shipment_sla)",
        bi_Consumer="Looker (Global Supply Chain On-Time SLA Report)",
        metric_name="Valid Parsed Shipment Timestamps (%)",
        expected_value="100.0% (100 shipments)",
        reported_value="72.0% (72 shipments)",
        variance_pct=-28.0,
        financial_exposure="28 APAC enterprise freight SLA penalties miscalculated",
        confidence_score=97.2,
        executive_summary=(
            "Cloud SQL MySQL APAC shard upgraded to schema `EPOCH_MS_V2`, emitting `raw_dispatched_ts` as 13-digit epoch "
            "milliseconds (`1791793800000`) while EMEA and AMER Cloud SQL shards continue emitting ISO-8601 strings. "
            "The BigQuery staging view only parsed ISO-8601 strings, resulting in 28.0% NULL timestamps across global shipments."
        ),
        root_cause_technical=(
            "Single-format timestamp parser in `stg_cloudsql_shipments.sql` fails on numeric epoch millisecond strings from `APAC-CloudSQL`."
        ),
        hypotheses=[
            HypothesisItem(
                hypothesis_id="H3-1",
                category="3. Source System Schema / Format Drift",
                title="Did the APAC Cloud SQL MySQL shard change timestamp serialization format?",
                verdict=HypothesisVerdict.PROVEN_ROOT_CAUSE,
                confidence_pct=99.1,
                diagnostic_sql=(
                    "SELECT shard_region, ts_format_version, COUNT(*) AS total_rows, "
                    "SUM(CASE WHEN parsed_iso_only_ts IS NULL THEN 1 ELSE 0 END) AS null_rows "
                    "FROM cloudsql_shipments GROUP BY 1, 2;"
                ),
                evidence_summary="PROVEN: All 28 rows from `APAC-CloudSQL` use `EPOCH_MS_V2` and evaluate to NULL under ISO-only parsing.",
                metric_observed="28 / 28 APAC rows NULL (100% shard failure, 28% global failure)",
            )
        ],
        lineage_nodes=[
            LineageNode(
                node_id="node-cloudsql-apac",
                label="cloudsql_shipments (MySQL Shards)",
                gcp_product="Cloud SQL",
                layer="OLTP_SOURCE",
                status="ROOT_CAUSE_DEFECT",
                schema_fields=["shipment_id", "shard_region", "raw_dispatched_ts", "ts_format_version"],
                dataplex_policy_tags=[],
                freshness_lag="6.0 min",
                row_count=100,
                defect_note="APAC shard emits 13-digit epoch ms instead of ISO-8601",
            ),
            LineageNode(
                node_id="node-composer-dag",
                label="composer_sync_regional_shipments",
                gcp_product="Cloud Composer",
                layer="INGESTION_CDC",
                status="HEALTHY",
                schema_fields=["shipment_id", "shard_region", "raw_dispatched_ts"],
                dataplex_policy_tags=[],
                freshness_lag="12.0 min",
                row_count=100,
                defect_note="Airflow federation task succeeded",
            ),
            LineageNode(
                node_id="node-bq-sla",
                label="fct_shipment_sla",
                gcp_product="BigQuery",
                layer="WAREHOUSE_MART",
                status="IMPACTED_DOWNSTREAM",
                schema_fields=["shard_region", "valid_shipments", "null_timestamp_count"],
                dataplex_policy_tags=["DATAPLEX:SLA_GOVERNANCE"],
                freshness_lag="14.0 min",
                row_count=3,
                defect_note="28% NULL spike on APAC shipments",
            ),
        ],
        lineage_edges=[
            LineageEdge(source="node-cloudsql-apac", target="node-composer-dag", relationship="Cloud Composer JDBC Extract", is_broken_path=True),
            LineageEdge(source="node-composer-dag", target="node-bq-sla", relationship="ISO-Only Timestamp Parse", is_broken_path=True),
        ],
        repair_proposal=RepairProposal(
            proposal_id="PROP-INC-003",
            target_asset="logistics_mart.fct_shipment_sla",
            target_gcp_product="Cloud SQL (MySQL) + BigQuery",
            sql_dialect="GoogleSQL (BigQuery)",
            file_path_in_repo="models/staging/cloudsql/stg_cloudsql_shipments.sql",
            explanation=(
                "Use a polymorphic timestamp normalization expression that detects 13-digit epoch millisecond strings "
                "and converts them alongside standard ISO-8601 timestamps, eliminating all NULLs across APAC, EMEA, and AMER."
            ),
            root_cause_commit_or_event="APAC Cloud SQL MySQL v8.0 connector serialization change",
            original_sql=(
                "SELECT\n"
                "    shard_region,\n"
                "    COUNT(parsed_iso_only_ts) AS order_batches,\n"
                "    COUNT(parsed_iso_only_ts) * 1.0 AS reported_revenue_gbp\n"
                "FROM cloudsql_shipments\n"
                "GROUP BY shard_region\n"
                "ORDER BY shard_region"
            ),
            proposed_sql=(
                "SELECT\n"
                "    shard_region,\n"
                "    COUNT(COALESCE(parsed_iso_only_ts, raw_dispatched_ts)) AS order_batches,\n"
                "    COUNT(COALESCE(parsed_iso_only_ts, raw_dispatched_ts)) * 1.0 AS reported_revenue_gbp\n"
                "FROM cloudsql_shipments\n"
                "GROUP BY shard_region\n"
                "ORDER BY shard_region"
            ),
            backfill_sql="-- Re-materialize BigQuery staging view stg_cloudsql_shipments",
            rollback_sql="-- Revert view definition to previous Composer DAG version",
            sandbox_verify_before_query=(
                "SELECT shard_region AS region, COUNT(parsed_iso_only_ts) AS order_batches, COUNT(parsed_iso_only_ts) * 1.0 AS reported_revenue_gbp "
                "FROM cloudsql_shipments GROUP BY shard_region ORDER BY shard_region"
            ),
            sandbox_verify_after_query=(
                "SELECT shard_region AS region, COUNT(COALESCE(parsed_iso_only_ts, raw_dispatched_ts)) AS order_batches, "
                "COUNT(COALESCE(parsed_iso_only_ts, raw_dispatched_ts)) * 1.0 AS reported_revenue_gbp "
                "FROM cloudsql_shipments GROUP BY shard_region ORDER BY shard_region"
            ),
            affected_downstream_assets=[
                "Looker: Global Supply Chain On-Time SLA Report",
                "BigQuery: logistics_mart.fct_shipment_sla",
            ],
        ),
    )

    # =========================================================================
    # INCIDENT 4: Cloud Bigtable -> BigQuery Federated Cold-Chain Telemetry Gap
    # =========================================================================
    inc4 = Incident(
        incident_id="INC-2026-004",
        tenant_id="tenant-logistics-saas",
        title="Sensor Heartbeat Gap — Warehouse B3 Cold-Chain Telemetry (-33.3% Coverage)",
        subtitle="OTA Firmware v3.1 writes Bigtable column qualifier `telemetry:temp_c_v2` instead of `telemetry:temp_c`",
        severity=IncidentSeverity.MEDIUM,
        loop_stage=IncidentLoopStage.REPAIR,
        detected_at="2026-10-12T08:05:00Z",
        alert_source="Cloud Monitoring + BigQuery Federated External Table Check",
        source_database="Cloud Bigtable (iot-telemetry-cluster)",
        pipeline_layer="BigQuery Federated External Table over Cloud Bigtable",
        target_warehouse="BigQuery (iot_mart.vw_coldchain_telemetry)",
        bi_Consumer="Vertex AI Feature Store & Cold-Chain Compliance Monitor",
        metric_name="Active Cold-Chain Sensor Readings",
        expected_value="90 readings (3 Warehouses)",
        reported_value="60 readings (Warehouse B3 = 0)",
        variance_pct=-33.3,
        financial_exposure="Cold-chain pharmaceutical compliance audit alert in Warehouse B3",
        confidence_score=99.1,
        executive_summary=(
            "Warehouse B3 IoT gateway updated to firmware `fw-v3.1-ota`, writing temperature values into Cloud Bigtable "
            "column qualifier `cf_telemetry_temp_c_v2` while the BigQuery federated view only projected `cf_telemetry_temp_c`."
        ),
        root_cause_technical=(
            "Column qualifier drift in Cloud Bigtable column family `telemetry` (`temp_c` -> `temp_c_v2`) for `Warehouse-B3`."
        ),
        hypotheses=[
            HypothesisItem(
                hypothesis_id="H4-1",
                category="3. Source System Schema / Column Qualifier Drift",
                title="Did Warehouse B3 sensors stop transmitting or switch Bigtable column qualifiers?",
                verdict=HypothesisVerdict.PROVEN_ROOT_CAUSE,
                confidence_pct=99.4,
                diagnostic_sql=(
                    "SELECT warehouse_id, firmware_version, COUNT(cf_telemetry_temp_c) AS v1_readings, "
                    "COUNT(cf_telemetry_temp_c_v2) AS v2_readings FROM bigtable_sensor_telemetry GROUP BY 1, 2;"
                ),
                evidence_summary="PROVEN: Warehouse-B3 has 30 valid readings in `cf_telemetry_temp_c_v2` under `fw-v3.1-ota`.",
                metric_observed="30 / 30 readings present in qualifier `temp_c_v2`",
            )
        ],
        lineage_nodes=[
            LineageNode(
                node_id="node-bigtable-raw",
                label="bigtable_sensor_telemetry",
                gcp_product="Cloud Bigtable",
                layer="OLTP_SOURCE",
                status="ROOT_CAUSE_DEFECT",
                schema_fields=["row_key", "warehouse_id", "cf_telemetry_temp_c", "cf_telemetry_temp_c_v2"],
                dataplex_policy_tags=[],
                freshness_lag="0.2 min",
                row_count=90,
                defect_note="fw-v3.1-ota writes to cf_telemetry_temp_c_v2",
            ),
            LineageNode(
                node_id="node-bq-federated",
                label="vw_coldchain_telemetry (Federated)",
                gcp_product="BigQuery",
                layer="WAREHOUSE_MART",
                status="IMPACTED_DOWNSTREAM",
                schema_fields=["warehouse_id", "active_readings", "avg_temp_c"],
                dataplex_policy_tags=[],
                freshness_lag="0.5 min",
                row_count=3,
                defect_note="Warehouse-B3 reports 0 active readings without COALESCE",
            ),
        ],
        lineage_edges=[
            LineageEdge(source="node-bigtable-raw", target="node-bq-federated", relationship="BigQuery External Table Projection", is_broken_path=True),
        ],
        repair_proposal=RepairProposal(
            proposal_id="PROP-INC-004",
            target_asset="iot_mart.vw_coldchain_telemetry",
            target_gcp_product="Cloud Bigtable + BigQuery Federated SQL",
            sql_dialect="GoogleSQL (BigQuery External Table)",
            file_path_in_repo="models/iot/vw_coldchain_telemetry.sql",
            explanation="Project `COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)` in the federated BigQuery view over Cloud Bigtable.",
            root_cause_commit_or_event="OTA Firmware rollout fw-v3.1-ota in Warehouse-B3",
            original_sql=(
                "SELECT\n"
                "    warehouse_id AS region,\n"
                "    COUNT(cf_telemetry_temp_c) AS order_batches,\n"
                "    COUNT(cf_telemetry_temp_c) * 1.0 AS reported_revenue_gbp\n"
                "FROM bigtable_sensor_telemetry\n"
                "GROUP BY warehouse_id\n"
                "ORDER BY warehouse_id"
            ),
            proposed_sql=(
                "SELECT\n"
                "    warehouse_id AS region,\n"
                "    COUNT(COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)) AS order_batches,\n"
                "    COUNT(COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)) * 1.0 AS reported_revenue_gbp\n"
                "FROM bigtable_sensor_telemetry\n"
                "GROUP BY warehouse_id\n"
                "ORDER BY warehouse_id"
            ),
            backfill_sql="-- Federated view reads live from Cloud Bigtable; zero backfill required once view is updated.",
            rollback_sql="-- Revert BigQuery federated view DDL",
            sandbox_verify_before_query=(
                "SELECT warehouse_id AS region, COUNT(cf_telemetry_temp_c) AS order_batches, "
                "COUNT(cf_telemetry_temp_c) * 1.0 AS reported_revenue_gbp FROM bigtable_sensor_telemetry GROUP BY warehouse_id ORDER BY warehouse_id"
            ),
            sandbox_verify_after_query=(
                "SELECT warehouse_id AS region, COUNT(COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)) AS order_batches, "
                "COUNT(COALESCE(cf_telemetry_temp_c_v2, cf_telemetry_temp_c)) * 1.0 AS reported_revenue_gbp FROM bigtable_sensor_telemetry GROUP BY warehouse_id ORDER BY warehouse_id"
            ),
            affected_downstream_assets=[
                "Vertex AI Feature Store: coldchain_anomaly_detector",
                "Looker: Warehouse Cold-Chain Compliance Dashboard",
            ],
        ),
    )

    return {
        inc1.incident_id: inc1,
        inc2.incident_id: inc2,
        inc3.incident_id: inc3,
        inc4.incident_id: inc4,
    }


def build_initial_audit_logs() -> List[AuditLogEntry]:
    return [
        AuditLogEntry(
            audit_id="AUD-2026-9001",
            timestamp="2026-10-12T06:15:04Z",
            tenant_id="tenant-retail-uk",
            incident_id="INC-2026-001",
            actor="DataTrust AI Sentinel",
            role="Autonomous Monitor (roles/dataplex.viewer)",
            action="ANOMALY_DETECTED",
            gcp_resources_touched=[
                "bigquery://gcp-omniretail-prod-eu-west2/finance_mart/fct_daily_revenue",
                "dataplex://gcp-omniretail-prod-eu-west2/lakes/enterprise-data-mesh",
            ],
            access_mode="METADATA_AND_AGGREGATE_ONLY",
            verification_hash="sha256:9f84c2a17b01e84d",
            details="Detected -32.0% daily net revenue anomaly (£68,000 reported vs £100,000 expected baseline).",
        ),
        AuditLogEntry(
            audit_id="AUD-2026-9002",
            timestamp="2026-10-12T06:16:12Z",
            tenant_id="tenant-retail-uk",
            incident_id="INC-2026-001",
            actor="Vertex AI Gemini 3.1 Pro Orchestrator",
            role="Root-Cause Investigator (Read-Only Service Account)",
            action="CROSS_DB_LINEAGE_AND_HYPOTHESIS_PROBE",
            gcp_resources_touched=[
                "alloydb://checkout-primary/alloydb_orders",
                "alloydb://checkout-primary/alloydb_payments",
                "bigquery://finance_mart/fct_daily_revenue",
            ],
            access_mode="READ_ONLY_ZERO_PII_EXFILTRATION",
            verification_hash="sha256:3c91e7024d88b12a",
            details="Evaluated 6 hypotheses; isolated AlloyDB v4.2 schema drift (`payment_status` -> `settlement_state` = 'SETTLED_OK') with 98.4% confidence.",
        ),
        AuditLogEntry(
            audit_id="AUD-2026-9003",
            timestamp="2026-10-12T06:17:45Z",
            tenant_id="tenant-retail-uk",
            incident_id="INC-2026-001",
            actor="Deterministic Verification Sandbox",
            role="5-Gate Validator Engine",
            action="SANDBOX_5_GATE_VERIFICATION_PASSED",
            gcp_resources_touched=[
                "bigquery://finance_mart/fct_daily_revenue_sandbox_clone",
            ],
            access_mode="ISOLATED_SANDBOX_EXECUTION",
            verification_hash="sha256:7d42b19a0e55f319",
            details="Executed before/after SQL on isolated dataset; proved £32,000 recovery (£68,000 -> £100,000, 100.0% match with AlloyDB ledger).",
        ),
    ]
