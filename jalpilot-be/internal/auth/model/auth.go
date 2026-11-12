package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID              uuid.UUID
	FullName        string
	Email           *string
	NormalizedEmail *string
	Phone           *string
	NormalizedPhone *string
	PasswordHash    string
	AccountStatus   string
	CreatedAt       time.Time
}

type Session struct {
	ID               uuid.UUID
	UserID           uuid.UUID
	RefreshTokenHash string
	ExpiresAt        time.Time
	RevokedAt        *time.Time
	CreatedAt        time.Time
}

