(function () {
  function pushLine(lines, value, indent) {
    var line = value.trim();
    if (line) {
      lines.push('  '.repeat(indent) + line);
    }
  }

  function formatProgram(value) {
    var lines = [];
    var line = '';
    var indent = 0;
    var quote = '';
    var escaped = false;
    var parenthesisDepth = 0;

    for (var index = 0; index < value.length; index += 1) {
      var character = value[index];

      if (quote) {
        line += character;
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === quote) {
          quote = '';
        }
        continue;
      }

      if (character === '"' || character === "'" || character === '`') {
        quote = character;
        line += character;
      } else if (character === '(') {
        parenthesisDepth += 1;
        line += character;
      } else if (character === ')') {
        parenthesisDepth = Math.max(0, parenthesisDepth - 1);
        line += character;
      } else if (character === '{') {
        line += character;
        pushLine(lines, line, indent);
        line = '';
        indent += 1;
      } else if (character === '}') {
        pushLine(lines, line, indent);
        line = '';
        indent = Math.max(0, indent - 1);
        line = '}';
        if (value[index + 1] !== ';') {
          pushLine(lines, line, indent);
          line = '';
        }
      } else if (character === ';' && parenthesisDepth === 0) {
        line += character;
        pushLine(lines, line, indent);
        line = '';
      } else {
        line += character;
      }
    }

    pushLine(lines, line, indent);
    return lines.join('\n');
  }

  function indentLines(value) {
    return value.split('\n').map(function (line) {
      return line ? '  ' + line : line;
    }).join('\n');
  }

  function formatMarkup(value) {
    var embeddedCode = value.replace(
      /<(style|script)([^>]*)>([\s\S]*?)<\/\1>/gi,
      function (match, tag, attributes, content) {
        var formatted = formatProgram(content);
        return '<' + tag + attributes + '>\n' + indentLines(formatted) + '\n</' + tag + '>';
      }
    );

    return embeddedCode.replace(/>\s*</g, '>\n<').trim();
  }

  function repairCollapsedCode() {
    var blocks = document.querySelectorAll('.article-entry pre > code');

    blocks.forEach(function (block) {
      var value = block.textContent.trim();
      if (!value || value.includes('\n') || value.length < 80) {
        return;
      }

      var formatted = /<\/?[a-z!][^>]*>/i.test(value) ? formatMarkup(value) : formatProgram(value);
      if (formatted !== value) {
        block.textContent = formatted;
        block.parentElement.classList.add('code-repaired');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', repairCollapsedCode);
}());
