import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { version } from '../../package.json';
import { getConfig } from './config';
import { KnownError } from './error';

const endpoint = 'https://search.parallel.ai/mcp';
const timeoutMs = 15000;
const maxContextLength = 12000;

export type DocumentationSearchOptions = {
  searchQuery?: string;
  searchProvider?: string;
  signal?: AbortSignal;
  visual?: string;
};

/** A literal query is permission to send that query, never the task or code. */
export async function getDocumentationContext(
  options: DocumentationSearchOptions
): Promise<string | undefined> {
  const query = options.searchQuery?.trim();
  if (!query) return;

  const config = await getConfig({
    SEARCH_PROVIDER: options.searchProvider ?? process.env.SEARCH_PROVIDER,
  });
  const provider =
    (options.searchProvider ?? config.SEARCH_PROVIDER) || 'parallel';
  if (provider === 'none') return;
  if (provider !== 'parallel') {
    throw new KnownError('SEARCH_PROVIDER must be parallel or none.');
  }
  if (options.visual) {
    throw new KnownError(
      'Documentation search supports unit test matching only.'
    );
  }
  if (query.length > 2000) {
    throw new KnownError(
      'Documentation search queries must be 2000 characters or fewer.'
    );
  }

  const controller = new AbortController();
  const cancel = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', cancel, { once: true });
  if (options.signal?.aborted) cancel();
  const timer = setTimeout(
    () =>
      controller.abort(
        new Error('Documentation search timed out after 15 seconds.')
      ),
    timeoutMs
  );
  const client = new Client({ name: '@builder.io/micro-agent', version });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    requestInit: {
      headers: {
        'User-Agent': `@builder.io/micro-agent/${version} (+https://github.com/BuilderIO/micro-agent)`,
      },
    },
    fetch: (url, init) => fetch(url, { ...init, signal: controller.signal }),
  });
  const requestOptions = { signal: controller.signal, timeout: timeoutMs };

  try {
    if (controller.signal.aborted) throw controller.signal.reason;
    await client.connect(transport, requestOptions);
    const { tools } = await client.listTools(undefined, requestOptions);
    if (!tools.some((tool) => tool.name === 'web_search')) {
      throw new Error('The MCP server did not offer web_search.');
    }
    const response = await client.callTool(
      {
        name: 'web_search',
        arguments: {
          objective:
            'Find authoritative library/API documentation for: ' + query,
          search_queries: [query],
        },
      },
      undefined,
      requestOptions
    );
    const result = CallToolResultSchema.parse(response);
    const text = result.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n');
    if (result.isError)
      throw new Error(text.slice(0, 500) || 'MCP tool error.');
    if (!text.trim())
      throw new Error('The MCP server returned no documentation text.');
    return text.slice(0, maxContextLength);
  } catch (error) {
    const reason = controller.signal.aborted ? controller.signal.reason : error;
    throw new KnownError(
      'Documentation search failed: ' +
        (reason instanceof Error ? reason.message : String(reason))
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', cancel);
    controller.abort();
    await client.close().catch(() => undefined);
  }
}
