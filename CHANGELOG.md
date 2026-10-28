# Changelog

All notable changes to `muse-commerce-mcp` are documented in this file.

## [1.0.1] - 2026-10-28

### Added
- Explicit MCP safety annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) across all 4 tools.
- Automated unit test suite (`test/server.test.mjs`) and GitHub Actions CI workflow.
- `PRIVACY.md` and `SECURITY.md` documentation for agentic directory compliance.
- M8ven Verified badge in `README.md`.

### Changed
- Removed unused `zod` dependency from client bridge to maintain a minimal, zero-advisory dependency tree.

## [1.0.0] - 2026-10-24

### Added
- Initial release of `muse-commerce-mcp` connecting Meta Muse, Llama, and Claude agents to the AisleNode Protocol (`search_catalog`, `create_order`, `check_order_status`, `report_store`).
- Official MCP Registry `server.json` manifest (`io.github.marvo-bd/muse-commerce-mcp`).
- Containerized `Dockerfile` and `smithery.yaml` configuration.
