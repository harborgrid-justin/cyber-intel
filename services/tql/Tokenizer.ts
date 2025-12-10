
import { Token, TokenType } from './types';

export class Tokenizer {
  private pos = 0;
  private input = '';

  tokenize(input: string): Token[] {
    this.input = input;
    this.pos = 0;
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      const char = this.peek();

      if (/\s/.test(char)) { this.advance(); continue; }
      if (char === '(') { tokens.push({ type: 'LPAREN', value: '(', position: this.pos }); this.advance(); continue; }
      if (char === ')') { tokens.push({ type: 'RPAREN', value: ')', position: this.pos }); this.advance(); continue; }

      if (this.matchKeyword('AND')) { tokens.push({ type: 'AND', value: 'AND', position: this.pos }); this.advance(3); continue; }
      if (this.matchKeyword('OR')) { tokens.push({ type: 'OR', value: 'OR', position: this.pos }); this.advance(2); continue; }

      // Operators: :, >, <, =, >=, <=
      if (/[=:<>]/.test(char)) {
        let op = char;
        if (this.peek(1) === '=') { op += '='; }
        tokens.push({ type: 'OPERATOR', value: op, position: this.pos });
        this.advance(op.length);
        continue;
      }

      // Values (Quoted strings)
      if (char === '"' || char === "'") {
        tokens.push(this.readString(char));
        continue;
      }

      // Identifiers / Unquoted Values
      if (/[a-zA-Z0-9_.*-]/.test(char)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      this.advance(); // Skip unknown
    }
    tokens.push({ type: 'EOF', value: '', position: this.pos });
    return tokens;
  }

  private advance(n = 1) { this.pos += n; }
  private peek(n = 0) { return this.input[this.pos + n] || ''; }
  
  private matchKeyword(kw: string) {
    return this.input.substr(this.pos, kw.length).toUpperCase() === kw && 
           !/[a-zA-Z0-9]/.test(this.peek(kw.length));
  }

  private readString(quote: string): Token {
    const start = this.pos;
    this.advance(); // Skip open quote
    let val = '';
    while (this.pos < this.input.length && this.peek() !== quote) {
      val += this.peek();
      this.advance();
    }
    this.advance(); // Skip close quote
    return { type: 'VALUE', value: val, position: start };
  }

  private readIdentifier(): Token {
    const start = this.pos;
    let val = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_.*-]/.test(this.peek())) {
      val += this.peek();
      this.advance();
    }
    // Check if it's a number
    if (!isNaN(Number(val)) && !val.includes('-')) return { type: 'VALUE', value: val, position: start };
    return { type: 'IDENTIFIER', value: val, position: start };
  }
}
