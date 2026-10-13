import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  HelpCircle,
  Lock,
  Network,
  Search,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { HypothesisItem, Incident, LineageNode } from '../types';

interface Props {
  incident: Incident;
  allIncidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onJumpToRepair: () => void;
}

export const InvestigationAndLineageTab: React.FC<Props> = ({
  incident,
  allIncidents,
  onSelectIncident,
  onJumpToRepair,
}) => {
  const [selectedNode, setSelectedNode] = useState<LineageNode>(
    incident.lineage_nodes.find((n) => n.status === 'ROOT_CAUSE_DEFECT') || incident.lineage_nodes[0]
  );

  // Sync selectedNode when incident changes
  React.useEffect(() => {
    const defectNode =
      incident.lineage_nodes.find((n) => n.status === 'ROOT_CAUSE_DEFECT') || incident.lineage_nodes[0];
    setSelectedNode(defectNode);
  }, [incident]);

  const getVerdictBadge = (verdict: HypothesisItem['verdict']) => {
    if (verdict === 'PROVEN_ROOT_CAUSE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          PROVEN ROOT CAUSE
        </span>
      );
    }
    if (verdict === 'CONTRIBUTING_FACTOR') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          CONFIRMED MECHANISM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        <XCircle className="w-3.5 h-3.5 text-emerald-400" />
        RULED OUT (VERIFIED HEALTHY)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Incident Switcher Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Search className="w-4 h-4 text-blue-400" />
          <span>Select Incident Scenario:</span>
          <div className="flex flex-wrap gap-2">
            {allIncidents.map((inc) => (
              <button
                key={inc.incident_id}
                onClick={() => onSelectIncident(inc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  inc.incident_id === incident.incident_id
                    ? 'bg-[#1a73e8] text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {inc.incident_id}: {inc.source_database.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onJumpToRepair}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition"
        >
          Proceed to Step 04 &amp; 05: SQL Repair &amp; 5-Gate Proof
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Flagship Incident Summary & Expected vs Reported Banner (Directly modeling datatrust.docx Section 2) */}
      <div className="bg-gradient-to-br from-[#111827] via-[#131d36] to-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold">
                {incident.severity} ANOMALY
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-mono">
                Alert Source: {incident.alert_source}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                Diagnosis Confidence: {incident.confidence_score}%
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{incident.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{incident.executive_summary}</p>

            <div className="bg-slate-950/80 border border-rose-500/30 rounded-lg p-3.5 text-xs text-rose-200">
              <strong className="text-rose-400 uppercase tracking-wider block mb-1">
                Pinpointed Technical Root Cause:
              </strong>
              {incident.root_cause_technical}
            </div>
          </div>

          {/* Expected vs Reported Metric Comparison Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase">
                Expected Baseline ({incident.metric_name})
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
                {incident.expected_value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Verified in {incident.source_database.split('(')[0]} source ledger
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase">
                Reported Metric (Before Fix)
              </div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-2">
                {incident.reported_value}
              </div>
              <div className="text-[11px] text-rose-300 mt-1 font-semibold">
                Variance: {incident.variance_pct > 0 ? `+${incident.variance_pct}` : incident.variance_pct}%
              </div>
            </div>

            <div className="col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Business &amp; Financial Exposure
                </div>
                <div className="text-xs font-bold text-amber-300 mt-0.5">
                  {incident.financial_exposure}
                </div>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                Root Cause Event: {incident.repair_proposal.root_cause_commit_or_event.slice(0, 38)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cross-Database Lineage & Blast-Radius Explorer */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400" />
              Cross-Database Lineage &amp; Root-Cause Trace Explorer (Dataplex Universal Lineage + SQL AST)
            </h3>
            <p className="text-xs text-slate-400">
              Click any node in the pipeline DAG below to inspect its schema columns, Dataplex PII policy tags, freshness lag, and defect impact.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Healthy
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Root Cause Defect
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Impacted Downstream
            </span>
          </div>
        </div>

        {/* Visual DAG Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
          {incident.lineage_nodes.map((node, index) => {
            const isSelected = selectedNode?.node_id === node.node_id;
            const borderClass =
              node.status === 'ROOT_CAUSE_DEFECT'
                ? 'border-rose-500/70 bg-rose-950/20'
                : node.status === 'IMPACTED_DOWNSTREAM'
                ? 'border-amber-500/60 bg-amber-950/15'
                : node.status === 'REPAIRED'
                ? 'border-emerald-500/70 bg-emerald-950/20'
                : 'border-emerald-500/40 bg-slate-900/80';

            return (
              <div
                key={node.node_id}
                onClick={() => setSelectedNode(node)}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition flex flex-col justify-between ${borderClass} ${
                  isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:border-blue-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    <span>
                      Step {index + 1} &bull; {node.gcp_product}
                    </span>
                    <span className="font-mono text-slate-400">{node.freshness_lag}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1 break-all">{node.label}</div>
                  <div className="mt-2">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        node.status === 'ROOT_CAUSE_DEFECT'
                          ? 'bg-rose-500/25 text-rose-300'
                          : node.status === 'IMPACTED_DOWNSTREAM'
                          ? 'bg-amber-500/25 text-amber-300'
                          : 'bg-emerald-500/25 text-emerald-300'
                      }`}
                    >
                      {node.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {node.defect_note && (
                    <p className="text-[11px] text-slate-300 mt-2 leading-snug">{node.defect_note}</p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{node.schema_fields.length} cols</span>
                  <span>{node.row_count} rows</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Lineage Node Detail Inspector */}
        {selectedNode && (
          <div className="mt-5 bg-slate-950/90 border border-slate-800 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-400 uppercase">
                Selected Asset Metadata ({selectedNode.gcp_product})
              </div>
              <div className="text-sm font-bold text-white mt-1 font-mono">{selectedNode.label}</div>
              <div className="text-xs text-slate-400 mt-1">{selectedNode.defect_note}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Schema Fields &amp; Drift Inspection
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.schema_fields.map((f, i) => (
                  <span
                    key={i}
                    className={`text-xs font-mono px-2 py-0.5 rounded border ${
                      f.includes('NULL') || f.includes('SETTLED_OK') || f.includes('alert')
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Dataplex Governance &amp; Policy Tags
              </div>
              {selectedNode.dataplex_policy_tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.dataplex_policy_tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">No restricted PII policy tags on this pipeline hop.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6-Hypothesis Evaluation Matrix (Directly addressing datatrust.docx Section 1 & 3) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Gemini 4 Argon Autonomous Hypothesis Evaluation Matrix ({incident.hypotheses.length} Candidate Causes Tested)
          </h3>
          <p className="text-xs text-slate-400">
            Rather than guessing, DataTrust AI systematically tests every candidate hypothesis against read-only metadata, CDC logs, and aggregate SQL probes to prove what broke and rule out false leads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {incident.hypotheses.map((hyp) => (
            <div
              key={hyp.hypothesis_id}
              className={`rounded-xl border p-4 flex flex-col justify-between ${
                hyp.verdict === 'PROVEN_ROOT_CAUSE'
                  ? 'bg-rose-950/20 border-rose-500/50'
                  : hyp.verdict === 'CONTRIBUTING_FACTOR'
                  ? 'bg-amber-950/15 border-amber-500/40'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {hyp.category}
                  </span>
                  {getVerdictBadge(hyp.verdict)}
                </div>

                <h4 className="text-sm font-bold text-white">{hyp.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{hyp.evidence_summary}</p>

                <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                    <span>Executed Diagnostic SQL Probe</span>
                    <span className="text-emerald-400">Confidence: {hyp.confidence_pct}%</span>
                  </div>
                  <pre className="text-[11px] font-mono text-blue-200 overflow-x-auto whitespace-pre-wrap">
                    {hyp.diagnostic_sql}
                  </pre>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Observed Probe Metric:</span>
                <span className="font-mono font-semibold text-white">{hyp.metric_observed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
