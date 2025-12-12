
import { GraphQLScalarType, Kind } from 'graphql';

/**
 * Custom DateTime scalar for handling ISO 8601 date strings
 */
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type (ISO 8601)',

  serialize(value: any): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    throw new Error('DateTime must be a Date object or ISO 8601 string');
  },

  parseValue(value: any): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('DateTime must be an ISO 8601 string');
  },

  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('DateTime must be an ISO 8601 string');
  }
});

/**
 * Custom JSON scalar for handling arbitrary JSON objects
 */
export const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',

  serialize(value: any): any {
    return value;
  },

  parseValue(value: any): any {
    return value;
  },

  parseLiteral(ast): any {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null);
        ast.fields.forEach(field => {
          value[field.name.value] = JSONScalar.parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map(n => JSONScalar.parseLiteral(n));
      default:
        return null;
    }
  }
});

/**
 * Custom UUID scalar for handling UUID strings
 */
export const UUIDScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID custom scalar type',

  serialize(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    throw new Error('UUID must be a string');
  },

  parseValue(value: any): string {
    if (typeof value === 'string') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(value)) {
        return value;
      }
      throw new Error('Invalid UUID format');
    }
    throw new Error('UUID must be a string');
  },

  parseLiteral(ast): string {
    if (ast.kind === Kind.STRING) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(ast.value)) {
        return ast.value;
      }
      throw new Error('Invalid UUID format');
    }
    throw new Error('UUID must be a string');
  }
});
