package service

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// AccessClaims defines the JWT payload for JalPilot access tokens.
type AccessClaims struct {
	UserID       uuid.UUID  `json:"uid"`
	TenantID     *uuid.UUID `json:"tid,omitempty"`
	PlatformRole string     `json:"prole,omitempty"`
	jwt.RegisteredClaims
}

// TokenManager issues and validates short-lived JWT access tokens.
type TokenManager struct {
	secret []byte
	ttl    time.Duration
}

// NewTokenManager creates a TokenManager.
func NewTokenManager(secret string, ttl time.Duration) *TokenManager {
	return &TokenManager{
		secret: []byte(secret),
		ttl:    ttl,
	}
}

// GenerateAccessToken signs a new JWT access token.
func (m *TokenManager) GenerateAccessToken(userID uuid.UUID, tenantID *uuid.UUID, platformRole string) (string, error) {
	now := time.Now().UTC()
	claims := AccessClaims{
		UserID:       userID,
		TenantID:     tenantID,
		PlatformRole: platformRole,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.ttl)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

// ParseAccessToken validates a JWT access token and returns its claims.
func (m *TokenManager) ParseAccessToken(tokenStr string) (*AccessClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &AccessClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*AccessClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid access token")
	}
	return claims, nil
}

