package dto

import "github.com/google/uuid"

type CreateCustomerRequest struct {
	FullName           string  `json:"full_name" validate:"required,min=2,max=150"`
	Email              string  `json:"email" validate:"omitempty,email"`
	Phone              string  `json:"phone" validate:"required,min=8,max=20"`
	AlternatePhone     string  `json:"alternate_phone"`
	CustomerType       string  `json:"customer_type" validate:"omitempty,oneof=RESIDENTIAL COMMERCIAL CORPORATE"`
	PricingType        string  `json:"pricing_type" validate:"omitempty,oneof=PER_BOTTLE MONTHLY"`
	DefaultPrice       float64 `json:"default_price"`
	InitialBottleBal   int     `json:"initial_bottle_balance"`
	Notes              string  `json:"notes"`
	BuildingName       string  `json:"building_name"`
	FlatOrOfficeNumber string  `json:"flat_or_office_number"`
	AddressLine        string  `json:"address_line" validate:"required,min=3"`
	Area               string  `json:"area"`
	City               string  `json:"city"`
	State              string  `json:"state"`
	PostalCode         string  `json:"postal_code"`
	SendInvite         bool    `json:"send_invite"`
}

type AcceptInvitationRequest struct {
	Token    string `json:"token" validate:"required,min=16"`
	Password string `json:"password" validate:"required,min=8,max=128"`
}

type CustomerListItem struct {
	ID                      uuid.UUID  `json:"id"`
	CustomerCode            string     `json:"customer_code"`
	FullName                string     `json:"full_name"`
	Email                   *string    `json:"email,omitempty"`
	Phone                   string     `json:"phone"`
	CustomerType            string     `json:"customer_type"`
	Status                  string     `json:"status"`
	AccountActivationStatus string     `json:"account_activation_status"`
	PricingType             string     `json:"pricing_type"`
	DefaultPrice            float64    `json:"default_price"`
	UserID                  *uuid.UUID `json:"user_id,omitempty"`
	CreatedAt               string     `json:"created_at"`
}

