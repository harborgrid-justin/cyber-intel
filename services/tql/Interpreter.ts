
import { ASTNode } from './types';

export class Interpreter {
  evaluate(node: ASTNode, data: any): boolean {
    switch (node.type) {
      case 'BINARY_OP':
        // Short-circuit evaluation for performance
        if (node.operator === 'OR') {
            return this.evaluate(node.left, data) || this.evaluate(node.right, data);
        }
        if (node.operator === 'AND') {
            return this.evaluate(node.left, data) && this.evaluate(node.right, data);
        }
        return false;

      case 'GROUP':
        return this.evaluate(node.expression, data);

      case 'COMPARISON':
        return this.compare(data, node.field, node.operator, node.value);

      default:
        return false;
    }
  }

  private compare(data: any, field: string, op: string, val: string | number): boolean {
    if (field === '*') {
        const str = JSON.stringify(data).toLowerCase();
        return str.includes(String(val).toLowerCase());
    }

    const dataVal = this.getFieldValue(data, field);
    
    // Type Coercion for comparison
    const numVal = Number(val);
    const numDataVal = Number(dataVal);
    const isNumCompare = !isNaN(numVal) && !isNaN(numDataVal);

    if (isNumCompare) {
        switch (op) {
            case '>': return numDataVal > numVal;
            case '<': return numDataVal < numVal;
            case '>=': return numDataVal >= numVal;
            case '<=': return numDataVal <= numVal;
            case '=':
            case ':': return numDataVal === numVal;
            default: return false;
        }
    }

    // String comparison (case-insensitive)
    const strDataVal = String(dataVal).toLowerCase();
    const strVal = String(val).toLowerCase();

    switch (op) {
      case ':': 
      case '=': return strDataVal.includes(strVal);
      default: return false; // Non-numeric >, < on strings not supported
    }
  }

  private getFieldValue(data: any, field: string): any {
    return data[field] ?? data[field.toLowerCase()] ?? data[field.toUpperCase()] ?? undefined;
  }
}
