
import { useState, useEffect, useMemo } from 'react';
import { Tokenizer } from '../services/tql/Tokenizer';
import { Parser } from '../services/tql/Parser';
import { Interpreter } from '../services/tql/Interpreter';
import { Token } from '../services/tql/types';
import { useDebounce } from './useDebounce';

const tokenizer = new Tokenizer();
const parser = new Parser();
const interpreter = new Interpreter();

export function useTQL<T>(data: T[], rawQuery: string) {
  const query = useDebounce(rawQuery, 300);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);

  const filteredData = useMemo(() => {
    if (!query.trim()) {
      setError(null);
      setTokens([]);
      return data;
    }

    try {
      const tokenList = tokenizer.tokenize(query);
      setTokens(tokenList);
      
      const ast = parser.parse(tokenList);
      setError(null);
      
      return data.filter(item => interpreter.evaluate(ast, item));
    } catch (e: any) {
      setError(e.message);
      return data; // Return all or empty on error? Usually all for better UX while typing
    }
  }, [data, query]);

  return { results: filteredData, error, tokens };
}
