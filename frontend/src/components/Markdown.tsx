/**
 * Tiny zero-dep markdown renderer for chat replies.
 * Handles **bold**, _italics_, `code`, line-breaks, * bullet lists, and #/## headings.
 * Safe by design — never injects raw HTML from the model; output is escaped first.
 */

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const inline = (line: string): string =>
  escapeHtml(line)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_\n]+)_/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-brand-200">$1</code>');

export const Markdown = ({ children }: { children: string }) => {
  const lines = children.split('\n');
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      html.push('<div class="h-2"></div>');
      continue;
    }
    if (/^###\s+/.test(line)) {
      closeList();
      html.push(`<h3 class="font-semibold text-slate-100 mt-3">${inline(line.replace(/^###\s+/, ''))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      closeList();
      html.push(`<h2 class="font-display text-lg text-white mt-3">${inline(line.replace(/^##\s+/, ''))}</h2>`);
    } else if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      if (!inList) {
        html.push('<ul class="list-disc pl-5 space-y-1 marker:text-brand-300">');
        inList = true;
      }
      const text = line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
      html.push(`<li>${inline(text)}</li>`);
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();

  return (
    <div
      className="prose-chat space-y-1 text-[15px] leading-relaxed"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html.join('') }}
    />
  );
};
