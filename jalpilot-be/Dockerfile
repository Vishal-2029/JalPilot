FROM golang:1.27-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git ca-certificates
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /jalpilot-api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -o /jalpilot-worker ./cmd/worker

FROM alpine:3.21
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata
COPY --from=builder /jalpilot-api /app/jalpilot-api
COPY --from=builder /jalpilot-worker /app/jalpilot-worker
COPY --from=builder /app/migrations /app/migrations
EXPOSE 8080
CMD ["/app/jalpilot-api"]

