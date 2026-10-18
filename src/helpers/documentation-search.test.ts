import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { getConfig, setConfigs } from './config';
import { getDocumentationContext } from './documentation-search';
import { runAll, RunOptions } from './run';

const mocks = vi.hoisted(() => ({
  home: `/tmp/micro-agent-documentation-test-${process.pid}`,
  create: vi.fn(),
  anthropicStream: vi.fn(),
  ollamaChat: vi.fn(),
}));

vi.mock('os', async (importOriginal) => {
  const original = await importOriginal<typeof import('os')>();
  return {
    ...original,
    default: { ...original, homedir: () => mocks.home },
  };
});
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: mocks.create } };
  },
  AzureOpenAI: class {},
}));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { stream: mocks.anthropicStream };
  },
}));
vi.mock('ollama', () => ({ default: { chat: mocks.ollamaChat } }));

const sourceUrl = 'https://docs.example.org/library/api#current';
const documentation = JSON.stringify({
  results: [
    {
      title: 'Library API',
      url: sourceUrl,
      excerpts: ['The current answer is 42.'],
    },
  ],
});
type Rpc = { id?: number; method: string; params?: Record<string, any> };
const requests: { url: string; headers: Headers; rpc?: Rpc }[] = [];
let toolResult: Record<string, unknown>;
let useSse = false;
let hangMethod: string | undefined;

function fixtureFetch() {
  return vi.fn(async (url: any, init?: RequestInit) => {
    const rpc: Rpc | undefined = init?.body
      ? JSON.parse(String(init.body))
      : undefined;
    requests.push({
      url: String(url),
      headers: new Headers(init?.headers),
      rpc,
    });
    if (rpc?.method === hangMethod) {
      return new Promise<Response>((_resolve, reject) => {
        const fail = () => reject(init?.signal?.reason);
        init?.signal?.addEventListener('abort', fail, { once: true });
        if (init?.signal?.aborted) fail();
      });
    }
    if (!rpc) return new Response(null, { status: 405 });
    if (rpc.id === undefined) return new Response(null, { status: 202 });
    const result =
      rpc.method === 'initialize'
        ? {
            protocolVersion: '2025-03-26',
            capabilities: { tools: {} },
            serverInfo: { name: 'fixture', version: '1' },
          }
        : rpc.method === 'tools/list'
        ? {
            tools: [
              {
                name: 'web_search',
                inputSchema: {
                  type: 'object',
                  properties: {
                    objective: { type: 'string' },
                    search_queries: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['objective', 'search_queries'],
                },
              },
            ],
          }
        : toolResult;
    const body = JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result });
    return new Response(useSse ? `event: message\ndata: ${body}\n\n` : body, {
      headers: {
        'Content-Type': useSse ? 'text/event-stream' : 'application/json',
      },
    });
  });
}

beforeAll(async () => {
  await mkdir(mocks.home, { recursive: true });
});
beforeEach(async () => {
  requests.length = 0;
  toolResult = { content: [{ type: 'text', text: documentation }] };
  useSse = false;
  hangMethod = undefined;
  vi.clearAllMocks();
  for (const key of [
    'SEARCH_PROVIDER',
    'MODEL',
    'OPENAI_API_ENDPOINT',
    'OPENAI_KEY',
    'ANTHROPIC_KEY',
    'USE_MOCK_LLM',
    'MOCK_LLM_RECORD_FILE',
    'PARALLEL_API_KEY',
  ]) {
    vi.stubEnv(key, '');
    delete process.env[key];
  }
  await rm(join(mocks.home, '.micro-agent'), { force: true });
  vi.stubGlobal('fetch', fixtureFetch());
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
afterAll(async () => {
  await rm(mocks.home, { recursive: true, force: true });
});

describe('documentation search permission and provider resolution', () => {
  it('defaults fresh approved searches to anonymous Parallel and preserves source URLs', async () => {
    expect((await getConfig()).SEARCH_PROVIDER).toBe('parallel');
    const result = await getDocumentationContext({
      searchQuery: 'library current API',
    });
    expect(result).toContain(sourceUrl);
    expect(requests.map((r) => r.rpc?.method)).toContain('tools/list');
    expect(requests.map((r) => r.rpc?.method)).toContain('tools/call');
    for (const request of requests) {
      expect(request.url).toBe('https://search.parallel.ai/mcp');
      expect(request.headers.get('user-agent')).toMatch(
        /^@builder.io\/micro-agent\//
      );
      expect(request.headers.has('authorization')).toBe(false);
    }
    expect(
      requests.find((r) => r.rpc?.method === 'tools/call')?.rpc?.params
    ).toEqual({
      name: 'web_search',
      arguments: {
        objective:
          'Find authoritative library/API documentation for: library current API',
        search_queries: ['library current API'],
      },
    });
  });

  it.each([undefined, '', '  '])(
    'makes no discovery or network request without an approved query: %s',
    async (searchQuery) => {
      expect(await getDocumentationContext({ searchQuery })).toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
    }
  );

  it('honors saved disable, environment overrides, and per-run overrides without saving query/overrides', async () => {
    await setConfigs([
      ['SEARCH_PROVIDER', 'none'],
      ['MODEL', 'llama3'],
    ]);
    const saved = await readFile(join(mocks.home, '.micro-agent'), 'utf8');
    expect(
      await getDocumentationContext({ searchQuery: 'approved query' })
    ).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
    vi.stubEnv('SEARCH_PROVIDER', 'parallel');
    expect(
      await getDocumentationContext({ searchQuery: 'approved query' })
    ).toContain(sourceUrl);
    vi.stubEnv('SEARCH_PROVIDER', 'none');
    expect(
      await getDocumentationContext({
        searchQuery: 'approved query',
        searchProvider: 'parallel',
      })
    ).toContain(sourceUrl);
    const calls = requests.length;
    vi.stubEnv('SEARCH_PROVIDER', 'parallel');
    expect(
      await getDocumentationContext({
        searchQuery: 'approved query',
        searchProvider: 'none',
      })
    ).toBeUndefined();
    expect(requests).toHaveLength(calls);
    expect(await readFile(join(mocks.home, '.micro-agent'), 'utf8')).toBe(
      saved
    );
    expect((await getConfig()).MODEL).toBe('llama3');
  });

  it.each(['llama3', 'phi3', 'claude', 'gpt-4o'])(
    'does not infer permission from the model or custom endpoint: %s',
    async (model) => {
      await setConfigs([
        ['MODEL', model],
        ['OPENAI_API_ENDPOINT', 'http://localhost:11434/v1'],
      ]);
      expect(await getDocumentationContext({})).toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
      expect(
        await getDocumentationContext({
          searchQuery: 'explicit public docs query',
        })
      ).toContain(sourceUrl);
      expect((await getConfig()).OPENAI_API_ENDPOINT).toBe(
        'http://localhost:11434/v1'
      );
    }
  );

  it('rejects unknown providers, oversized queries and visual search before sending requests', async () => {
    await expect(
      getDocumentationContext({ searchQuery: 'docs', searchProvider: 'typo' })
    ).rejects.toThrow('parallel or none');
    await expect(
      getDocumentationContext({ searchQuery: 'x'.repeat(2001) })
    ).rejects.toThrow('2000 characters');
    await expect(
      getDocumentationContext({
        searchQuery: 'docs',
        visual: 'http://localhost:3000',
      })
    ).rejects.toThrow('unit test matching only');
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('real MCP transport response and failure handling', () => {
  it('consumes streamed MCP results and bounds context size', async () => {
    useSse = true;
    toolResult = {
      content: [{ type: 'text', text: documentation + 'x'.repeat(20000) }],
    };
    const result = await getDocumentationContext({ searchQuery: 'docs' });
    expect(result).toHaveLength(12000);
    expect(result).toContain(sourceUrl);
  });

  it('surfaces tool errors without retrying or changing providers', async () => {
    toolResult = {
      isError: true,
      content: [{ type: 'text', text: 'Free anonymous search quota exceeded' }],
    };
    await expect(
      getDocumentationContext({ searchQuery: 'docs' })
    ).rejects.toThrow('quota exceeded');
    expect(requests.filter((r) => r.rpc?.method === 'tools/call')).toHaveLength(
      1
    );
  });

  it('rejects missing text and malformed MCP responses', async () => {
    toolResult = { content: [] };
    await expect(
      getDocumentationContext({ searchQuery: 'docs' })
    ).rejects.toThrow('no documentation text');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{', { headers: { 'Content-Type': 'application/json' } })
      )
    );
    await expect(
      getDocumentationContext({ searchQuery: 'docs' })
    ).rejects.toThrow('Documentation search failed');
  });

  it('aborts the HTTP request on the overall timeout', async () => {
    vi.useFakeTimers();
    hangMethod = 'tools/call';
    const pending = expect(
      getDocumentationContext({ searchQuery: 'docs' })
    ).rejects.toThrow('timed out');
    await vi.waitFor(() =>
      expect(requests.some((r) => r.rpc?.method === 'tools/call')).toBe(true)
    );
    await vi.advanceTimersByTimeAsync(15001);
    await pending;
  });

  it('honors cancellation during a call and before discovery', async () => {
    hangMethod = 'tools/call';
    const controller = new AbortController();
    const pending = expect(
      getDocumentationContext({
        searchQuery: 'docs',
        signal: controller.signal,
      })
    ).rejects.toThrow('User cancelled');
    await vi.waitFor(() =>
      expect(requests.some((r) => r.rpc?.method === 'tools/call')).toBe(true)
    );
    controller.abort(new Error('User cancelled'));
    await pending;
    requests.length = 0;
    await expect(
      getDocumentationContext({
        searchQuery: 'docs',
        signal: controller.signal,
      })
    ).rejects.toThrow('User cancelled');
    expect(requests).toHaveLength(0);
  });
});

describe('normal code generation consumes documentation (scripted model responses)', () => {
  it.each(['gpt-4o', 'claude', 'llama3'])(
    'reuses one lookup across iterations with %s and runs the generated output through tests',
    async (model) => {
      const directory = await mkdtemp(join(mocks.home, 'task-'));
      const outputFile = join(directory, 'answer.js');
      const testFile = join(directory, 'answer.test.cjs');
      const promptFile = join(directory, 'answer.prompt.md');
      await writeFile(outputFile, 'exports.answer = -1;');
      await writeFile(promptFile, 'PRIVATE TASK SENT ONLY TO MODEL');
      await writeFile(
        testFile,
        `const fs = require('fs'); if (!fs.readFileSync(${JSON.stringify(
          outputFile
        )}, 'utf8').includes('= 42;')) throw new Error('answer must be 42');`
      );
      await setConfigs([
        ['MODEL', model],
        ['OPENAI_KEY', 'model-fixture-key'],
        ['ANTHROPIC_KEY', 'model-fixture-key'],
      ]);
      const messages: unknown[] = [];
      let generation = 0;
      const code = (input: any) => {
        messages.push(input);
        return `exports.answer = ${++generation === 1 ? 0 : 42};`;
      };
      mocks.create.mockImplementation(async (input) => [
        { choices: [{ delta: { content: code(input) } }] },
      ]);
      mocks.ollamaChat.mockImplementation(async (input) => [
        { message: { content: code(input) } },
      ]);
      mocks.anthropicStream.mockImplementation((input) => ({
        on: (_event: string, handler: (text: string) => void) => {
          handler(code(input));
          return { done: async () => undefined };
        },
      }));
      const options: RunOptions = {
        outputFile,
        testFile,
        promptFile,
        testCommand: `node ${testFile}`,
        lastRunError: '',
        threadId: '',
        visual: '',
        searchQuery: 'library public API docs',
        maxRuns: 2,
      };
      const results = await runAll(options);
      expect(results?.map((r) => r.testResult.type)).toEqual([
        'fail',
        'success',
      ]);
      expect(await readFile(outputFile, 'utf8')).toContain('= 42;');
      expect(messages).toHaveLength(2);
      for (const input of messages) {
        expect(JSON.stringify(input)).toContain(sourceUrl);
        expect(JSON.stringify(input)).toContain('untrusted reference data');
        expect(JSON.stringify(input)).toContain(
          'PRIVATE TASK SENT ONLY TO MODEL'
        );
      }
      expect(JSON.stringify(requests)).not.toContain('PRIVATE TASK');
      expect(JSON.stringify(requests)).not.toContain('exports.answer');
      expect(
        requests.filter((r) => r.rpc?.method === 'tools/call')
      ).toHaveLength(1);
      const calls = requests.length;
      await runAll(options);
      expect(requests).toHaveLength(calls); // Passing tests need neither search nor generation.
    }
  );
});
