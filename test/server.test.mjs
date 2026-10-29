import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, executeTool } from '../bin/index.mjs';

function createMockFetch(mockPayload) {
  return async (url, options) => {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        success: true,
        action: body.action,
        params: body.params,
        ...mockPayload,
      }),
    };
  };
}

test('search_catalog tool schema, annotations, and execution', async () => {
  const tool = TOOLS.find((t) => t.name === 'search_catalog');
  assert.ok(tool, 'search_catalog must be registered');
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.equal(tool.annotations.destructiveHint, false);
  assert.equal(tool.annotations.idempotentHint, true);
  assert.equal(tool.annotations.openWorldHint, true);
  assert.deepEqual(tool.inputSchema.required, ['query']);

  const res = await executeTool(
    'search_catalog',
    { query: 'coffee', customer_lat: 37.7749, customer_lng: -122.4194 },
    createMockFetch({ results: [] })
  );
  assert.equal(res.action, 'search_catalog');
  assert.equal(res.params.query, 'coffee');
});

test('create_order tool schema, annotations, and execution', async () => {
  const tool = TOOLS.find((t) => t.name === 'create_order');
  assert.ok(tool, 'create_order must be registered');
  assert.equal(tool.annotations.readOnlyHint, false);
  assert.equal(tool.annotations.destructiveHint, false);
  assert.equal(tool.annotations.idempotentHint, false);
  assert.equal(tool.annotations.openWorldHint, true);
  assert.deepEqual(tool.inputSchema.required, ['store_id', 'items']);

  const res = await executeTool(
    'create_order',
    {
      store_id: '00000000-0000-0000-0000-000000000001',
      items: [{ product_id: '00000000-0000-0000-0000-000000000002', qty: 1 }],
    },
    createMockFetch({ order_id: '00000000-0000-0000-0000-000000000099' })
  );
  assert.equal(res.action, 'create_order');
  assert.equal(res.order_id, '00000000-0000-0000-0000-000000000099');
});

test('check_order_status tool schema, annotations, and execution', async () => {
  const tool = TOOLS.find((t) => t.name === 'check_order_status');
  assert.ok(tool, 'check_order_status must be registered');
  assert.equal(tool.annotations.readOnlyHint, true);
  assert.equal(tool.annotations.destructiveHint, false);
  assert.equal(tool.annotations.idempotentHint, true);
  assert.equal(tool.annotations.openWorldHint, true);
  assert.deepEqual(tool.inputSchema.required, ['order_id']);

  const res = await executeTool(
    'check_order_status',
    { order_id: '00000000-0000-0000-0000-000000000099' },
    createMockFetch({ status: 'PAID' })
  );
  assert.equal(res.action, 'check_order_status');
  assert.equal(res.status, 'PAID');
});

test('report_store tool schema, annotations, and execution', async () => {
  const tool = TOOLS.find((t) => t.name === 'report_store');
  assert.ok(tool, 'report_store must be registered');
  assert.equal(tool.annotations.readOnlyHint, false);
  assert.equal(tool.annotations.destructiveHint, false);
  assert.equal(tool.annotations.idempotentHint, false);
  assert.equal(tool.annotations.openWorldHint, true);
  assert.deepEqual(tool.inputSchema.required, ['store_id', 'category', 'details']);

  const res = await executeTool(
    'report_store',
    {
      store_id: '00000000-0000-0000-0000-000000000001',
      category: 'deceptive_pricing',
      details: 'Listed price did not match shelf price',
    },
    createMockFetch({ report_status: 'OPEN' })
  );
  assert.equal(res.action, 'report_store');
  assert.equal(res.report_status, 'OPEN');
});
