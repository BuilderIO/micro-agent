import { describe, it, expect } from 'vitest';
import { convertMarkdownToHtml } from './convert-markdown-to-html';

describe('convertMarkdownToHtml', () => {
  it('should convert a simple markdown header to HTML', () => {
    const markdown = '# Hello World';
    const expectedHtml = '<h1>Hello World</h1>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should convert markdown paragraph to HTML', () => {
    const markdown = 'This is a test paragraph.';
    const expectedHtml = '<p>This is a test paragraph.</p>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should convert markdown list to HTML', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const expectedHtml = '<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should convert markdown code block to HTML', () => {
    const markdown = '```\nconsole.log("Hello World");\n```';
    const expectedHtml = '<pre><code>console.log("Hello World");\n</code></pre>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should convert markdown link to HTML', () => {
    const markdown = '[Google](https://www.google.com)';
    const expectedHtml = '<a href="https://www.google.com">Google</a>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should handle an empty string', () => {
    const markdown = '';
    const expectedHtml = '';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should handle complex markdown', () => {
    const markdown = '# Header\n\nThis is a **bold** text and this is *italic* text.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("Hello World");\n```\n\n[Link](https://example.com)';
    const expectedHtml = '<h1>Header</h1>\n<p>This is a <strong>bold</strong> text and this is <em>italic</em> text.</p>\n<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>\n<pre><code>console.log("Hello World");\n</code></pre>\n<p><a href="https://example.com">Link</a></p>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });

  it('should convert markdown with nested elements', () => {
    const markdown = '# Header\n\nThis is a **bold text with a [link](https://example.com)** inside.\n\n- Item 1\n  - Subitem 1\n  - Subitem 2\n- Item 2\n\n```js\nconsole.log("Nested Hello World");\n```\n\n[Another Link](https://example.org)';
    const expectedHtml = '<h1>Header</h1>\n<p>This is a <strong>bold text with a <a href="https://example.com">link</a></strong> inside.</p>\n<ul>\n<li>Item 1\n<ul>\n<li>Subitem 1</li>\n<li>Subitem 2</li>\n</ul>\n</li>\n<li>Item 2</li>\n</ul>\n<pre><code>console.log("Nested Hello World");\n</code></pre>\n<p><a href="https://example.org">Another Link</a></p>';
    const result = convertMarkdownToHtml(markdown);
    expect(result).toBe(expectedHtml);
  });
});