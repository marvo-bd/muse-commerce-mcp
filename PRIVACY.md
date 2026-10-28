# Privacy Policy

`muse-commerce-mcp` is an open-source Model Context Protocol (MCP) bridge connecting AI assistants to the [AisleNode Protocol](https://aislenode.soltrixstudios.com).

## Zero-PII Agent Design

1. **No Personal Data in LLM Context**: `search_catalog`, `create_order`, `check_order_status`, and `report_store` do not require or collect shopper names, email addresses, phone numbers, home street addresses, or payment card details inside the MCP tool arguments.
2. **Ephemeral Proximity Coordinates**: Optional latitude and longitude coordinates passed to `search_catalog` are used solely in memory to compute Haversine distance to verified retail stores and are not linked to user identities.
3. **Direct Merchant Checkout**: When `create_order` reserves stock, it returns a checkout URL hosted at `https://aislenode.soltrixstudios.com/checkout/[order_id]`, where the shopper completes payment directly with the merchant via Stripe or PayPal.

Full platform privacy policy: [https://aislenode.soltrixstudios.com/privacy](https://aislenode.soltrixstudios.com/privacy)
Contact: `aislenode@soltrixstudios.com`
