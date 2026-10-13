from __future__ import annotations
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class UserRole(str, Enum):
    DATA_VIEWER = "DATA_VIEWER"
    DATA_ENGINEER = "DATA_ENGINEER"
    DATA_GOVERNANCE_APPROVER = "DATA_GOVERNANCE_APPROVER"
    GCP_PARTNER_ADMIN = "GCP_PARTNER_ADMIN"


class AuthProviderType(str, Enum):
    GOOGLE_CLOUD_IAP_OIDC = "GOOGLE_CLOUD_IAP_OIDC"
    GOOGLE_WORKSPACE_SSO = "GOOGLE_WORKSPACE_SSO"
    SAML_OKTA_ENTRA = "SAML_OKTA_ENTRA"
    CORPORATE_EMAIL_MFA = "CORPORATE_EMAIL_MFA"


class UserAccount(BaseModel):
    user_id: str
    email: str
    full_name: str
    organization_name: str
    gcp_project_id: str
    tenant_id: str
    role: UserRole
    gcp_iam_binding: str
    auth_provider: AuthProviderType
    mfa_verified: bool = True
    permissions: List[str]
    created_at: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    organization_name: str
    gcp_project_id: str
    role: UserRole = UserRole.DATA_GOVERNANCE_APPROVER


class GoogleSSORequest(BaseModel):
    persona_email: str = "sarah.chen@omniretail-gcp.com"


class AuthSessionResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in_seconds: int = 28800
    iap_jwt_header_simulated: str
    user: UserAccount


ROLE_PERMISSIONS: Dict[UserRole, List[str]] = {
    UserRole.DATA_VIEWER: [
        "incidents:read",
        "lineage:read",
        "analytics:query_readonly",
        "audit:read",
    ],
    UserRole.DATA_ENGINEER: [
        "incidents:read",
        "lineage:read",
        "analytics:query_readonly",
        "sandbox:verify_sql",
        "repair:propose_and_generate_pr",
        "webhooks:simulate",
        "audit:read",
    ],
    UserRole.DATA_GOVERNANCE_APPROVER: [
        "incidents:read",
        "lineage:read",
        "analytics:query_readonly",
        "sandbox:verify_sql",
        "repair:propose_and_generate_pr",
        "governance:approve_and_deploy",
        "governance:rollback",
        "connectors:manage",
        "webhooks:simulate",
        "audit:read",
    ],
    UserRole.GCP_PARTNER_ADMIN: [
        "incidents:read",
        "lineage:read",
        "analytics:query_readonly",
        "sandbox:verify_sql",
        "repair:propose_and_generate_pr",
        "governance:approve_and_deploy",
        "governance:rollback",
        "connectors:manage",
        "tenants:multi_client_switch",
        "webhooks:simulate",
        "audit:read",
    ],
}

ROLE_IAM_BINDINGS: Dict[UserRole, str] = {
    UserRole.DATA_VIEWER: "roles/bigquery.metadataViewer + roles/dataplex.viewer",
    UserRole.DATA_ENGINEER: "roles/bigquery.jobUser + roles/dataplex.dataReader + roles/cloudsql.client",
    UserRole.DATA_GOVERNANCE_APPROVER: "roles/dataplex.dataOwner + roles/bigquery.dataEditor (Approval Gate)",
    UserRole.GCP_PARTNER_ADMIN: "roles/iam.workloadIdentityUser + roles/dataplex.admin (Multi-Tenant Partner)",
}


def _hash_password(password: str) -> str:
    return hashlib.sha256(f"datatrust-salt:{password}".encode("utf-8")).hexdigest()


# Pre-seeded Enterprise SSO & RBAC Accounts
USERS_BY_EMAIL: Dict[str, Dict[str, Any]] = {
    "sarah.chen@omniretail-gcp.com": {
        "password_hash": _hash_password("DataTrust#2026"),
        "account": UserAccount(
            user_id="usr-approver-01",
            email="sarah.chen@omniretail-gcp.com",
            full_name="Sarah Chen",
            organization_name="OmniRetail UK & EMEA Group",
            gcp_project_id="gcp-omniretail-prod-eu-west2",
            tenant_id="tenant-retail-uk",
            role=UserRole.DATA_GOVERNANCE_APPROVER,
            gcp_iam_binding=ROLE_IAM_BINDINGS[UserRole.DATA_GOVERNANCE_APPROVER],
            auth_provider=AuthProviderType.GOOGLE_CLOUD_IAP_OIDC,
            mfa_verified=True,
            permissions=ROLE_PERMISSIONS[UserRole.DATA_GOVERNANCE_APPROVER],
            created_at="2026-09-01T08:00:00Z",
        ),
    },
    "marcus.vance@radiant-partner.ai": {
        "password_hash": _hash_password("Partner#2026"),
        "account": UserAccount(
            user_id="usr-partner-02",
            email="marcus.vance@radiant-partner.ai",
            full_name="Marcus Vance (GCP Partner Architect)",
            organization_name="Radiant Digital & Altimate GCP Partner Practice",
            gcp_project_id="all-partner-client-projects",
            tenant_id="all",
            role=UserRole.GCP_PARTNER_ADMIN,
            gcp_iam_binding=ROLE_IAM_BINDINGS[UserRole.GCP_PARTNER_ADMIN],
            auth_provider=AuthProviderType.GOOGLE_WORKSPACE_SSO,
            mfa_verified=True,
            permissions=ROLE_PERMISSIONS[UserRole.GCP_PARTNER_ADMIN],
            created_at="2026-09-05T10:30:00Z",
        ),
    },
    "liam.okafor@omniretail-gcp.com": {
        "password_hash": _hash_password("Engineer#2026"),
        "account": UserAccount(
            user_id="usr-engineer-03",
            email="liam.okafor@omniretail-gcp.com",
            full_name="Liam Okafor (Senior Analytics Engineer)",
            organization_name="OmniRetail UK & EMEA Group",
            gcp_project_id="gcp-omniretail-prod-eu-west2",
            tenant_id="tenant-retail-uk",
            role=UserRole.DATA_ENGINEER,
            gcp_iam_binding=ROLE_IAM_BINDINGS[UserRole.DATA_ENGINEER],
            auth_provider=AuthProviderType.GOOGLE_WORKSPACE_SSO,
            mfa_verified=True,
            permissions=ROLE_PERMISSIONS[UserRole.DATA_ENGINEER],
            created_at="2026-09-12T09:15:00Z",
        ),
    },
    "elena.rostova@omniretail-gcp.com": {
        "password_hash": _hash_password("Viewer#2026"),
        "account": UserAccount(
            user_id="usr-viewer-04",
            email="elena.rostova@omniretail-gcp.com",
            full_name="Elena Rostova (VP Finance & BI Viewer)",
            organization_name="OmniRetail UK & EMEA Group",
            gcp_project_id="gcp-omniretail-prod-eu-west2",
            tenant_id="tenant-retail-uk",
            role=UserRole.DATA_VIEWER,
            gcp_iam_binding=ROLE_IAM_BINDINGS[UserRole.DATA_VIEWER],
            auth_provider=AuthProviderType.SAML_OKTA_ENTRA,
            mfa_verified=True,
            permissions=ROLE_PERMISSIONS[UserRole.DATA_VIEWER],
            created_at="2026-09-15T14:00:00Z",
        ),
    },
}

ACTIVE_SESSIONS: Dict[str, UserAccount] = {}


def _issue_session(user: UserAccount) -> AuthSessionResponse:
    raw_token = f"dt_gcp_jwt_{secrets.token_urlsafe(24)}"
    ACTIVE_SESSIONS[raw_token] = user
    iap_header = f"accounts.google.com:{user.user_id}:{user.email}"
    return AuthSessionResponse(
        access_token=raw_token,
        iap_jwt_header_simulated=iap_header,
        user=user,
    )


def login_with_email_password(req: LoginRequest) -> AuthSessionResponse:
    email_key = req.email.strip().lower()
    record = USERS_BY_EMAIL.get(email_key)
    if not record:
        raise ValueError(f"No enterprise account found for '{req.email}'. Use Google Cloud SSO or Sign Up.")
    expected_hash = record["password_hash"]
    if not hmac.compare_digest(expected_hash, _hash_password(req.password)):
        raise ValueError("Invalid password for enterprise account.")
    return _issue_session(record["account"])


def login_with_google_sso(req: GoogleSSORequest) -> AuthSessionResponse:
    email_key = req.persona_email.strip().lower()
    record = USERS_BY_EMAIL.get(email_key)
    if not record:
        # Dynamically provision Google Workspace OIDC account if custom email
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        user = UserAccount(
            user_id=f"usr-sso-{len(USERS_BY_EMAIL) + 1}",
            email=email_key,
            full_name=email_key.split("@")[0].replace(".", " ").title(),
            organization_name="Google Cloud Enterprise Customer",
            gcp_project_id="gcp-omniretail-prod-eu-west2",
            tenant_id="tenant-retail-uk",
            role=UserRole.DATA_GOVERNANCE_APPROVER,
            gcp_iam_binding=ROLE_IAM_BINDINGS[UserRole.DATA_GOVERNANCE_APPROVER],
            auth_provider=AuthProviderType.GOOGLE_WORKSPACE_SSO,
            mfa_verified=True,
            permissions=ROLE_PERMISSIONS[UserRole.DATA_GOVERNANCE_APPROVER],
            created_at=now_str,
        )
        USERS_BY_EMAIL[email_key] = {"password_hash": _hash_password("sso-oidc"), "account": user}
        return _issue_session(user)
    return _issue_session(record["account"])


def signup_enterprise_user(req: SignupRequest) -> AuthSessionResponse:
    email_key = req.email.strip().lower()
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    user = UserAccount(
        user_id=f"usr-custom-{len(USERS_BY_EMAIL) + 1}",
        email=email_key,
        full_name=req.full_name.strip(),
        organization_name=req.organization_name.strip(),
        gcp_project_id=req.gcp_project_id.strip(),
        tenant_id="all" if req.role == UserRole.GCP_PARTNER_ADMIN else "tenant-retail-uk",
        role=req.role,
        gcp_iam_binding=ROLE_IAM_BINDINGS[req.role],
        auth_provider=AuthProviderType.CORPORATE_EMAIL_MFA,
        mfa_verified=True,
        permissions=ROLE_PERMISSIONS[req.role],
        created_at=now_str,
    )
    USERS_BY_EMAIL[email_key] = {
        "password_hash": _hash_password(req.password),
        "account": user,
    }
    return _issue_session(user)


def get_google_cloud_auth_blueprint() -> Dict[str, Any]:
    return {
        "identity_layers": [
            {
                "layer": "1. Perimeter & Single Sign-On (Google Cloud IAP & Identity Platform)",
                "mechanism": "Identity-Aware Proxy (IAP) + Google Cloud Identity Platform (OIDC / SAML 2.0)",
                "how_it_works": (
                    "In production on Cloud Run or GKE, Google Cloud IAP sits in front of the HTTPS Load Balancer. "
                    "Unauthenticated requests are blocked at Google's edge before reaching the frontend container. "
                    "Users sign in via Google Workspace, Microsoft Entra ID (Azure AD), or Okta SAML SSO."
                ),
            },
            {
                "layer": "2. Application RBAC & Separation of Duties",
                "mechanism": "Signed JWT Claims + 4 Enterprise RBAC Personas",
                "how_it_works": (
                    "Every API request carries a signed JWT assertion (`X-Goog-IAP-JWT-Assertion` / Bearer Token). "
                    "Data Viewers can query read-only analytics; Data Engineers can synthesize and test fixes in the 5-Gate Sandbox; "
                    "only Data Governance Approvers (`roles/dataplex.dataOwner`) can approve production deployments or rollbacks."
                ),
            },
            {
                "layer": "3. Keyless Database Authorization (Workload Identity Federation)",
                "mechanism": "Google Cloud IAM Service Account Impersonation (Zero Static Passwords)",
                "how_it_works": (
                    "Users never enter raw database passwords. Once authenticated, the DataTrust AI backend assumes a "
                    "tenant-scoped, least-privilege IAM Service Account (`datatrust-agent-ro@project.iam.gserviceaccount.com`) "
                    "using short-lived OAuth 2.0 tokens."
                ),
            },
        ],
        "demo_personas": [u["account"] for u in USERS_BY_EMAIL.values()],
        "role_permissions_matrix": {role.value: perms for role, perms in ROLE_PERMISSIONS.items()},
    }
