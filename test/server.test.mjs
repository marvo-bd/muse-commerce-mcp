import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS } from '../bin/index.mjs';

test('MCP tools declare complete annotations and schemas', () => {
  assert.equal(TOOLS.length, 4);

  for (const tool of TOOLS) {
    assert.ok(tool.name, 'Tool must have a name');
    assert.ok(tool.description, 'Tool must have a description');
    assert.ok(tool.annotations, `Tool ${tool.name} must have annotations`);
    assert.equal(typeof tool.annotations.readOnlyHint, 'boolean');
    assert.equal(typeof tool.annotations.destructiveHint, 'boolean');
    assert.equal(typeof tool.annotations.idempotentHint, 'boolean');
    assert.equal(typeof tool.annotations.openWorldHint, 'boolean');
    assert.equal(tool.inputSchema.type, 'object');
  }
});
