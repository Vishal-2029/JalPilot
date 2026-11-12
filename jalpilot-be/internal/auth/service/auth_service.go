package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jalpilot/jalpilot-be/internal/auth/dto"
	"github.com/jalpilot/jalpilot-be/internal/auth/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountSuspended   = errors.New("account is suspended")
)

type AuthResult struct {
	User         dto.AuthUserResponse
	AccessToken  string
	RefreshToken string
}

type AuthService struct {
	repo       *repository.AuthRepository
	tokens     *TokenManager
	refreshTTL time.Duration
}

func NewAuthService(repo *repository.AuthRepository, tokens *TokenManager, refreshTTL time.Duration) *AuthService {
	return &AuthService{
		repo:       repo,
		tokens:     tokens,
		refreshTTL: refreshTTL,
	}
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*AuthResult, error) {
	u, err := s.repo.FindUserByIdentifier(ctx, req.Identifier)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}
	if u.AccountStatus == "SUSPENDED" {
		return nil, ErrAccountSuspended
	}
	ok, err := VerifyPassword(req.Password, u.PasswordHash)
	if err != nil || !ok {
		return nil, ErrInvalidCredentials
	}

	tenantID, platformRole, err := s.repo.GetUserContext(ctx, u.ID)
	if err != nil {
		return nil, err
	}

	return s.issueTokens(ctx, u.ID, u.FullName, u.Email, u.Phone, tenantID, platformRole)
}

func (s *AuthService) RegisterCompany(ctx context.Context, req dto.RegisterCompanyRequest) (*AuthResult, error) {
	hash, err := HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	tenantID, userID, err := s.repo.RegisterCompanyWorkspace(
		ctx, req.CompanyName, req.Slug, req.FullName, req.Email, req.Phone, hash, req.PlanCode,
	)
	if err != nil {
		return nil, err
	}
	email := req.Email
	phone := req.Phone
	return s.issueTokens(ctx, userID, req.FullName, &email, &phone, &tenantID, "")
}

func (s *AuthService) Refresh(ctx context.Context, rawRefreshToken string) (*AuthResult, error) {
	oldHash := HashToken(rawRefreshToken)
	newRaw, newHash, err := GenerateSecureToken(32)
	if err != nil {
		return nil, err
	}
	userID, err := s.repo.RotateSession(ctx, oldHash, newHash, time.Now().UTC().Add(s.refreshTTL))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	tenantID, platformRole, err := s.repo.GetUserContext(ctx, userID)
	if err != nil {
		return nil, err
	}
	access, err := s.tokens.GenerateAccessToken(userID, tenantID, platformRole)
	if err != nil {
		return nil, err
	}
	return &AuthResult{
		User: dto.AuthUserResponse{
			ID:           userID,
			TenantID:     tenantID,
			PlatformRole: platformRole,
		},
		AccessToken:  access,
		RefreshToken: newRaw,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, rawRefreshToken string) error {
	if rawRefreshToken == "" {
		return nil
	}
	return s.repo.RevokeSession(ctx, HashToken(rawRefreshToken))
}

func (s *AuthService) issueTokens(ctx context.Context, userID uuid.UUID, fullName string, email, phone *string, tenantID *uuid.UUID, platformRole string) (*AuthResult, error) {
	access, err := s.tokens.GenerateAccessToken(userID, tenantID, platformRole)
	if err != nil {
		return nil, err
	}
	rawRefresh, hashRefresh, err := GenerateSecureToken(32)
	if err != nil {
		return nil, err
	}
	if err := s.repo.CreateSession(ctx, userID, hashRefresh, time.Now().UTC().Add(s.refreshTTL)); err != nil {
		return nil, err
	}
	return &AuthResult{
		User: dto.AuthUserResponse{
			ID:           userID,
			FullName:     fullName,
			Email:        email,
			Phone:        phone,
			TenantID:     tenantID,
			PlatformRole: platformRole,
		},
		AccessToken:  access,
		RefreshToken: rawRefresh,
	}, nil
}

