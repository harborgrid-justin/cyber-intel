
export type TokenType = 'IDENTIFIER' | 'OPERATOR' | 'VALUE' | 'LPAREN' | 'RPAREN' | 'AND' | 'OR' | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export type ASTNode = 
  | { type: 'BINARY_OP'; left: ASTNode; right: ASTNode; operator: string }
  | { type: 'COMPARISON'; field: string; operator: string; value: string | number }
  | { type: 'GROUP'; expression: ASTNode };

export interface QueryResult<T> {
  matches: T[];
  parseError: string | null;
  tokens: Token[];
}
