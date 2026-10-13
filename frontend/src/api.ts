import {
  AuditLogEntry,
  DataConnector,
  GovernedAnalyticsResponse,
  Incident,
  OverviewPayload,
  PartnerEcosystemPayload,
} from './types';

const API_BASE = 'http://127.0.0.1:8000/api';

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errBody.detail || `API Error (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getOverview: (tenantId?: string) =>
    requestJson<OverviewPayload>(
      tenantId && tenantId !== 'all' ? `/overview?tenant_id=${encodeURIComponent(tenantId)}` : '/overview'
    ),

  getIncident: (incidentId: string) =>
    requestJson<Incident>(`/incidents/${encodeURIComponent(incidentId)}`),

  verifyIncident: (incidentId: string, customProposedSql?: string, executedBy?: string) =>
    requestJson<Incident>(`/incidents/${encodeURIComponent(incidentId)}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        custom_proposed_sql: customProposedSql || null,
        executed_by: executedBy || 'Principal Data Reliability Engineer',
      }),
    }),

  approveOrManageIncident: (
    incidentId: string,
    action: 'APPROVE_AND_DEPLOY' | 'GENERATE_GIT_PR' | 'ROLLBACK',
    reviewerName: string,
    reviewerRole: string,
    comment: string
  ) =>
    requestJson<Incident>(`/incidents/${encodeURIComponent(incidentId)}/approve`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        reviewer_name: reviewerName,
        reviewer_role: reviewerRole,
        comment,
      }),
    }),

  simulateWebhook: (alertSource: string, gcpDatabase: string, customTitle?: string) =>
    requestJson<Incident>('/incidents/simulate-webhook', {
      method: 'POST',
      body: JSON.stringify({
        alert_source: alertSource,
        gcp_database: gcpDatabase,
        anomaly_type: 'SCHEMA_AND_METRIC_DRIFT',
        custom_title: customTitle || null,
      }),
    }),

  getAnalyticsPresets: () =>
    requestJson<{ id: string; label: string; database: string; question: string }[]>('/analytics/presets'),

  runAnalyticsQuery: (params: { question?: string; custom_sql?: string; target_database?: string }) =>
    requestJson<GovernedAnalyticsResponse>('/analytics/query', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getSandboxCatalog: () =>
    requestJson<{
      sandbox_engine: string;
      tables: { table_name: string; gcp_product: string; role: string; row_count: number; columns: string[] }[];
    }>('/sandbox/catalog'),

  createConnector: (payload: {
    name: string;
    gcp_service: string;
    dialect: string;
    host_or_uri: string;
    auth_mode: string;
    freshness_sla_minutes: number;
  }) =>
    requestJson<DataConnector>('/connectors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  testConnection: (payload: {
    gcp_service: string;
    cloud_provider: string;
    dialect: string;
    host_or_uri: string;
    auth_mode: string;
  }) =>
    requestJson<{
      success: boolean;
      connection_mode: string;
      cloud_provider: string;
      gcp_service: string;
      dialect: string;
      latency_ms: number;
      driver_used: string;
      discovered_schemas: string[];
      discovered_tables_sample: { table: string; rows?: string; status: string }[];
      diagnostic_checks: string[];
      production_setup_hint: string;
    }>('/connectors/test', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAuditLogs: () => requestJson<AuditLogEntry[]>('/audit-logs'),

  getPartnerEcosystem: () => requestJson<PartnerEcosystemPayload>('/partner-ecosystem'),

  getAuthBlueprint: () =>
    requestJson<import('./types').AuthBlueprintPayload>('/auth/blueprint'),

  loginWithGoogleSSO: (personaEmail: string) =>
    requestJson<import('./types').AuthSessionResponse>('/auth/google-sso', {
      method: 'POST',
      body: JSON.stringify({ persona_email: personaEmail }),
    }),

  loginWithEmail: (email: string, password: string) =>
    requestJson<import('./types').AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signupUser: (payload: {
    full_name: string;
    email: string;
    password: string;
    organization_name: string;
    gcp_project_id: string;
    role: string;
  }) =>
    requestJson<import('./types').AuthSessionResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
