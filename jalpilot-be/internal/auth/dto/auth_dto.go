package dto

import "github.com/google/uuid"

type LoginRequest struct {
	Identifier string `json:"identifier" validate:"required,min=3,max=255"`
	Password   string `json:"password" validate:"required,min=6,max=128"`
}

type RegisterCompanyRequest struct {
	CompanyName string `json:"company_name" validate:"required,min=2,max=150"`
	Slug        string `json:"slug" validate:"required,min=2,max=80"`
	FullName    string `json:"full_name" validate:"required,min=2,max=150"`
	Email       string `json:"email" validate:"required,email"`
	Phone       string `json:"phone" validate:"required,min=8,max=20"`
	Password    string `json:"password" validate:"required,min=8,max=128"`
	PlanCode    string `json:"plan_code"`
}

type AuthUserResponse struct {
	ID           uuid.UUID  `json:"id"`
	FullName     string     `json:"full_name"`
	Email        *string    `json:"email,omitempty"`
	Phone        *string    `json:"phone,omitempty"`
	TenantID     *uuid.UUID `json:"tenant_id,omitempty"`
	PlatformRole string     `json:"platform_role,omitempty"`
}

