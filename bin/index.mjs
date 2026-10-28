#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const ENDPOINT =
  process.env.AISLENODE_MCP_ENDPOINT ||
  'https://aislenode.soltrixstudios.com/api/mcp';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
muse-commerce-mcp v1.0.0
Open-source MCP bridge connecting Meta Muse, Llama, and Claude agents to local physical store shelves.

Hosted Protocol Endpoint: ${ENDPOINT}
Storefront Portal:        https://aislenode.soltrixstudios.com

Usage:
  npx -y muse-commerce-mcp

Environment Variables:
  AISLENODE_MCP_ENDPOINT  Override the default AisleNode protocol endpoint
`);
  process.exit(0);
}

const server = new Server(
  {
    name: 'muse-commerce-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function callProtocol(action, params) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'muse-commerce-mcp/1.0.0',
    },
    body: JSON.stringify({ action, params }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : JSON.stringify(data.error || 'Protocol request failed')
    );
  }
  return data;
}

export const TOOLS = [
  {
    name: 'search_catalog',
    description:
      'Search real-time physical retail store inventories near a shopper’s GPS location. Returns verified brick-and-mortar stores, in-stock products, unit prices, and Haversine distance in kilometers.',
    annotations: {
      title: 'Search Local Store Catalog',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Product name, category, or keyword (e.g. "coffee", "milk", "usb cable")',
        },
        customer_lat: {
          type: 'number',
          description: 'Shopper latitude coordinate for proximity ranking (optional)',
        },
        customer_lng: {
          type: 'number',
          description: 'Shopper longitude coordinate for proximity ranking (optional)',
        },
        max_distance_km: {
          type: 'number',
          description: 'Maximum search radius in kilometers (default: 15)',
          default: 15,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of matching products to return (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_order',
    description:
      'Reserve in-stock items at a local physical store and generate a zero-PII, non-custodial checkout URL. The shopper completes payment and delivery details directly on the verified merchant checkout page.',
    annotations: {
      title: 'Create Local Order Reservation',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        store_id: {
          type: 'string',
          description: 'UUID of the verified physical store',
        },
        items: {
          type: 'array',
          description: 'Array of products and quantities to reserve',
          items: {
            type: 'object',
            properties: {
              product_id: {
                type: 'string',
                description: 'UUID of the product from search_catalog',
              },
              qty: {
                type: 'number',
                description: 'Quantity to order (positive integer)',
              },
            },
            required: ['product_id', 'qty'],
          },
        },
        agent_source: {
          type: 'string',
          description: 'Identifier of the calling AI agent (e.g. "meta_muse", "claude_desktop")',
          default: 'meta_muse',
        },
      },
      required: ['store_id', 'items'],
    },
  },
  {
    name: 'check_order_status',
    description:
      'Check live fulfillment, payment, and courier dispatch status for an existing local retail order.',
    annotations: {
      title: 'Check Order Fulfillment Status',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'UUID of the order to inspect',
        },
      },
      required: ['order_id'],
    },
  },
  {
    name: 'report_store',
    description:
      'Submit an autonomous trust-and-safety violation report if a store exhibits deceptive pricing, phantom stock, or invalid coordinates.',
    annotations: {
      title: 'Report Store Policy Violation',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        store_id: {
          type: 'string',
          description: 'UUID of the store being reported',
        },
        category: {
          type: 'string',
          enum: [
            'illegal_goods',
            'deceptive_pricing',
            'fake_location',
            'harassment',
            'other',
          ],
          description: 'Violation category',
        },
        details: {
          type: 'string',
          description: 'Detailed explanation of the discrepancy observed by the agent or user',
        },
        agent_source: {
          type: 'string',
          description: 'Identifier of the reporting AI agent',
          default: 'meta_muse',
        },
      },
      required: ['store_id', 'category', 'details'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await callProtocol(name, args || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `AisleNode MCP Error: ${error.message}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.mjs')) {
  main().catch((err) => {
    console.error('Fatal error starting muse-commerce-mcp:', err);
    process.exit(1);
  });
}
