import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  GitPullRequest,
  LayoutDashboard,
  Lock,
  LogOut,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserCheck,
} from 'lucide-react';
import { api } from './api';
import { AuthGateModal } from './components/AuthGateModal';
import {
  GovernedAnalyticsStudio,
  GovernanceAndPartnerCenter,
} from './components/GovernedAnalyticsAndGovernanceTab';
import { InvestigationAndLineageTab } from './components/InvestigationAndLineageTab';
import { OverviewAndConnectorsTab } from './components/OverviewAndConnectorsTab';
import { RepairAndVerificationTab } from './components/RepairAndVerificationTab';
import { ArchitectureMindmapStudioTab } from './components/ArchitectureMindmapStudioTab';
import {
  AuditLogEntry,
  AuthSessionResponse,
  Incident,
  OverviewPayload,
  PartnerEcosystemPayload,
} from './types';

type ActiveTab = 'overview' | 'investigate' | 'repair' | 'analytics' | 'governance' | 'mindmap';

export function App() {
  const [authSession, setAuthSession] = useState<AuthSessionResponse | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [presets, setPresets] = useState<
    { id: string; label: string; database: string; question: string }[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [partnerData, setPartnerData] = useState<PartnerEcosystemPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAiDrawer, setShowAiDrawer] = useState(true);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const loadAllData = async (tenantFilter = selectedTenantId, preserveIncidentId?: string) => {
    setBusy(true);
    try {
      const [ov, pr, logs, part] = await Promise.all([
        api.getOverview(tenantFilter),
        api.getAnalyticsPresets(),
        api.getAuditLogs(),
        api.getPartnerEcosystem(),
      ]);
      setOverview(ov);
      setPresets(pr);
      setAuditLogs(logs);
      setPartnerData(part);

      const targetId = preserveIncidentId || selectedIncident?.incident_id || 'INC-2026-001';
      const match =
        ov.incidents.find((i) => i.incident_id === targetId) || ov.incidents[0] || null;
      setSelectedIncident(match);
    } catch (err) {
      showNotification(`Failed to connect to backend: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadAllData('all', 'INC-2026-001');
  }, []);

  const handleAuthenticated = async (session: AuthSessionResponse) => {
    setAuthSession(session);
    setShowAuthModal(false);
    await loadAllData(selectedTenantId, selectedIncident?.incident_id);
    showNotification(
      `Signed in via ${session.user.auth_provider} as ${session.user.full_name} (${session.user.role})`
    );
  };

  const handleSelectTenant = async (tid: string) => {
    setSelectedTenantId(tid);
    await loadAllData(tid);
  };

  const handleSelectIncident = (
    inc: Incident,
    jumpToTab?: 'investigate' | 'repair' | 'governance'
  ) => {
    setSelectedIncident(inc);
    if (jumpToTab) {
      setActiveTab(jumpToTab);
    }
  };

  const handleRunVerification = async (customSql?: string) => {
    if (!selectedIncident) return;
    setBusy(true);
    try {
      const actorName = authSession
        ? `${authSession.user.full_name} (${authSession.user.role})`
        : 'Principal Data Reliability Engineer';
      const updated = await api.verifyIncident(selectedIncident.incident_id, customSql, actorName);
      setSelectedIncident(updated);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      showNotification(
        `5-Gate Sandbox Verification PASSED for ${updated.incident_id} (${updated.verification_proof?.repaired_metric_display} reconciled)`
      );
    } catch (err) {
      showNotification(`Verification Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleApproveAction = async (
    action: 'APPROVE_AND_DEPLOY' | 'GENERATE_GIT_PR' | 'ROLLBACK',
    reviewerName: string,
    reviewerRole: string,
    comment: string
  ) => {
    if (!selectedIncident) return;
    setBusy(true);
    try {
      const effectiveName = authSession ? authSession.user.full_name : reviewerName;
      const effectiveRole = authSession
        ? `${authSession.user.role} (${authSession.user.gcp_iam_binding})`
        : reviewerRole;
      const updated = await api.approveOrManageIncident(
        selectedIncident.incident_id,
        action,
        effectiveName,
        effectiveRole,
        comment
      );
      setSelectedIncident(updated);
      await loadAllData(selectedTenantId, updated.incident_id);
      showNotification(
        `Action ${action} completed for ${updated.incident_id} by ${effectiveName}`
      );
    } catch (err) {
      const logs = await api.getAuditLogs().catch(() => auditLogs);
      setAuditLogs(logs);
      showNotification(`${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSimulateWebhook = async (source: string, db: string, title?: string) => {
    setBusy(true);
    try {
      const newInc = await api.simulateWebhook(source, db, title);
      await loadAllData('all', newInc.incident_id);
      setSelectedIncident(newInc);
      setActiveTab('investigate');
      showNotification(
        `Ingested live alert ${newInc.incident_id} (${db}) and completed 5-Gate Sandbox proof!`
      );
    } catch (err) {
      showNotification(`Webhook Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleAddConnector = async (payload: {
    name: string;
    gcp_service: string;
    dialect: string;
    host_or_uri: string;
    auth_mode: string;
    freshness_sla_minutes: number;
  }) => {
    setBusy(true);
    try {
      await api.createConnector(payload);
      await loadAllData(selectedTenantId, selectedIncident?.incident_id);
      showNotification(`Connected ${payload.gcp_service} (${payload.name}) in Read-Only mode!`);
    } catch (err) {
      showNotification(`Connector Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  if (!overview || !selectedIncident) {
    return (
      <div className="min-h-screen bg-[#0b101e] flex items-center justify-center p-6 text-slate-300">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          Initializing DataTrust AI Google Cloud Multi-Database Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b101e] text-slate-100 flex flex-col">
      {/* Enterprise Google Cloud Identity Platform & IAP Gate Modal */}
      {(!authSession || showAuthModal) && (
        <AuthGateModal
          currentSession={authSession}
          onAuthenticated={handleAuthenticated}
          onCloseIfAuthenticated={authSession ? () => setShowAuthModal(false) : undefined}
        />
      )}

      {/* Top Google Cloud Console Header */}
      <header className="sticky top-0 z-40 h-14 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a73e8] to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/30">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                Google Cloud &bull; DataTrust AI
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ● IAP &amp; OIDC Protected
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Autonomous Data Quality, Lineage Investigation &amp; 5-Gate Verified SQL Remediation
            </div>
          </div>
        </div>

        {/* GCP Project / Partner Tenant Selector + Authenticated User Identity Badge */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-slate-400">Scope:</span>
            <select
              value={selectedTenantId}
              onChange={(e) => handleSelectTenant(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all" className="bg-slate-900">
                All GCP Environments &amp; Partner Clients ({overview.tenants.length} Projects)
              </option>
              {overview.tenants.map((t) => (
                <option key={t.tenant_id} value={t.tenant_id} className="bg-slate-900">
                  {t.gcp_project_id} — {t.organization_name}
                </option>
              ))}
            </select>
          </div>

          {authSession ? (
            <div className="flex items-center gap-2 bg-slate-900/95 border border-emerald-500/35 rounded-lg px-2.5 py-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white leading-tight">
                  {authSession.user.full_name}
                </div>
                <div className="text-[9px] font-mono text-emerald-300 leading-tight">
                  {authSession.user.role}
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-1 px-2 py-0.5 rounded bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold"
              >
                Switch Role / SSO
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a73e8] text-white text-xs font-bold"
            >
              <Lock className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          <button
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showAiDrawer
                ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Layout: Left Sidebar + Center Workspace + Right AI Analyst Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Inspired by image1.jpg & GCP Console) */}
        <aside className="w-60 bg-[#0d1424] border-r border-slate-800/90 p-3.5 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 mb-2">
                Monitor &amp; Connect
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'overview'
                      ? 'bg-[#1a73e8] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Command Center &amp; DBs
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {overview.metrics.total_incidents}
                  </span>
                </button>
              </nav>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 mb-2">
                Investigate &amp; Prove
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('investigate')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'investigate'
                      ? 'bg-[#1a73e8] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  Root Cause &amp; Lineage
                </button>

                <button
                  onClick={() => setActiveTab('repair')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'repair'
                      ? 'bg-[#1a73e8] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  SQL Repair &amp; 5-Gate Proof
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'analytics'
                      ? 'bg-[#1a73e8] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <TerminalSquare className="w-4 h-4" />
                  Governed AI SQL Studio
                </button>
              </nav>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 mb-2">
                Govern &amp; Commercialize
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('governance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'governance'
                      ? 'bg-[#1a73e8] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <GitPullRequest className="w-4 h-4" />
                  Approval, PR &amp; Partners
                </button>

                <button
                  onClick={() => setActiveTab('mindmap')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'mindmap'
                      ? 'bg-[#1a73e8] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Architecture &amp; Mindmap
                </button>
              </nav>
            </div>
          </div>

          {/* Active Incident Context Card in Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-blue-400">
              <span>Active Investigation</span>
              <span>{selectedIncident.confidence_score}% Conf</span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {selectedIncident.incident_id}: {selectedIncident.metric_name}
            </div>
            <div className="text-[11px] text-slate-400">
              {selectedIncident.expected_value} &rarr;{' '}
              <span className="text-rose-400 font-semibold">{selectedIncident.reported_value}</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              5-Gate Sandbox Verified
            </div>
          </div>
        </aside>

        {/* Center Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Mobile / Compact Tab Switcher */}
          <div className="flex lg:hidden flex-wrap gap-1.5 mb-4">
            {(
              [
                ['overview', '1. Command Center'],
                ['investigate', '2. Root Cause & Lineage'],
                ['repair', '3. SQL Repair & Proof'],
                ['analytics', '4. AI SQL Studio'],
                ['governance', '5. Approval & Partners'],
                ['mindmap', '6. Architecture & Mindmap'],
              ] as [ActiveTab, string][]
            ).map(([tabKey, label]) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeTab === tabKey
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <OverviewAndConnectorsTab
              overview={overview}
              selectedIncident={selectedIncident}
              onSelectIncident={handleSelectIncident}
              onSimulateWebhook={handleSimulateWebhook}
              onAddConnector={handleAddConnector}
              busy={busy}
            />
          )}

          {activeTab === 'investigate' && (
            <InvestigationAndLineageTab
              incident={selectedIncident}
              allIncidents={overview.incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onJumpToRepair={() => setActiveTab('repair')}
            />
          )}

          {activeTab === 'repair' && (
            <RepairAndVerificationTab
              incident={selectedIncident}
              onRunVerification={handleRunVerification}
              onJumpToApproval={() => setActiveTab('governance')}
              busy={busy}
            />
          )}

          {activeTab === 'analytics' && <GovernedAnalyticsStudio presets={presets} />}

          {activeTab === 'governance' && (
            <GovernanceAndPartnerCenter
              incident={selectedIncident}
              auditLogs={auditLogs}
              partnerData={partnerData}
              onApproveAction={handleApproveAction}
              busy={busy}
            />
          )}

          {activeTab === 'mindmap' && <ArchitectureMindmapStudioTab />}
        </main>

        {/* Right Collapsible AI Analyst Copilot Panel (Inspired by image1.jpg in datatrust.docx) */}
        {showAiDrawer && (
          <aside className="w-80 bg-[#0d1424] border-l border-slate-800/90 p-4 hidden xl:flex flex-col justify-between shrink-0">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Gemini 4 Argon Analyst</div>
                    <div className="text-[10px] text-emerald-400">● Online &bull; Read-Only Scoped</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
                <div>
                  I&apos;m monitoring <strong className="text-white">{overview.connectors.length} Google Cloud database &amp; pipeline streams</strong>. Active focus:
                </div>
                <div className="bg-rose-950/35 border border-rose-500/40 rounded-lg p-2.5 space-y-1">
                  <div className="font-bold text-rose-300">{selectedIncident.incident_id}: {selectedIncident.metric_name}</div>
                  <div className="text-[11px] text-slate-300">{selectedIncident.subtitle}</div>
                  <div className="text-[11px] font-mono text-amber-300 pt-1">
                    Exposure: {selectedIncident.financial_exposure}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-bold text-blue-400 uppercase text-[10px]">
                  Root Cause Summary ({selectedIncident.confidence_score}% Confidence)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedIncident.root_cause_technical}
                </p>
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5 text-[11px] text-emerald-300">
                  ✓ <strong>Recommended Action:</strong> Apply dialect-verified SQL patch and review 5-Gate Sandbox Reconciliation ({selectedIncident.reported_value} &rarr; {selectedIncident.expected_value}).
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Quick Copilot Actions
                </div>
                <button
                  onClick={() => setActiveTab('investigate')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition"
                >
                  🔍 Inspect 6-Hypothesis Matrix &amp; Lineage
                </button>
                <button
                  onClick={() => setActiveTab('repair')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition"
                >
                  🛠️ View SQL Diff &amp; Run 5-Gate Proof
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition"
                >
                  📊 Query AlloyDB, Spanner &amp; BigQuery Live
                </button>
                <button
                  onClick={() => setActiveTab('governance')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition"
                >
                  🛡️ Approve Fix &amp; Generate Git PR
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Zero-Data-Exfiltration Mode</span>
              <span className="text-emerald-400 font-mono">ACTIVE</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
