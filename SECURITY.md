# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Model

- **Zero-PII Agent Context**: `muse-commerce-mcp` never accepts or transmits shopper payment card details, home street addresses, or personal contact credentials inside LLM tool parameters.
- **Non-Custodial Checkout**: All order reservations return a direct merchant checkout URL where payment is processed directly by the merchant's linked Stripe or PayPal gateway.

## Reporting a Vulnerability

If you discover a security issue in `muse-commerce-mcp` or the AisleNode Protocol, please report it privately to **`aislenode@soltrixstudios.com`**. We respond to security reports within 24 hours.
