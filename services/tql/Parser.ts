
import { Token, ASTNode } from './types';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  parse(tokens: Token[]): ASTNode {
    this.tokens = tokens;
    this.current = 0;
    return this.expression();
  }

  private expression(): ASTNode {
    return this.orExpression();
  }

  private orExpression(): ASTNode {
    let expr = this.andExpression();
    while (this.match('OR')) {
      const right = this.andExpression();
      expr = { type: 'BINARY_OP', operator: 'OR', left: expr, right };
    }
    return expr;
  }

  private andExpression(): ASTNode {
    let expr = this.primary();
    while (this.match('AND')) {
      const right = this.primary();
      expr = { type: 'BINARY_OP', operator: 'AND', left: expr, right };
    }
    return expr;
  }

  private primary(): ASTNode {
    if (this.match('LPAREN')) {
      const expr = this.expression();
      this.consume('RPAREN', "Expected ')'");
      return { type: 'GROUP', expression: expr };
    }

    // Comparison: field operator value
    const token = this.peek();
    if (token.type === 'IDENTIFIER' || token.type === 'VALUE') {
        this.advance();
        const field = token.value;
        
        if (this.peek().type === 'OPERATOR') {
            const op = this.advance().value;
            const valToken = this.advance();
            const val = !isNaN(Number(valToken.value)) ? Number(valToken.value) : valToken.value;
            return { type: 'COMPARISON', field, operator: op, value: val };
        }
        
        // Implicit search (e.g. "malware" -> * contains malware)
        return { type: 'COMPARISON', field: '*', operator: 'CONTAINS', value: field };
    }

    throw new Error(`Unexpected token: ${this.peek().value}`);
  }

  private match(type: string): boolean {
    if (this.check(type)) { this.advance(); return true; }
    return false;
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd() { return this.peek().type === 'EOF'; }
  private peek() { return this.tokens[this.current]; }
  private previous() { return this.tokens[this.current - 1]; }
  
  private consume(type: string, message: string) {
    if (this.check(type)) return this.advance();
    throw new Error(message);
  }
}
