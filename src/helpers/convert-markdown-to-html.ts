import { dedent } from 'dedent';

export function convertMarkdownToHtml(markdownText: string): string {
  const renderer = {
    code(code: string) {
      return `<pre><code>${code.trim()}</code></pre>`;
    },
    heading(text: string, level: number) {
      return `<h${level}>${text}</h${level}>`;
    },
    paragraph(text: string) {
      return text.trim().startsWith('<') ? text : `<p>${text}</p>`;
    },
    list(body: string, ordered: boolean) {
      const type = ordered ? 'ol' : 'ul';
      return `<${type}>${body}</${type}>`;
    },
    listitem(text: string) {
      return `<li>${text}</li>`;
    },
    link(href: string, _: string | null, text: string) {
      return `<a href="${href}">${text}</a>`;
    },
    strong(text: string) {
      return `<strong>${text}</strong>`;
    },
    em(text: string) {
      return `<em>${text}</em>`;
    }
  };

  let html = '';

  const lines = markdownText.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      html += renderer.heading(line.substring(2), 1) + '\n';
    } else if (line.startsWith('## ')) {
      html += renderer.heading(line.substring(3), 2) + '\n';
    } else if (line.startsWith('### ')) {
      html += renderer.heading(line.substring(4), 3) + '\n';
    } else if (line.startsWith('#### ')) {
      html += renderer.heading(line.substring(5), 4) + '\n';
    } else if (line.startsWith('##### ')) {
      html += renderer.heading(line.substring(6), 5) + '\n';
    } else if (line.startsWith('###### ')) {
      html += renderer.heading(line.substring(7), 6) + '\n';
    } else if (line.startsWith('- ')) {
      const items = line.split('- ').filter(item => item.trim() !== '');
      let listItems = '';
      for (const item of items) {
        listItems += renderer.listitem(item.trim()) + '\n';
      }
      html += renderer.list(listItems, false) + '\n';
    } else if (line.startsWith('```')) {
      const codeLines = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '```') break;
        codeLines.push(lines[i]);
      }
      html += renderer.code(codeLines.join('\n')) + '\n';
    } else if (line.startsWith('[')) {
      const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        html += renderer.link(linkMatch[2], null, linkMatch[1]) + '\n';
      }
    } else if (line.trim() !== '') {
      html += renderer.paragraph(line) + '\n';
    }
  }

  return html
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><code>/g, '<code>')
    .replace(/<\/code><\/p>/g, '</code>')
    .trim();
}