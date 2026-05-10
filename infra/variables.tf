variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "homebase-rg"
}

variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique, alphanumeric)"
  type        = string
  default     = "homebaseacr"
}

variable "postgresql_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "homebaseadmin"
}

variable "postgresql_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "app_service_plan_sku" {
  description = "SKU for the App Service plan (B2 for dev, P2v3 for prod)"
  type        = string
  default     = "B2"
}

variable "environment" {
  description = "Deployment environment tag"
  type        = string
  default     = "prod"
}
