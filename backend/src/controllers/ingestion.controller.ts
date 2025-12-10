
import { Request, Response } from 'express';
import { ParserService } from '../services/ingestion/parser.service';

interface IngestBody {
  content: string;
  format: string;
}

export const parseData = async (req: Request, res: Response) => {
  try {
    const { content, format } = req.body as IngestBody;
    
    // Validate format before passing
    if (!['STIX', 'CSV', 'VULN_SCAN'].includes(format)) {
        return res.status(400).json({ error: 'Invalid format provided.' });
    }

    const result = ParserService.parseText(content, format);
    res.json({ data: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Parsing failed' });
  }
};
