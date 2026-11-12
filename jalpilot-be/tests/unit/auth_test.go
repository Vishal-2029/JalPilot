package unit

import (
	"testing"
	"time"

	"github.com/google/uuid"
	authsvc "github.com/jalpilot/jalpilot-be/internal/auth/service"
	pkgredis "github.com/jalpilot/jalpilot-be/pkg/redis"
	"github.com/jalpilot/jalpilot-be/pkg/validator"
)

func TestArgon2idPasswordHashAndVerify(t *testing.T) {
	pw := "JalPilot#Secure2026"
	hash, err := authsvc.HashPassword(pw)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	ok, err := authsvc.VerifyPassword(pw, hash)
	if err != nil || !ok {
		t.Fatalf("expected password to verify, got ok=%v err=%v", ok, err)
	}
	ok, err = authsvc.VerifyPassword("wrong-password", hash)
	if err != nil || ok {
		t.Fatalf("expected wrong password to fail verification")
	}
}

func TestJWTTokenManager(t *testing.T) {
	tm := authsvc.NewTokenManager("super-secret-test-key-32-chars!!", 15*time.Minute)
	uid := uuid.New()
	tid := uuid.New()

	tok, err := tm.GenerateAccessToken(uid, &tid, "")
	if err != nil {
		t.Fatalf("GenerateAccessToken failed: %v", err)
	}
	claims, err := tm.ParseAccessToken(tok)
	if err != nil {
		t.Fatalf("ParseAccessToken failed: %v", err)
	}
	if claims.UserID != uid {
		t.Fatalf("expected uid %s, got %s", uid, claims.UserID)
	}
	if claims.TenantID == nil || *claims.TenantID != tid {
		t.Fatalf("expected tid %s, got %v", tid, claims.TenantID)
	}

	otherTM := authsvc.NewTokenManager("different-secret-key", 15*time.Minute)
	if _, err := otherTM.ParseAccessToken(tok); err == nil {
		t.Fatalf("expected token signed with different secret to fail")
	}
}

func TestTenantCacheKeyIsolation(t *testing.T) {
	t1 := uuid.New()
	t2 := uuid.New()
	k1 := pkgredis.TenantKey(t1, "theme", "active")
	k2 := pkgredis.TenantKey(t2, "theme", "active")
	if k1 == k2 {
		t.Fatalf("tenant cache keys must not collide: %s", k1)
	}
}

func TestValidator(t *testing.T) {
	type sample struct {
		Email string `validate:"required,email"`
	}
	v := validator.New()
	if errs := v.Validate(sample{Email: "bad-email"}); len(errs) == 0 {
		t.Fatalf("expected validation error for invalid email")
	}
	if errs := v.Validate(sample{Email: "admin@jalpilot.com"}); len(errs) != 0 {
		t.Fatalf("expected no validation error, got %+v", errs)
	}
}

