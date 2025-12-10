
import { ASTNode } from './types';

export class Interpreter {
  evaluate(node: ASTNode, data: any): boolean {
    switch (node.type) {
      case 'BINARY_OP':
        const left = this.evaluate(node.left, data);
        const right = this.evaluate(node.right, data);
        return node.operator === 'AND' ? left && right : left || right;

      case 'GROUP':
        return this.evaluate(node.expression, data);

      case 'COMPARISON':
        return this.compare(data, node.field, node.operator, node.value);

      default:
        return false;
    }
  }

  private compare(data: any, field: string, op: string, val: string | number): boolean {
    // Handle wildcard global search
    if (field === '*') {
        const str = JSON.stringify(data).toLowerCase();
        return str.includes(String(val).toLowerCase());
    }

    const dataVal = this.getFieldValue(data, field);
    
    // Normalize types
    const v1 = (typeof dataVal === 'string') ? dataVal.toLowerCase() : dataVal;
    const v2 = (typeof val === 'string') ? val.toLowerCase() : val;

    switch (op) {
      case ':': 
      case '=': return String(v1) === String(v2) || String(v1).includes(String(v2));
      case '>': return v1 > v2;
      case '<': return v1 < v2;
      case '>=': return v1 >= v2;
      case '<=': return v1 <= v2;
      default: return false;
    }
  }

  private getFieldValue(data: any, field: string): any {
    // Handle nested dot notation if needed, simplistic for now
    return data[field] || data[field.toLowerCase()] || 0;
  }
}
