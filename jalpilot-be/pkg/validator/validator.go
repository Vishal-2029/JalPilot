package validator

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// FieldError represents a single field validation failure.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Validator wraps go-playground/validator for DTO validation.
type Validator struct {
	v *validator.Validate
}

// New creates a configured Validator instance.
func New() *Validator {
	return &Validator{v: validator.New()}
}

// Validate validates a struct and returns structured field errors if invalid.
func (val *Validator) Validate(s any) []FieldError {
	err := val.v.Struct(s)
	if err == nil {
		return nil
	}
	var out []FieldError
	for _, fe := range err.(validator.ValidationErrors) {
		out = append(out, FieldError{
			Field:   strings.ToLower(fe.Field()),
			Message: formatRule(fe),
		})
	}
	return out
}

func formatRule(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "this field is required"
	case "email":
		return "must be a valid email address"
	case "min":
		return fmt.Sprintf("must be at least %s characters", fe.Param())
	case "max":
		return fmt.Sprintf("must be at most %s characters", fe.Param())
	case "uuid":
		return "must be a valid UUID"
	default:
		return fmt.Sprintf("failed validation rule: %s", fe.Tag())
	}
}

