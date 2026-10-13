import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileDiff,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Table,
  Terminal,
  XCircle,
} from 'lucide-react';
import { Incident } from '../types';

interface Props {
  incident: Incident;
  onRunVerification: (customSql?: string) => Promise<void>;
  onJumpToApproval: () => void;
  busy: boolean;
}

export const RepairAndVerificationTab: React.FC<Props> = ({
  incident,
  onRunVerification,
  onJumpToApproval,
  busy,
}) => {
  const [customSql, setCustomSql] = useState(incident.repair_proposal.proposed_sql);
  const [activeCodeView, setActiveCodeView] = useState<'diff' | 'edit' | 'backfill' | 'rollback'>('diff');

  useEffect(() => {
    setCustomSql(incident.repair_proposal.proposed_sql);
  }, [incident]);

  const proof = incident.verification_proof;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="bg-gradient-to-r from-[#111827] via-[#13223f] to-[#0f172a] border border-blue-500/30 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Step 04 (Repair) &amp; Step 05 (Prove) &bull; Deterministic 5-Gate Verification Sandbox
            </div>
            <h2 className="text-xl font-bold text-white">
              {incident.repair_proposal.target_asset} ({incident.repair_proposal.sql_dialect})
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              {incident.repair_proposal.explanation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                onRunVerification(
                  activeCodeView === 'edit' ? customSql : undefined
                )
              }
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a73e8] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
            >
              <Play className="w-4 h-4" />
              {busy ? 'Running 5-Gate Sandbox...' : 'Re-Run 5-Gate Sandbox Verification'}
            </button>
            <button
              onClick={onJumpToApproval}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
            >
              Step 06: Approve &amp; Generate Git PR
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SQL Diff & Remediation Artifact Editor */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileDiff className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono text-slate-300">
              File: <strong className="text-white">{incident.repair_proposal.file_path_in_repo}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCodeView('diff')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeCodeView === 'diff'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Side-by-Side SQL Diff
            </button>
            <button
              onClick={() => setActiveCodeView('edit')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeCodeView === 'edit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Interactive SQL Sandbox Editor
            </button>
            <button
              onClick={() => setActiveCodeView('backfill')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeCodeView === 'backfill'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Partition Backfill (MERGE)
            </button>
            <button
              onClick={() => setActiveCodeView('rollback')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeCodeView === 'rollback'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Safe Rollback Plan
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeCodeView === 'diff' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-rose-500/40 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between text-xs font-semibold text-rose-300">
                  <span>BEFORE (Broken Transformation in Production)</span>
                  <span className="font-mono">Output: {incident.reported_value}</span>
                </div>
                <pre className="p-4 text-xs font-mono text-rose-200/90 overflow-x-auto leading-relaxed">
                  {incident.repair_proposal.original_sql}
                </pre>
              </div>

              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <span>AFTER (DataTrust AI Verified SQL Repair)</span>
                  <span className="font-mono">Output: {incident.expected_value} (100% Match)</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-200/95 overflow-x-auto leading-relaxed">
                  {incident.repair_proposal.proposed_sql}
                </pre>
              </div>
            </div>
          )}

          {activeCodeView === 'edit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Edit the proposed SQL below and click <strong>Re-Run 5-Gate Sandbox Verification</strong> to test your custom query against the live sandbox database:
                </span>
                <button
                  onClick={() => setCustomSql(incident.repair_proposal.proposed_sql)}
                  className="text-blue-400 hover:underline"
                >
                  Reset to AI Recommended SQL
                </button>
              </div>
              <textarea
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                rows={10}
                className="w-full rounded-xl bg-slate-950 border border-blue-500/40 p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {activeCodeView === 'backfill' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-blue-400 mb-2">
                Idempotent Historical Partition Backfill Script ({incident.repair_proposal.target_gcp_product})
              </div>
              <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {incident.repair_proposal.backfill_sql}
              </pre>
            </div>
          )}

          {activeCodeView === 'rollback' && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Zero-Downtime Rollback Plan (BigQuery Time Travel / View Snapshot)
              </div>
              <pre className="text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed">
                {incident.repair_proposal.rollback_sql}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 5-Gate Deterministic Verification Results */}
      {proof && (
        <>
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  5-Gate Deterministic Verification Sandbox Report
                </h3>
                <p className="text-xs text-slate-400">
                  Sandbox Environment: <code className="text-blue-300">{proof.sandbox_environment}</code> &bull; Verified at{' '}
                  {proof.verified_at}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  proof.overall_passed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {proof.overall_passed ? 'ALL 5 GATES PASSED (100% VERIFIED)' : 'VERIFICATION FAILED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {proof.gates.map((gate) => (
                <div
                  key={gate.gate_number}
                  className={`rounded-xl border p-4 flex flex-col justify-between ${
                    gate.status === 'PASSED'
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        GATE 0{gate.gate_number}
                      </span>
                      {gate.status === 'PASSED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white">{gate.gate_name.split(': ')[1]}</div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">{gate.summary}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>{gate.status}</span>
                    <span>{gate.duration_ms} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Before vs After Regional KPI Reconciliation Proof Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-400" />
                    Before vs. After Sandbox Reconciliation Proof Table
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live comparison of broken warehouse output vs. repaired SQL output against the upstream Google Cloud source ledger.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                  {proof.recovered_delta_display}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Region / Segment</th>
                      <th className="py-2.5 px-3">Source OLTP Ledger</th>
                      <th className="py-2.5 px-3 text-rose-400">Before Fix (Broken)</th>
                      <th className="py-2.5 px-3 text-emerald-400">After Fix (Verified)</th>
                      <th className="py-2.5 px-3">Variance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono">
                    {proof.reconciliation_rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-bold text-white">{r.dimension_key}</td>
                        <td className="py-2.5 px-3 text-slate-300">{r.source_oltp_value}</td>
                        <td className="py-2.5 px-3 text-rose-400">
                          {r.before_fix_warehouse_value}{' '}
                          <span className="text-[10px] text-rose-300/80">({r.variance_before})</span>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{r.after_fix_warehouse_value}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">
                            {r.variance_after}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automated Regression Test Suite */}
            <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-white mb-1">
                Automated Data Quality &amp; Regression Suite
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Deterministic SQL assertions executed against the sandbox output table.
              </p>

              <div className="space-y-2.5">
                {proof.regression_tests.map((t) => (
                  <div
                    key={t.test_id}
                    className="bg-slate-900/80 border border-slate-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {t.test_id}: {t.test_name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t.status_before_fix} &rarr; {t.status_after_fix}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
                      <div className="text-rose-300">Before: {t.before_value}</div>
                      <div className="text-emerald-300">After: {t.after_value}</div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                      {t.sql_assertion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Recovered / Reconciled Records from Sandbox */}
          {proof.sample_recovered_records.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Sample Affected / Recovered Records Inspected in Isolated Sandbox (Zero-PII Masked View)
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Sample rows from the upstream Google Cloud operational database that were previously excluded or duplicated prior to the verified SQL fix.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      {Object.keys(proof.sample_recovered_records[0]).map((col) => (
                        <th key={col} className="py-2 px-3">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {proof.sample_recovered_records.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 text-slate-200">
                            {val === null ? (
                              <span className="text-rose-400 font-bold">NULL</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
