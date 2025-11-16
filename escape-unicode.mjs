// scripts/escape-unicode.mjs
import fs from 'node:fs';

const src = 'App.tsx';
const dst = 'App.escaped.tsx';

// Гарантируем корректную кодировку
let code = fs.readFileSync(src, 'utf8');

// Регэксп на обычные строковые литералы: '...' и "..." (без многострочных/backtick)
const stringRe = /(['"])(?:\\.|(?!\1)[\s\S])*?\1/g;

function escapeNonAsciiInStringLiteral(lit) {
  const quote = lit[0];
  const body = lit.slice(1, -1);
  let escaped = '';
  for (let i = 0; i < body.length; i++) {
    let ch = body[i];
    let cp = ch.codePointAt(0);
    if (ch === '\\') { // Пропускаем экранированные последовательности
      escaped += ch;
      if (i + 1 < body.length) escaped += body[++i];
      continue;
    }
    if (cp > 0x7F) {
      // BMP — \uXXXX, вне BMP — \u{...}
      if (cp <= 0xFFFF) {
        escaped += '\\u' + cp.toString(16).padStart(4, '0');
      } else {
        escaped += '\\u{' + cp.toString(16) + '}';
        // если суррогатная пара, корректно пропустить второй юнит
        if (cp > 0xFFFF) i++; // в JS суррогаты занимают 2 позиции!
      }
    } else {
      escaped += ch;
    }
  }
  return quote + escaped + quote;
}

// Заменяем ВСЕ обычные строковые литералы с не-ASCII на экранированные
code = code.replace(stringRe, m => escapeNonAsciiInStringLiteral(m));

// Сохраняем результат в чистом UTF-8
fs.writeFileSync(dst, code, 'utf8');
console.log(`Done! Сгенерировано: ${dst}`);
