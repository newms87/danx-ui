import { describe, it, expect } from "vitest";
import { highlightBash } from "../highlightBash";

describe("highlightBash", () => {
  describe("empty/falsy input", () => {
    it("returns empty string for empty string", () => {
      expect(highlightBash("")).toBe("");
    });

    it("returns empty string for null", () => {
      // @ts-expect-error testing falsy input
      expect(highlightBash(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
      // @ts-expect-error testing falsy input
      expect(highlightBash(undefined)).toBe("");
    });
  });

  describe("comments", () => {
    it("highlights # comments", () => {
      const result = highlightBash("# this is a comment");
      expect(result).toBe('<span class="syntax-comment"># this is a comment</span>');
    });

    it("highlights shebang lines", () => {
      const result = highlightBash("#!/bin/bash");
      expect(result).toBe('<span class="syntax-comment">#!/bin/bash</span>');
    });

    it("stops comment at newline", () => {
      const result = highlightBash("# comment\necho hello");
      expect(result).toContain('<span class="syntax-comment"># comment</span>');
      expect(result).toContain('<span class="syntax-keyword">echo</span>');
    });

    it("highlights inline comments after code", () => {
      const result = highlightBash("echo hello # comment");
      expect(result).toContain('<span class="syntax-keyword">echo</span>');
      expect(result).toContain('<span class="syntax-comment"># comment</span>');
    });
  });

  describe("double-quoted strings", () => {
    it("highlights double-quoted strings", () => {
      const result = highlightBash('"hello world"');
      expect(result).toBe('<span class="syntax-string">&quot;hello world&quot;</span>');
    });

    it("handles escape sequences", () => {
      const result = highlightBash('"hello\\nworld"');
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain("hello\\nworld");
    });

    it("handles escaped quotes inside double-quoted strings", () => {
      const result = highlightBash('"say \\"hello\\""');
      expect(result).toContain('class="syntax-string"');
    });

    it("handles unterminated double-quoted string", () => {
      const result = highlightBash('"unterminated');
      expect(result).toContain('class="syntax-string"');
    });
  });

  describe("single-quoted strings", () => {
    it("highlights single-quoted strings (literal, no escapes)", () => {
      const result = highlightBash("'hello world'");
      expect(result).toBe('<span class="syntax-string">&#039;hello world&#039;</span>');
    });

    it("treats backslash literally inside single quotes", () => {
      const result = highlightBash("'hello\\nworld'");
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain("hello\\nworld");
    });

    it("handles unterminated single-quoted string", () => {
      const result = highlightBash("'unterminated");
      expect(result).toContain('class="syntax-string"');
    });
  });

  describe("variables", () => {
    it("highlights $VAR form", () => {
      const result = highlightBash("echo $HOME");
      expect(result).toContain('<span class="syntax-variable">$HOME</span>');
    });

    it("highlights ${VAR} form", () => {
      const result = highlightBash("echo ${HOME}");
      expect(result).toContain('<span class="syntax-variable">${HOME}</span>');
    });

    it("highlights positional parameters $0-$9", () => {
      for (let n = 0; n <= 9; n++) {
        const result = highlightBash(`echo $${n}`);
        expect(result).toContain(`<span class="syntax-variable">$${n}</span>`);
      }
    });

    it("highlights $@ variable", () => {
      const result = highlightBash("echo $@");
      expect(result).toContain('<span class="syntax-variable">$@</span>');
    });

    it("highlights $? variable", () => {
      const result = highlightBash("echo $?");
      expect(result).toContain('<span class="syntax-variable">$?</span>');
    });

    it("highlights $# variable", () => {
      const result = highlightBash("echo $#");
      expect(result).toContain('<span class="syntax-variable">$#</span>');
    });

    it("highlights $$ variable", () => {
      const result = highlightBash("echo $$");
      expect(result).toContain('<span class="syntax-variable">$$</span>');
    });

    it("highlights $! variable", () => {
      const result = highlightBash("echo $!");
      expect(result).toContain('<span class="syntax-variable">$!</span>');
    });

    it("highlights $* variable", () => {
      const result = highlightBash("echo $*");
      expect(result).toContain('<span class="syntax-variable">$*</span>');
    });

    it("highlights $_ variable", () => {
      const result = highlightBash("echo $_");
      expect(result).toContain('<span class="syntax-variable">$_</span>');
    });

    it("highlights bare $ at end of input", () => {
      const result = highlightBash("echo $");
      expect(result).toContain('<span class="syntax-variable">$</span>');
    });

    it("highlights variable followed by space", () => {
      const result = highlightBash("echo $VAR rest");
      expect(result).toContain('<span class="syntax-variable">$VAR</span>');
      expect(result).toContain("rest");
    });

    it("highlights ${} with complex content", () => {
      const result = highlightBash("echo ${VAR:-default}");
      expect(result).toContain('<span class="syntax-variable">${VAR:-default}</span>');
    });

    it("handles unclosed ${", () => {
      const result = highlightBash("echo ${UNCLOSED");
      expect(result).toContain('class="syntax-variable"');
    });

    it("highlights $ followed by non-special character", () => {
      const result = highlightBash("echo $ ");
      expect(result).toContain('<span class="syntax-variable">$</span>');
    });
  });

  describe("keywords", () => {
    it("highlights control flow keywords", () => {
      for (const kw of ["if", "then", "else", "elif", "fi"]) {
        const result = highlightBash(`echo x; ${kw}`);
        expect(result).toContain(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights loop keywords", () => {
      for (const kw of ["for", "while", "until", "do", "done"]) {
        const result = highlightBash(`echo x; ${kw}`);
        expect(result).toContain(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights case keywords", () => {
      for (const kw of ["case", "esac", "in"]) {
        const result = highlightBash(`echo x; ${kw}`);
        expect(result).toContain(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights function-related keywords", () => {
      for (const kw of ["function", "return", "local"]) {
        const result = highlightBash(`echo x; ${kw}`);
        expect(result).toContain(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("highlights other keywords", () => {
      for (const kw of ["export", "source", "eval", "exec", "select"]) {
        const result = highlightBash(`echo x; ${kw}`);
        expect(result).toContain(`<span class="syntax-keyword">${kw}</span>`);
      }
    });

    it("does not highlight keyword substrings in identifiers", () => {
      const result = highlightBash("echo iffy");
      // "iffy" is an argument, not a keyword
      expect(result).not.toContain('"syntax-keyword">iffy');
    });

    it("keywords after then/do/else start new command position", () => {
      const result = highlightBash("if true; then mycommand arg");
      expect(result).toContain('<span class="syntax-keyword">mycommand</span>');
    });
  });

  describe("positional command detection", () => {
    it("highlights the first word on a line as a command", () => {
      const result = highlightBash("myapp --flag");
      expect(result).toContain('<span class="syntax-keyword">myapp</span>');
    });

    it("highlights any unknown command at line start", () => {
      const result = highlightBash("deploy_prod --env staging");
      expect(result).toContain('<span class="syntax-keyword">deploy_prod</span>');
    });

    it("highlights command after pipe", () => {
      const result = highlightBash("echo hello | myfilter");
      expect(result).toContain('<span class="syntax-keyword">myfilter</span>');
    });

    it("highlights command after &&", () => {
      const result = highlightBash("echo a && run_tests");
      expect(result).toContain('<span class="syntax-keyword">run_tests</span>');
    });

    it("highlights command after ||", () => {
      const result = highlightBash("echo a || fallback_cmd");
      expect(result).toContain('<span class="syntax-keyword">fallback_cmd</span>');
    });

    it("highlights command after semicolon", () => {
      const result = highlightBash("echo a; another_cmd arg");
      expect(result).toContain('<span class="syntax-keyword">another_cmd</span>');
    });

    it("highlights command after ;;", () => {
      const result = highlightBash("*) echo default ;;\nesac");
      expect(result).toContain('<span class="syntax-keyword">esac</span>');
    });

    it("does not highlight arguments as commands", () => {
      const result = highlightBash("echo hello world");
      // "hello" and "world" are arguments, not commands
      expect(result).not.toContain('"syntax-keyword">hello');
      expect(result).not.toContain('"syntax-keyword">world');
    });

    it("highlights command with path separators", () => {
      const result = highlightBash("./script.sh arg");
      expect(result).toContain('<span class="syntax-keyword">./script.sh</span>');
    });

    it("highlights command with absolute path", () => {
      const result = highlightBash("/usr/bin/env node");
      expect(result).toContain('<span class="syntax-keyword">/usr/bin/env</span>');
    });

    it("highlights hyphenated command names", () => {
      const result = highlightBash("docker-compose up");
      expect(result).toContain('<span class="syntax-keyword">docker-compose</span>');
    });

    it("highlights command after newline", () => {
      const result = highlightBash("echo a\nsecond_cmd b");
      expect(result).toContain('<span class="syntax-keyword">second_cmd</span>');
    });

    it("highlights command after opening parenthesis (subshell)", () => {
      const result = highlightBash("(subshell_cmd arg)");
      expect(result).toContain('<span class="syntax-keyword">subshell_cmd</span>');
    });

    it("highlights command after opening brace (block)", () => {
      const result = highlightBash("{ block_cmd arg; }");
      expect(result).toContain('<span class="syntax-keyword">block_cmd</span>');
    });

    it("does not treat > as command starter", () => {
      const result = highlightBash("echo hello > notcmd");
      // "notcmd" is a filename after redirect, not a command
      expect(result).not.toContain('"syntax-keyword">notcmd');
    });
  });

  describe("operators", () => {
    it("highlights ||", () => {
      const result = highlightBash("a || b");
      expect(result).toContain('<span class="syntax-operator">||</span>');
    });

    it("highlights &&", () => {
      const result = highlightBash("a && b");
      expect(result).toContain('<span class="syntax-operator">&amp;&amp;</span>');
    });

    it("highlights ;;", () => {
      const result = highlightBash("echo x ;;");
      expect(result).toContain('<span class="syntax-operator">;;</span>');
    });

    it("highlights >>", () => {
      const result = highlightBash("echo x >> file");
      expect(result).toContain('<span class="syntax-operator">&gt;&gt;</span>');
    });

    it("highlights <<", () => {
      const result = highlightBash("cat << EOF");
      expect(result).toContain('<span class="syntax-operator">&lt;&lt;</span>');
    });

    it("highlights 2>", () => {
      const result = highlightBash("cmd 2> err");
      expect(result).toContain('<span class="syntax-operator">2&gt;</span>');
    });

    it("highlights &>", () => {
      const result = highlightBash("cmd &> out");
      expect(result).toContain('<span class="syntax-operator">&amp;&gt;</span>');
    });

    it("highlights single |", () => {
      const result = highlightBash("a | b");
      expect(result).toContain('<span class="syntax-operator">|</span>');
    });

    it("highlights single >", () => {
      const result = highlightBash("echo x > file");
      expect(result).toContain('<span class="syntax-operator">&gt;</span>');
    });

    it("highlights single <", () => {
      const result = highlightBash("cmd < file");
      expect(result).toContain('<span class="syntax-operator">&lt;</span>');
    });

    it("highlights single &", () => {
      const result = highlightBash("cmd &");
      expect(result).toContain('<span class="syntax-operator">&amp;</span>');
    });

    it("highlights single ;", () => {
      const result = highlightBash("a; b");
      expect(result).toContain('<span class="syntax-operator">;</span>');
    });
  });

  describe("numbers", () => {
    it("highlights integers", () => {
      const result = highlightBash("echo 42");
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("highlights hex numbers", () => {
      const result = highlightBash("echo 0xFF");
      expect(result).toContain('<span class="syntax-number">0xFF</span>');
    });

    it("highlights hex with uppercase X", () => {
      const result = highlightBash("echo 0XAB");
      expect(result).toContain('<span class="syntax-number">0XAB</span>');
    });

    it("does not highlight numbers that are part of identifiers", () => {
      const result = highlightBash("echo var2name");
      expect(result).not.toContain('class="syntax-number"');
    });

    it("highlights standalone 0", () => {
      const result = highlightBash("echo 0");
      expect(result).toContain('<span class="syntax-number">0</span>');
    });
  });

  describe("punctuation", () => {
    it("highlights parentheses", () => {
      const result = highlightBash("(a)");
      expect(result).toContain('<span class="syntax-punctuation">(</span>');
      expect(result).toContain('<span class="syntax-punctuation">)</span>');
    });

    it("highlights braces", () => {
      const result = highlightBash("{ a; }");
      expect(result).toContain('<span class="syntax-punctuation">{</span>');
      expect(result).toContain('<span class="syntax-punctuation">}</span>');
    });

    it("highlights brackets", () => {
      const result = highlightBash("[ -f file ]");
      expect(result).toContain('<span class="syntax-punctuation">[</span>');
      expect(result).toContain('<span class="syntax-punctuation">]</span>');
    });
  });

  describe("whitespace and special characters", () => {
    it("preserves whitespace", () => {
      const result = highlightBash("echo  hello");
      expect(result).toContain("  ");
    });

    it("preserves newlines", () => {
      const result = highlightBash("echo\necho");
      expect(result).toContain("\n");
    });

    it("preserves tabs", () => {
      const result = highlightBash("echo\thello");
      expect(result).toContain("\t");
    });

    it("escapes HTML entities in plain text", () => {
      // "=" is not a recognized operator or punctuation, so it's just escaped
      const result = highlightBash("echo =");
      expect(result).toContain("=");
    });
  });

  describe("complex expressions", () => {
    it("highlights a complete if statement", () => {
      const result = highlightBash('if [ "$1" = "test" ]; then');
      expect(result).toContain('<span class="syntax-keyword">if</span>');
      expect(result).toContain('<span class="syntax-keyword">then</span>');
      expect(result).toContain('class="syntax-string"');
    });

    it("highlights a for loop", () => {
      const result = highlightBash("for i in 1 2 3; do echo $i; done");
      expect(result).toContain('<span class="syntax-keyword">for</span>');
      expect(result).toContain('<span class="syntax-keyword">in</span>');
      expect(result).toContain('<span class="syntax-keyword">do</span>');
      expect(result).toContain('<span class="syntax-keyword">echo</span>');
      expect(result).toContain('<span class="syntax-keyword">done</span>');
      expect(result).toContain('<span class="syntax-variable">$i</span>');
    });

    it("highlights a function definition", () => {
      const result = highlightBash("function greet() { echo hello; }");
      expect(result).toContain('<span class="syntax-keyword">function</span>');
      expect(result).toContain('<span class="syntax-keyword">echo</span>');
    });

    it("highlights piped commands", () => {
      const result = highlightBash("cat file.txt | grep pattern | sort");
      expect(result).toContain('<span class="syntax-keyword">cat</span>');
      expect(result).toContain('<span class="syntax-operator">|</span>');
      expect(result).toContain('<span class="syntax-keyword">grep</span>');
      expect(result).toContain('<span class="syntax-keyword">sort</span>');
    });

    it("highlights variable assignment with export", () => {
      const result = highlightBash('export PATH="/usr/bin:$PATH"');
      expect(result).toContain('<span class="syntax-keyword">export</span>');
      expect(result).toContain('class="syntax-string"');
    });

    it("highlights a shebang with following code", () => {
      const result = highlightBash("#!/bin/bash\necho hello");
      expect(result).toContain('<span class="syntax-comment">#!/bin/bash</span>');
      expect(result).toContain('<span class="syntax-keyword">echo</span>');
    });

    it("highlights case statement", () => {
      const result = highlightBash("case $1 in\n  *) echo default ;;\nesac");
      expect(result).toContain('<span class="syntax-keyword">case</span>');
      expect(result).toContain('<span class="syntax-keyword">in</span>');
      expect(result).toContain('<span class="syntax-keyword">echo</span>');
      expect(result).toContain('<span class="syntax-operator">;;</span>');
      expect(result).toContain('<span class="syntax-keyword">esac</span>');
    });
  });

  describe("edge cases", () => {
    it("handles digit starting a number then followed by word chars (identifier)", () => {
      const result = highlightBash("echo 2path");
      expect(result).toContain("2");
      expect(result).toContain("path");
    });

    it("handles $ at very end of input", () => {
      const result = highlightBash("echo $");
      expect(result).toContain('<span class="syntax-variable">$</span>');
    });

    it("handles command starting with path at start of input", () => {
      const result = highlightBash("/usr/local/bin/my-tool --help");
      expect(result).toContain('<span class="syntax-keyword">/usr/local/bin/my-tool</span>');
    });

    it("handles string in command position (not treated as command)", () => {
      // A string in command position should still be a string, not a command
      const result = highlightBash('"./run.sh" arg');
      expect(result).toContain('class="syntax-string"');
    });

    it("handles variable in command position (not treated as command)", () => {
      const result = highlightBash("$CMD arg");
      expect(result).toContain('class="syntax-variable"');
    });
  });
});
