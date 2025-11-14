// Reusable markdown-to-HTML conversion utility
export const formatMarkdown = (text: string | null | undefined): string => {
    if (!text) {
        return '';
    }
    
    let html = text;

    // Handle code blocks first to prevent inner markdown parsing
    html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
        const encodedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded-md my-2 text-sm overflow-x-auto"><code>${encodedCode}</code></pre>`;
    });

    // Tables
    html = html.replace(
        /^\|([^\n]+)\|\r?\n\|([-\|: ]+)\|\r?\n((?:\|[^\n]+\|\r?\n?)*)/gm,
        (_match, headerLine, _separatorLine, bodyLines) => {
            const headers = headerLine
                .split('|')
                .slice(1, -1)
                .map(h => `<th class="p-3 text-left font-semibold">${h.trim()}</th>`)
                .join('');

            const head = `<thead><tr class="border-b dark:border-gray-600">${headers}</tr></thead>`;
            
            const rows = bodyLines.trim().split('\n');
            const body = `<tbody>${rows
                .map(row => {
                    const cells = row
                        .split('|')
                        .slice(1, -1)
                        .map(c => `<td class="p-3 align-top">${c.trim().replace(/\n/g, '<br/>')}</td>`)
                        .join('');
                    return `<tr class="border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">${cells}</tr>`;
                })
                .join('')}</tbody>`;

            return `<div class="overflow-x-auto my-4 rounded-lg border dark:border-gray-700"><table class="w-full text-sm">${head}${body}</table></div>`;
        }
    );


    // Links: [title](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">$1</a>');
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
    
    // Italics: *text* or _text_
    html = html.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
    
    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, (_match, code) => {
         const encodedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">${encodedCode}</code>`;
    });
    
    // Process lists more robustly
    html = html.replace(/^\s*([*-]|\d+\.)\s+(.*)/gm, '<li>$2</li>');
    html = html.replace(/(<\/li>\s*<li>)/g, '</li><li>'); // clean up spacing
    
    // Wrap consecutive <li>'s in <ul> or <ol>
    // This regex is complex; it finds blocks of <li> and wraps them.
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, (match) => {
        if (match.includes('<ol>') || match.includes('<ul>')) return match; // Avoid double wrapping
        if (match.match(/<li>/)) { // Check if it's a list item
             // A simple check for numbered lists. A more robust parser would be better for mixed lists.
             const isOrdered = /^\s*\d+\./.test(match);
             const listTag = isOrdered ? 'ol' : 'ul';
             return `<${listTag} class="list-disc list-inside pl-4 my-2">${match}</${listTag}>`;
        }
        return match;
    });

    // Finally, replace newlines with <br />, but not inside lists or pre blocks
    html = html.replace(/\n/g, '<br />');
    html = html.replace(/<br \/>\s*(<(?:ul|ol|pre|div))/g, '$1'); // clean up before lists/pre/tables
    html = html.replace(/(<\/(?:ul|ol|pre|table|div)>)\s*<br \/>/g, '$1'); // clean up after lists/pre/tables
    html = html.replace(/<li><br \/>/g, '<li>'); // clean up inside list items
    
    return html;
};