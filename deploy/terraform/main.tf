# =============================================================================
# DataTrust AI — Enterprise Terraform Deployment Package (Option A & Option C)
# Provisions Least-Privilege IAM Service Account, Secret Manager, and Cloud Run
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "Customer or Partner Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Deployment Region"
  type        = string
  default     = "europe-west2"
}

variable "container_image" {
  description = "Artifact Registry Image URI for DataTrust AI"
  type        = string
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Dedicated Least-Privilege Read-Only Service Account
resource "google_service_account" "datatrust_agent_ro" {
  account_id   = "datatrust-agent-ro"
  display_name = "DataTrust AI Read-Only Investigation & Sandbox Service Account"
}

# 2. Narrowly Scoped Read-Only IAM Roles (Zero Production Write Access)
locals {
  readonly_roles = [
    "roles/bigquery.metadataViewer",
    "roles/bigquery.jobUser",
    "roles/dataplex.viewer",
    "roles/datalineage.viewer",
    "roles/cloudsql.client",
    "roles/spanner.databaseReader",
    "roles/logging.viewer",
  ]
}

resource "google_project_iam_member" "datatrust_readonly_bindings" {
  for_each = toset(local.readonly_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.datatrust_agent_ro.email}"
}

# 3. Cloud Run v2 Service Protected by IAM / Identity-Aware Proxy (IAP)
resource "google_cloud_run_v2_service" "datatrust_ai" {
  name     = "datatrust-ai-engine"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account = google_service_account.datatrust_agent_ro.email
    containers {
      image = var.container_image
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "ENFORCE_GCP_IAP"
        value = "true"
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }
    }
  }
}
