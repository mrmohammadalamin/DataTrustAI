import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building2,
  Calculator,
  CheckCircle2,
  Code,
  Database,
  FileCheck2,
  GitPullRequest,
  Globe,
  History,
  Lock,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';
import {
  AuditLogEntry,
  GovernedAnalyticsResponse,
  Incident,
  PartnerEcosystemPayload,
} from '../types';

interface AnalyticsProps {
  presets: { id: string; label: string; database: string; question: string }[];
}

export const GovernedAnalyticsStudio: React.FC<AnalyticsProps> = ({ presets }) => {
  const [question, setQuestion] = useState(
    'Why did daily retail revenue fall by 32% overnight across UK and EU regions?'
  );
  const [customSql, setCustomSql] = useState('');
  const [targetDb, setTargetDb] = useState('BigQuery + AlloyDB Federated Sandbox');
  const [result, setResult] = useState<GovernedAnalyticsResponse | null>(null);
  const [catalog, setCatalog] = useState<
    { table_name: string; gcp_product: string; role: string; row_count: number; columns: string[] }[]
  >([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSandboxCatalog().then((c) => setCatalog(c.tables)).catch(() => {});
    handleRunQuery('Why did daily retail revenue fall by 32% overnight across UK and EU regions?');
  }, []);

  const handleRunQuery = async (qOverride?: string, sqlOverride?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.runAnalyticsQuery({
        question: qOverride ?? question,
        custom_sql: sqlOverride !== undefined ? sqlOverride : customSql || undefined,
        target_database: targetDb,
      });
      setResult(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#111827] via-[#152238] to-[#0f172a] border border-blue-500/30 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Sparkles className="w-4 h-4" />
              Feature A: Governed AI Analytics &bull; Read-Only Multi-Database Query Studio
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Ask DataTrust AI Across Any Google Cloud Database
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              Ask natural-language questions or execute governed read-only SQL across BigQuery, AlloyDB, Cloud Spanner, Cloud SQL, Cloud Bigtable, and Firestore. AST safety guardrails automatically block destructive DDL/DML.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-lg">
            <Lock className="w-4 h-4" />
            AST Read-Only Enforced &bull; Max Bytes Billed Cap: 1.0 GB
          </div>
        </div>

        {/* One-Click Preset Questions */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">
            One-Click Multi-Database Diagnostic Prompts:
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setQuestion(p.question);
                  setCustomSql('');
                  setTargetDb(p.database);
                  handleRunQuery(p.question, '');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-950/60 text-xs text-slate-200 border border-slate-700 hover:border-blue-500/50 transition text-left"
              >
                <span className="text-blue-400 font-semibold">[{p.database}]</span> {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input & Sandbox Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Natural-Language Question for Gemini 4 Argon SQL Synthesizer
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Why did revenue fall this week? Or: Show Cloud Spanner duplicate charges in Region West"
                className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white"
              />
              <button
                onClick={() => handleRunQuery(question, '')}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a73e8] hover:bg-blue-600 text-white text-xs font-bold shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Ask AI &amp; Run SQL
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Optional: Custom Read-Only SQL Override (Or Test Gate 1 Destructive SQL Blocker)
              </label>
              <button
                onClick={() => {
                  const unsafe = 'DROP TABLE alloydb_orders;';
                  setCustomSql(unsafe);
                  handleRunQuery('Test Destructive SQL Guardrail', unsafe);
                }}
                className="text-[11px] text-rose-400 hover:underline font-mono"
              >
                Test Security Guardrail: Try &quot;DROP TABLE alloydb_orders;&quot;
              </button>
            </div>
            <div className="flex gap-2">
              <textarea
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                rows={3}
                placeholder="SELECT region, reported_revenue_gbp FROM bq_fct_daily_revenue_fixed;"
                className="flex-1 rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-blue-200"
              />
              <button
                onClick={() => handleRunQuery(question, customSql)}
                disabled={loading || !customSql.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shrink-0"
              >
                <Play className="w-3.5 h-3.5 inline mr-1" />
                Execute SQL
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-500/60 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <div className="font-bold text-rose-300 uppercase">
                  Gate 1 Deterministic AST Security Guardrail Blocked Execution
                </div>
                <div className="font-mono mt-1">{errorMsg}</div>
              </div>
            </div>
          )}
        </div>

        {/* Live Sandbox Table Catalog */}
        <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
            <Database className="w-4 h-4" />
            Live Multi-Database Sandbox Tables ({catalog.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {catalog.map((tbl) => (
              <div
                key={tbl.table_name}
                onClick={() => {
                  const q = `SELECT * FROM ${tbl.table_name} LIMIT 15;`;
                  setCustomSql(q);
                  handleRunQuery(`Inspect ${tbl.table_name} (${tbl.gcp_product})`, q);
                }}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg p-2.5 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-white">{tbl.table_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300">
                    {tbl.row_count} rows
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {tbl.gcp_product} &bull; {tbl.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Query Execution Results & AI Explanation */}
      {result && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-400">
                  Generated &amp; AST-Validated SQL ({result.dialect})
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  {result.execution_ms} ms &bull; {result.estimated_bytes_scanned.toLocaleString()} B scanned
                </span>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed">
                {result.generated_sql}
              </pre>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-bold uppercase text-emerald-400">
                AI Query Explanation &amp; Root-Cause Insights
              </div>
              <p className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 leading-relaxed">
                {result.explanation}
              </p>
              <div className="space-y-2">
                {result.ai_insights.map((ins, i) => (
                  <div
                    key={i}
                    className="bg-blue-950/25 border border-blue-500/30 rounded-lg p-3 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result Rows Table */}
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-2">
              Live Query Result Set ({result.row_count} rows returned)
            </div>
            <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/70">
                    {result.columns.map((c) => (
                      <th key={c} className="py-2.5 px-3">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-900/60">
                      {result.columns.map((c) => (
                        <td key={c} className="py-2 px-3 text-slate-200">
                          {r[c] === null ? (
                            <span className="text-rose-400 font-bold">NULL</span>
                          ) : (
                            String(r[c])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface GovernanceProps {
  incident: Incident;
  auditLogs: AuditLogEntry[];
  partnerData: PartnerEcosystemPayload | null;
  onApproveAction: (
    action: 'APPROVE_AND_DEPLOY' | 'GENERATE_GIT_PR' | 'ROLLBACK',
    reviewerName: string,
    reviewerRole: string,
    comment: string
  ) => Promise<void>;
  busy: boolean;
}

export const GovernanceAndPartnerCenter: React.FC<GovernanceProps> = ({
  incident,
  auditLogs,
  partnerData,
  onApproveAction,
  busy,
}) => {
  const [reviewerName, setReviewerName] = useState('Sarah Chen');
  const [reviewerRole, setReviewerRole] = useState(
    'Principal Data Reliability Architect (IAM: roles/dataplex.dataOwner)'
  );
  const [comment, setComment] = useState(
    'Reviewed 5-Gate Sandbox proof, regional reconciliation table (£68k -> £100k), and rollback plan. Approved for production.'
  );

  // Interactive ROI Calculator State (from datatrust.docx Section 6)
  const [incidentsPerMonth, setIncidentsPerMonth] = useState(20);
  const [hoursPerIncident, setHoursPerIncident] = useState(4.0);
  const [reductionPct, setReductionPct] = useState(75);
  const [hourlyRateGbp, setHourlyRateGbp] = useState(95);

  const monthlyHoursBefore = incidentsPerMonth * hoursPerIncident;
  const monthlyHoursSaved = Math.round((monthlyHoursBefore * reductionPct) / 100);
  const annualSavingsGbp = monthlyHoursSaved * 12 * hourlyRateGbp;

  return (
    <div className="space-y-6">
      {/* Step 06: Human-Approved Remediation & Git PR Workbench */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
              Step 06: Governed Human-in-the-Loop Approval, Git Pull Request &amp; Safe Rollback
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Remediation Release Gate for {incident.incident_id}: {incident.title}
            </h2>
            <p className="text-xs text-slate-400">
              Current Stage:{' '}
              <strong className="text-blue-400">{incident.loop_stage.replace('_', ' ')}</strong>
              {incident.approved_by && (
                <span>
                  {' '}
                  &bull; Last Approved by <strong className="text-emerald-400">{incident.approved_by}</strong> at{' '}
                  {incident.approved_at}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() =>
                onApproveAction('GENERATE_GIT_PR', reviewerName, reviewerRole, comment)
              }
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
            >
              <GitPullRequest className="w-4 h-4" />
              Generate / Update Git PR
            </button>
            <button
              onClick={() =>
                onApproveAction('APPROVE_AND_DEPLOY', reviewerName, reviewerRole, comment)
              }
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve &amp; Deploy Verified Fix
            </button>
            <button
              onClick={() =>
                onApproveAction(
                  'ROLLBACK',
                  reviewerName,
                  reviewerRole,
                  'Executed 1-click safe rollback via BigQuery Time Travel.'
                )
              }
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-xs font-bold transition"
            >
              <RotateCcw className="w-4 h-4" />
              Execute 1-Click Safe Rollback
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          {/* Reviewer Sign-off & Blast Radius */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Approving Engineer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  RBAC Governance Role
                </label>
                <select
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                >
                  <option value="Principal Data Reliability Architect (IAM: roles/dataplex.dataOwner)">
                    Principal Data Reliability Architect
                  </option>
                  <option value="Analytics Engineering Lead (dbt Maintainer)">
                    Analytics Engineering Lead (dbt)
                  </option>
                  <option value="Google Cloud Partner Practice Lead">
                    Google Cloud Partner Practice Lead
                  </option>
                  <option value="Data Governance & SOX Compliance Officer">
                    Data Governance &amp; SOX Officer
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Approval Audit Note &amp; Change Justification
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
              />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-amber-400 mb-2">
                Downstream Blast-Radius Analysis ({incident.repair_proposal.affected_downstream_assets.length} Protected Assets)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {incident.repair_proposal.affected_downstream_assets.map((asset, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono">{asset}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Git Pull Request Artifact Preview */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  Automated Git Pull Request Artifact{' '}
                  {incident.git_pr ? `#${incident.git_pr.pr_number}` : '(Ready to Generate)'}
                </span>
              </div>
              {incident.git_pr && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Status: {incident.git_pr.status}
                </span>
              )}
            </div>

            {incident.git_pr ? (
              <div className="mt-3 space-y-3 text-xs">
                <div className="font-bold text-blue-300 text-sm">{incident.git_pr.title}</div>
                <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-400">
                  <span>Repo: {incident.git_pr.repository}</span>
                  <span>
                    Branch: <strong className="text-indigo-300">{incident.git_pr.branch_name}</strong> &rarr;{' '}
                    {incident.git_pr.base_branch}
                  </span>
                </div>
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {incident.git_pr.markdown_body}
                </pre>
                <div className="flex flex-wrap gap-1.5">
                  {incident.git_pr.files_changed.map((f, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-blue-300 border border-slate-700"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Click <strong>Generate / Update Git PR</strong> or <strong>Approve &amp; Deploy Verified Fix</strong> above to create the signed pull request bundle.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Cloud Deployment Models, Partner Routes & ROI Calculator */}
      {partnerData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Google Cloud Production Deployment Models &amp; Partner Commercial Routes
            </h3>

            <div className="space-y-3">
              {partnerData.deployment_models.map((m) => (
                <div key={m.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-indigo-300 mt-1">{m.architecture}</div>
                  <p className="text-xs text-slate-300 mt-1.5">{m.summary}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase text-blue-400 mb-2">
                How DataTrust AI Integrates with Existing Market Tools (The Wedge)
              </h4>
              <div className="space-y-2">
                {partnerData.competitor_comparison.map((c, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs">
                    <div className="font-bold text-white">{c.vendor}</div>
                    <div className="text-slate-400 mt-0.5">Existing: {c.current_capability}</div>
                    <div className="text-emerald-300 mt-1 font-medium">
                      DataTrust AI Integration Wedge: {c.datatrust_wedge}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Commercial ROI & MTTR Savings Calculator */}
          <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Enterprise &amp; Partner ROI / MTTR Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Model engineering hours and budget saved across a customer or Google Cloud consulting partner portfolio (from Section 6 of <code>datatrust.docx</code>).
            </p>

            <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Data Incidents per Month</span>
                  <span className="font-mono font-bold text-blue-400">{incidentsPerMonth} incidents</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={incidentsPerMonth}
                  onChange={(e) => setIncidentsPerMonth(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Manual Investigation Effort per Incident</span>
                  <span className="font-mono font-bold text-blue-400">{hoursPerIncident} hours</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={hoursPerIncident}
                  onChange={(e) => setHoursPerIncident(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">DataTrust AI Effort Reduction (%)</span>
                  <span className="font-mono font-bold text-emerald-400">{reductionPct}% faster</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={90}
                  step={5}
                  value={reductionPct}
                  onChange={(e) => setReductionPct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Engineering Time Saved</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {monthlyHoursSaved} hrs/mo
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Down from {monthlyHoursBefore} hrs/mo manual work
                </div>
              </div>

              <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Annual Engineering Value</div>
                <div className="text-2xl font-bold text-blue-400 font-mono mt-1">
                  £{annualSavingsGbp.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Plus avoided executive dashboard downtime
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-amber-400 mb-2">
                3 Commercial Partner Routes
              </div>
              <div className="space-y-2">
                {partnerData.commercial_routes.map((rt, i) => (
                  <div key={i} className="text-xs">
                    <div className="font-bold text-white">{rt.route}</div>
                    <div className="text-slate-400 text-[11px]">{rt.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Immutable Governance & Cryptographic Audit Log */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Immutable Governance, Sandbox Verification &amp; Approval Audit Trail ({auditLogs.length} Events)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Every metadata probe, 5-Gate verification run, governed SQL query, Git PR, and human approval is logged with a cryptographic SHA-256 verification hash.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Audit ID / Time</th>
                <th className="py-2.5 px-3">Actor &amp; IAM Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Access Mode</th>
                <th className="py-2.5 px-3">Details &amp; Evidence Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {auditLogs.map((log) => (
                <tr key={log.audit_id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-mono">
                    <div className="font-bold text-blue-300">{log.audit_id}</div>
                    <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{log.actor}</div>
                    <div className="text-[10px] text-slate-400">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                    {log.access_mode}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-200">{log.details}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {log.verification_hash} &bull; {log.gcp_resources_touched.join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
