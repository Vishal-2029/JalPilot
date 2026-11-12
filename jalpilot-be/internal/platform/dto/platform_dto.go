package dto

import "github.com/google/uuid"

type CreateTenantRequest struct {
	CompanyName string `json:"company_name" validate:"required,min=2,max=150"`
	Slug        string `json:"slug" validate:"required,min=2,max=80"`
	Email       string `json:"email" validate:"required,email"`
	Phone       string `json:"phone" validate:"required,min=8,max=20"`
	City        string `json:"city"`
	State       string `json:"state"`
	AdminName   string `json:"admin_name" validate:"required,min=2,max=150"`
	AdminPass   string `json:"admin_password" validate:"required,min=8,max=128"`
}

type UpdateTenantRequest struct {
	CompanyName *string `json:"company_name"`
	Status      *string `json:"status"`
	City        *string `json:"city"`
	State       *string `json:"state"`
}

type TenantSummary struct {
	ID          uuid.UUID `json:"id"`
	CompanyName string    `json:"company_name"`
	Slug        string    `json:"slug"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	City        string    `json:"city"`
	Status      string    `json:"status"`
	CreatedAt   string    `json:"created_at"`
}

type PlatformDashboard struct {
	TotalCompanies     int64   `json:"total_companies"`
	ActiveCompanies    int64   `json:"active_companies"`
	TrialCompanies     int64   `json:"trial_companies"`
	SuspendedCompanies int64   `json:"suspended_companies"`
	TotalCustomers     int64   `json:"total_customers"`
	TotalRevenue       float64 `json:"total_revenue"`
}

