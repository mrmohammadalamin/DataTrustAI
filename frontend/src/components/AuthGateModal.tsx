import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Cloud,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { api } from '../api';
import { AuthBlueprintPayload, AuthSessionResponse, UserAccount } from '../types';

interface Props {
  currentSession: AuthSessionResponse | null;
  onAuthenticated: (session: AuthSessionResponse) => void;
  onCloseIfAuthenticated?: () => void;
}

export const AuthGateModal: React.FC<Props> = ({
  currentSession,
  onAuthenticated,
  onCloseIfAuthenticated,
}) => {
  const [mode, setMode] = useState<'sso' | 'login' | 'signup' | 'architecture'>('sso');
  const [blueprint, setBlueprint] = useState<AuthBlueprintPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email Login state
  const [loginEmail, setLoginEmail] = useState('sarah.chen@omniretail-gcp.com');
  const [loginPassword, setLoginPassword] = useState('DataTrust#2026');

  // Sign-Up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupOrg, setSignupOrg] = useState('Global Retail & FinTech Corp');
  const [signupProject, setSignupProject] = useState('gcp-enterprise-analytics-prod');
  const [signupRole, setSignupRole] = useState('DATA_GOVERNANCE_APPROVER');

  useEffect(() => {
    api.getAuthBlueprint().then(setBlueprint).catch(() => {});
  }, []);

  const handleGoogleSSO = async (email: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const session = await api.loginWithGoogleSSO(email);
      onAuthenticated(session);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const session = await api.loginWithEmail(loginEmail, loginPassword);
      onAuthenticated(session);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const session = await api.signupUser({
        full_name: signupName,
        email: signupEmail,
        password: signupPassword,
        organization_name: signupOrg,
        gcp_project_id: signupProject,
        role: signupRole,
      });
      onAuthenticated(session);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    if (role === 'DATA_GOVERNANCE_APPROVER')
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (role === 'GCP_PARTNER_ADMIN')
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (role === 'DATA_ENGINEER')
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060a14]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-blue-500/30 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#0f1c3f] via-[#152852] to-[#0f172a] px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a73e8] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Google Cloud Identity Platform &amp; IAP Zero-Trust Access Gate
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OIDC / SAML 2.0 / IAM RBAC
                </span>
              </div>
              <p className="text-xs text-slate-300">
                DataTrust AI — Autonomous Data Quality &amp; Incident Resolution Engineer
              </p>
            </div>
          </div>

          {currentSession && onCloseIfAuthenticated && (
            <button
              onClick={onCloseIfAuthenticated}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Return to Console ✕
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 bg-slate-900/70 border-b border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setMode('sso');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'sso'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. Google Cloud / Workspace SSO (Instant Personas)
          </button>

          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'login'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            2. Corporate Email &amp; Password Sign-In
          </button>

          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'signup'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            3. Sign Up / Onboard New GCP Organization
          </button>

          <button
            onClick={() => {
              setMode('architecture');
              setErrorMsg(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'architecture'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            4. How Production GCP Security &amp; RBAC Works
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-rose-950/50 border border-rose-500/50 rounded-xl p-3.5 text-xs text-rose-200 font-medium">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: GOOGLE CLOUD SSO PERSONAS */}
          {mode === 'sso' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4 text-xs text-slate-200">
                <strong className="text-blue-300">
                  Google Cloud Identity-Aware Proxy (IAP) &amp; OIDC Single Sign-On:
                </strong>{' '}
                Select any enterprise persona below to authenticate with a signed JWT session and experience DataTrust AI under that exact Google Cloud IAM &amp; RBAC role:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(blueprint?.demo_personas || []).map((p: UserAccount) => (
                  <div
                    key={p.user_id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 flex flex-col justify-between transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-white">{p.full_name}</div>
                          <div className="text-xs font-mono text-blue-400">{p.email}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleColor(
                            p.role
                          )}`}
                        >
                          {p.role}
                        </span>
                      </div>

                      <div className="mt-2.5 text-xs text-slate-300">
                        <strong>Org:</strong> {p.organization_name} ({p.gcp_project_id})
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-slate-400">
                        IAM: {p.gcp_iam_binding}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {p.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleGoogleSSO(p.email)}
                      disabled={loading}
                      className="mt-4 w-full py-2 px-4 rounded-lg bg-[#1a73e8] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      Sign In with Google Cloud SSO as {p.full_name.split(' ')[0]}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CORPORATE EMAIL & PASSWORD LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="max-w-md mx-auto space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">
                  Sign In with Corporate Credentials
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-filled with Principal Data Approver credentials (or use any account you signed up with).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Corporate Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white"
                  required
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-slate-300 font-sans font-semibold">Demo Credentials:</div>
                <div>Approver: sarah.chen@omniretail-gcp.com / DataTrust#2026</div>
                <div>Partner: marcus.vance@radiant-partner.ai / Partner#2026</div>
                <div>Engineer: liam.okafor@omniretail-gcp.com / Engineer#2026</div>
                <div>Viewer: elena.rostova@omniretail-gcp.com / Viewer#2026</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#1a73e8] hover:bg-blue-600 text-white text-xs font-bold shadow-lg"
              >
                {loading ? 'Authenticating...' : 'Sign In & Issue OIDC Session Token'}
              </button>
            </form>
          )}

          {/* TAB 3: SIGN UP / ONBOARD NEW GOOGLE CLOUD ORGANIZATION */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="max-w-xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Onboard Your Google Cloud Organization &amp; Create User Account
                </h3>
                <p className="text-xs text-slate-400">
                  Provisions your isolated tenant workspace, links your Google Cloud Project ID via Workload Identity Federation, and assigns your RBAC governance role.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g., Mohammed Rahman"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work / Google Cloud Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization / Partner Name
                  </label>
                  <input
                    type="text"
                    value={signupOrg}
                    onChange={(e) => setSignupOrg(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Google Cloud Project ID
                  </label>
                  <input
                    type="text"
                    value={signupProject}
                    onChange={(e) => setSignupProject(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assign RBAC Governance Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                  >
                    <option value="DATA_GOVERNANCE_APPROVER">
                      DATA_GOVERNANCE_APPROVER (Full Approve &amp; Deploy Authority)
                    </option>
                    <option value="GCP_PARTNER_ADMIN">
                      GCP_PARTNER_ADMIN (Multi-Client Partner Administrator)
                    </option>
                    <option value="DATA_ENGINEER">
                      DATA_ENGINEER (Investigate, Sandbox Test &amp; Propose PR)
                    </option>
                    <option value="DATA_VIEWER">
                      DATA_VIEWER (Read-Only Executive / BI Analyst)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
              >
                {loading
                  ? 'Provisioning GCP Tenant & Account...'
                  : 'Create Enterprise Account & Sign In'}
              </button>
            </form>
          )}

          {/* TAB 4: PRODUCTION GOOGLE CLOUD SECURITY & RBAC ARCHITECTURE */}
          {mode === 'architecture' && blueprint && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {blueprint.identity_layers.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2"
                  >
                    <div className="text-xs font-bold text-blue-400">{item.layer}</div>
                    <div className="text-[11px] font-mono text-emerald-300">{item.mechanism}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.how_it_works}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold uppercase text-amber-400 mb-2">
                  Separation of Duties: Role-Based Access Control (RBAC) Permission Matrix
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {Object.entries(blueprint.role_permissions_matrix).map(([roleName, perms]) => (
                    <div key={roleName} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="font-bold text-white font-mono text-[11px] mb-2">
                        {roleName}
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
                        {perms.map((p) => (
                          <li key={p} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
