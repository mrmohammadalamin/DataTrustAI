import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Database,
  GitBranch,
  Layers,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../api';
import { DataConnector, Incident, OverviewPayload } from '../types';

interface Props {
  overview: OverviewPayload;
  selectedIncident: Incident;
  onSelectIncident: (inc: Incident, jumpToTab?: 'investigate' | 'repair' | 'governance') => void;
  onSimulateWebhook: (source: string, db: string, title?: string) => Promise<void>;
  onAddConnector: (payload: {
    name: string;
    gcp_service: string;
    dialect: string;
    host_or_uri: string;
    auth_mode: string;
    freshness_sla_minutes: number;
  }) => Promise<void>;
  busy: boolean;
}

export const OverviewAndConnectorsTab: React.FC<Props> = ({
  overview,
  selectedIncident,
  onSelectIncident,
  onSimulateWebhook,
  onAddConnector,
  busy,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [cloudProvider, setCloudProvider] = useState('Google Cloud');
  const [connName, setConnName] = useState('AlloyDB EMEA Analytics Replica');
  const [gcpService, setGcpService] = useState('AlloyDB for PostgreSQL');
  const [dialect, setDialect] = useState('PostgreSQL 15');
  const [hostUri, setHostUri] = useState('alloydb://projects/gcp-enterprise/locations/europe-west1/clusters/emea-prod');
  const [slaMins, setSlaMins] = useState(10);
  const [testingConn, setTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    connection_mode: string;
    latency_ms: number;
    driver_used: string;
    discovered_schemas: string[];
    diagnostic_checks: string[];
    production_setup_hint: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setTestingConn(true);
    try {
      const res = await api.testConnection({
        gcp_service: gcpService,
        cloud_provider: cloudProvider,
        dialect,
        host_or_uri: hostUri,
        auth_mode: 'Workload Identity Federation (Read-Only Service Account)',
      });
      setTestResult(res);
    } finally {
      setTestingConn(false);
    }
  };

  const handleCreateConnector = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddConnector({
      name: connName,
      gcp_service: `${cloudProvider}: ${gcpService}`,
      dialect,
      host_or_uri: hostUri,
      auth_mode: 'Workload Identity Federation (Read-Only Service Account)',
      freshness_sla_minutes: slaMins,
    });
    setTestResult(null);
    setShowAddModal(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'HEALTHY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Healthy
        </span>
      );
    }
    if (status === 'SCHEMA_DRIFT_DETECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          Schema Drift
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#111c38] via-[#132347] to-[#0f172a] border border-blue-500/30 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Google Cloud Multi-Database Autonomous Reliability & Incident Resolution Layer
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {overview.tagline}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              DataTrust AI continuously monitors <strong className="text-white">BigQuery, AlloyDB, Cloud Spanner, Cloud SQL, Bigtable, Firestore, Datastream, Dataflow, Cloud Composer, Dataplex, and dbt</strong>—tracing anomalies to their root cause and proving SQL repairs in a 5-Gate deterministic sandbox before human approval.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                onSimulateWebhook(
                  'Dataplex Universal Catalog Quality Scan',
                  'Firestore Document DB -> BigQuery Export'
                )
              }
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Simulate Live Alert Webhook (Firestore &rarr; BigQuery)
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a73e8] hover:bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Connect Google Cloud Database
            </button>
          </div>
        </div>

        {/* 6-Stage Closed Loop Pipeline Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-700/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            The DataTrust AI 6-Stage Traceable Closed Loop (AI Proposes &amp; Explains &bull; Deterministic Code Validates)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {overview.closed_loop_stages.map((st) => (
              <div
                key={st.step}
                className="bg-slate-900/80 border border-slate-700/70 rounded-lg p-3 hover:border-blue-500/50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10">
                    {st.step}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm font-semibold text-white">{st.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{st.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards (Inspired by Anomaly Detection & GCP Console) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border-t-2 border-t-rose-500 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Active Data Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400 mt-2">
            {overview.metrics.total_incidents}{' '}
            <span className="text-sm font-normal text-slate-400">
              ({overview.metrics.critical_incidents} Critical)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Across {overview.metrics.connectors_total} Google Cloud databases &amp; pipelines
          </div>
        </div>

        <div className="bg-[#111827] border-t-2 border-t-blue-500 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Revenue &amp; KPI Value Protected</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mt-2">
            {overview.metrics.revenue_protected_display}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Flagship £32k retail drop + £4,850 Spanner duplicate exposure
          </div>
        </div>

        <div className="bg-[#111827] border-t-2 border-t-emerald-500 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>5-Gate Sandbox Proof Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">
            100.0%{' '}
            <span className="text-sm font-normal text-slate-400">
              ({overview.metrics.sandbox_verified_count}/{overview.metrics.total_incidents} Verified)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Avg Root-Cause Confidence: {overview.metrics.avg_detection_confidence_pct}%
          </div>
        </div>

        <div className="bg-[#111827] border-t-2 border-t-amber-500 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Engineering MTTR Reduction</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">
            {overview.metrics.avg_mttr_minutes} min{' '}
            <span className="text-sm font-normal text-emerald-400">
              (-{overview.metrics.mttr_reduction_pct}%)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Down from {overview.metrics.baseline_manual_mttr_minutes} min (4 hours) manual triage
          </div>
        </div>
      </div>

      {/* Active Multi-Database Incident Queue */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Active Cross-Database Incident Queue (Click Any Incident to Investigate &amp; Verify Fix)
            </h2>
            <p className="text-xs text-slate-400">
              Includes the Flagship Retail Revenue Drop (-32%: £100,000 expected vs. £68,000 reported) plus Spanner, Cloud SQL, Bigtable &amp; Firestore scenarios.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Selected: <strong className="text-blue-400">{selectedIncident.incident_id}</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {overview.incidents.map((inc) => {
            const isSelected = inc.incident_id === selectedIncident.incident_id;
            return (
              <div
                key={inc.incident_id}
                onClick={() => onSelectIncident(inc)}
                className={`p-5 cursor-pointer transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-blue-950/35 border-l-4 border-l-blue-500'
                    : 'hover:bg-slate-900/70'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                      {inc.incident_id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                      Stage: {inc.loop_stage.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      Source: <strong className="text-slate-200">{inc.source_database}</strong> &rarr;{' '}
                      <strong className="text-slate-200">{inc.target_warehouse}</strong>
                    </span>
                  </div>

                  <div className="text-base font-bold text-white">{inc.title}</div>
                  <div className="text-xs text-slate-400">{inc.subtitle}</div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2 text-right min-w-[130px]">
                    <div className="text-[10px] uppercase text-slate-400">Expected vs Reported</div>
                    <div className="text-xs font-mono font-semibold text-emerald-400">
                      Exp: {inc.expected_value}
                    </div>
                    <div className="text-xs font-mono font-semibold text-rose-400">
                      Rep: {inc.reported_value} ({inc.variance_pct > 0 ? `+${inc.variance_pct}` : inc.variance_pct}%)
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc, 'investigate');
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      Investigate Root Cause
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc, 'repair');
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                    >
                      Prove SQL Fix (5-Gate)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Universal Google Cloud Database & Platform Connector Matrix */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Universal Google Cloud Database &amp; Data Platform Connector Hub ({overview.connectors.length} Connected Engines)
            </h2>
            <p className="text-xs text-slate-400">
              Zero-Trust Metadata &amp; Aggregate Probes active across OLTP operational databases, NoSQL stores, CDC pipelines, analytical warehouses, and BI tools.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            Read-Only Production Guardrail Active &bull; Zero Raw PII Exfiltration
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {overview.connectors.map((conn: DataConnector) => (
            <div
              key={conn.connector_id}
              className="bg-slate-900/75 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                      {conn.product_family}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{conn.name}</h3>
                  </div>
                  {getStatusBadge(conn.status)}
                </div>

                <div className="mt-2 text-[11px] font-mono text-slate-400 truncate" title={conn.host_or_uri}>
                  {conn.host_or_uri}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-950/60 rounded p-1.5">
                    <div className="text-[10px] text-slate-400">Dialect</div>
                    <div className="text-xs font-semibold text-slate-200 truncate">{conn.dialect.split('/')[0]}</div>
                  </div>
                  <div className="bg-slate-950/60 rounded p-1.5">
                    <div className="text-[10px] text-slate-400">Assets / Rules</div>
                    <div className="text-xs font-semibold text-slate-200">
                      {conn.tables_monitored} / {conn.active_rules}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 rounded p-1.5">
                    <div className="text-[10px] text-slate-400">Freshness Lag</div>
                    <div className="text-xs font-semibold text-emerald-400">
                      {conn.current_lag_minutes}m (SLA {conn.freshness_sla_minutes}m)
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {conn.capabilities.slice(0, 3).map((cap, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/70"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{conn.auth_mode.split('+')[0]}</span>
                {conn.sandbox_tables.length > 0 && (
                  <span className="text-blue-400 font-mono font-semibold shrink-0">
                    {conn.sandbox_tables.length} Sandbox Table(s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to Connect Additional Google Cloud / Multi-Cloud / Partner Database */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                Connect Google Cloud Database, Data Platform, or Multi-Cloud Engine
              </h3>
              <button
                onClick={() => {
                  setTestResult(null);
                  setShowAddModal(false);
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateConnector} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cloud Provider / Ecosystem
                  </label>
                  <select
                    value={cloudProvider}
                    onChange={(e) => {
                      const cp = e.target.value;
                      setCloudProvider(cp);
                      setTestResult(null);
                      if (cp === 'Google Cloud') {
                        setGcpService('AlloyDB for PostgreSQL');
                        setDialect('PostgreSQL 15');
                        setHostUri('alloydb://projects/gcp-enterprise/locations/europe-west1/clusters/emea-prod');
                        setConnName('AlloyDB EMEA Analytics Replica');
                      } else if (cp === 'Multi-Cloud (Snowflake / Databricks)') {
                        setGcpService('Snowflake AI Data Cloud');
                        setDialect('Snowflake SQL');
                        setHostUri('snowflake://datatrust_ro@xy12345.eu-west-2.gcp/PROD_DB/PUBLIC?warehouse=COMPUTE_WH');
                        setConnName('Snowflake Global Finance DW');
                      } else if (cp === 'Amazon Web Services (AWS)') {
                        setGcpService('AWS Redshift & Aurora PostgreSQL (via BigQuery Omni)');
                        setDialect('Redshift PostgreSQL / PartiQL');
                        setHostUri('redshift+psycopg2://datatrust_ro@cluster.eu-west-1.redshift.amazonaws.com:5439/prod');
                        setConnName('AWS Redshift & S3 Iceberg Lake');
                      } else if (cp === 'Microsoft Azure') {
                        setGcpService('Azure Synapse, Microsoft Fabric & Azure SQL');
                        setDialect('T-SQL / Parquet');
                        setHostUri('mssql+pyodbc://datatrust_ro@synapse-ws.sql.azuresynapse.net:1433/dw_prod');
                        setConnName('Azure Synapse & Fabric OneLake');
                      } else {
                        setGcpService('Local SQLite / Hybrid Database');
                        setDialect('SQLite / ANSI SQL');
                        setHostUri('sqlite:///:memory:');
                        setConnName('Live Local SQLite Driver DB');
                      }
                    }}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
                  >
                    <option value="Google Cloud">Google Cloud Platform (GCP Native)</option>
                    <option value="Multi-Cloud (Snowflake / Databricks)">Multi-Cloud (Snowflake &amp; Databricks)</option>
                    <option value="Amazon Web Services (AWS)">Amazon Web Services (AWS Redshift / RDS / S3)</option>
                    <option value="Microsoft Azure">Microsoft Azure (Synapse / Fabric / Azure SQL)</option>
                    <option value="Hybrid / Local DB-API">Hybrid / Local SQLite DB-API (Live Driver)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Database / Data Platform Product
                  </label>
                  <select
                    value={gcpService}
                    onChange={(e) => {
                      setGcpService(e.target.value);
                      setTestResult(null);
                    }}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
                  >
                    <optgroup label="Google Cloud Databases & Platforms">
                      <option value="BigQuery & BigLake (incl. BigQuery Omni)">BigQuery &amp; BigLake (incl. BigQuery Omni)</option>
                      <option value="AlloyDB for PostgreSQL">AlloyDB for PostgreSQL &amp; AlloyDB Omni</option>
                      <option value="Cloud Spanner">Cloud Spanner (GoogleSQL &amp; PostgreSQL)</option>
                      <option value="Cloud SQL (PostgreSQL)">Cloud SQL for PostgreSQL</option>
                      <option value="Cloud SQL (MySQL)">Cloud SQL for MySQL</option>
                      <option value="Cloud SQL (SQL Server)">Cloud SQL for SQL Server</option>
                      <option value="Cloud Bigtable">Cloud Bigtable (Wide-Column NoSQL)</option>
                      <option value="Firestore">Firestore (Document NoSQL)</option>
                      <option value="Memorystore for Redis / Valkey">Memorystore (Redis / Valkey)</option>
                      <option value="Dataplex, Datastream, Dataflow & Composer">Dataplex, Datastream, Dataflow &amp; Composer</option>
                      <option value="Dataproc (Apache Spark / Iceberg)">Dataproc (Apache Spark / Iceberg)</option>
                    </optgroup>
                    <optgroup label="Multi-Cloud & Cross-Platform">
                      <option value="Snowflake AI Data Cloud">Snowflake AI Data Cloud (GCP / AWS / Azure)</option>
                      <option value="Databricks Lakehouse & Unity Catalog">Databricks Unity Catalog (GCP / AWS / Azure)</option>
                      <option value="AWS Redshift & Aurora PostgreSQL (via BigQuery Omni)">AWS Redshift, Aurora/RDS &amp; S3 Iceberg</option>
                      <option value="Azure Synapse, Microsoft Fabric & Azure SQL">Azure Synapse, Microsoft Fabric &amp; Azure SQL</option>
                      <option value="Local SQLite / Hybrid Database">Local SQLite / Hybrid DB-API</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Connector Display Name
                  </label>
                  <input
                    type="text"
                    value={connName}
                    onChange={(e) => setConnName(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SQL / Query Dialect
                  </label>
                  <input
                    type="text"
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Connection URI / Resource Path (GCP, Snowflake, Databricks, AWS, Azure, or sqlite://)
                  </label>
                  <input
                    type="text"
                    value={hostUri}
                    onChange={(e) => setHostUri(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SLA (Minutes)
                  </label>
                  <input
                    type="number"
                    value={slaMins}
                    onChange={(e) => setSlaMins(Number(e.target.value))}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
                    min={1}
                    max={1440}
                  />
                </div>
              </div>

              {/* Live Connection Handshake & Schema Introspection Result */}
              {testResult && (
                <div className="bg-emerald-950/35 border border-emerald-500/40 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Connection &amp; Read-Only Handshake Verified ({testResult.connection_mode})
                    </span>
                    <span className="font-mono text-emerald-400">{testResult.latency_ms} ms</span>
                  </div>
                  <div className="text-[11px] font-mono text-blue-300">
                    Driver: {testResult.driver_used}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <strong>Discovered Schemas:</strong> {testResult.discovered_schemas.join(', ')}
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300 pt-1">
                    {testResult.diagnostic_checks.map((chk, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> {chk}
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-amber-300 pt-1 border-t border-emerald-500/20">
                    <strong>Production IAM / Grant Setup:</strong> {testResult.production_setup_hint}
                  </div>
                </div>
              )}

              <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
                <strong>Zero-Trust Multi-Cloud Security:</strong> Uses Workload Identity Federation (GCP IAM, AWS AssumeRoleWithWebIdentity, Azure Entra ID, or Snowflake RSA Key-Pair) with strictly Read-Only metadata &amp; aggregate scopes.
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConn}
                  className="px-4 py-2 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition"
                >
                  {testingConn ? 'Testing Handshake...' : '⚡ Test Connection & Introspect Schema'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTestResult(null);
                      setShowAddModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#1a73e8] hover:bg-blue-600 text-white text-xs font-semibold"
                  >
                    Register Read-Only Connector
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
