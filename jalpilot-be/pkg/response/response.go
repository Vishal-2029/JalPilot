package response

import "github.com/gofiber/fiber/v2"

// Meta holds pagination metadata for list responses.
type Meta struct {
	Page       int    `json:"page,omitempty"`
	Limit      int    `json:"limit,omitempty"`
	Total      int64  `json:"total,omitempty"`
	NextCursor string `json:"next_cursor,omitempty"`
}

// ErrorDetail describes a structured API error.
type ErrorDetail struct {
	Code    string `json:"code"`
	Details any    `json:"details,omitempty"`
}

// Envelope is the standard API response wrapper across JalPilot.
type Envelope struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Data    any          `json:"data,omitempty"`
	Meta    *Meta        `json:"meta,omitempty"`
	Error   *ErrorDetail `json:"error,omitempty"`
}

// OK sends a 200 JSON response.
func OK(c *fiber.Ctx, message string, data any) error {
	return c.Status(fiber.StatusOK).JSON(Envelope{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Created sends a 201 JSON response.
func Created(c *fiber.Ctx, message string, data any) error {
	return c.Status(fiber.StatusCreated).JSON(Envelope{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Paginated sends a 200 JSON response with pagination metadata.
func Paginated(c *fiber.Ctx, message string, data any, meta Meta) error {
	return c.Status(fiber.StatusOK).JSON(Envelope{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    &meta,
	})
}

// Fail sends an error JSON response with the given HTTP status and error code.
func Fail(c *fiber.Ctx, status int, code, message string, details any) error {
	return c.Status(status).JSON(Envelope{
		Success: false,
		Message: message,
		Error: &ErrorDetail{
			Code:    code,
			Details: details,
		},
	})
}

