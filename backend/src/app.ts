
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { graphqlHTTP } from 'express-graphql';
import { config } from './config/config';
import routes from './routes/v1';
import { errorHandler } from './middleware/error.middleware';
import { schema } from './graphql/schema';
import { rootResolver } from './graphql/resolvers';
import { authenticate } from './middleware/auth.middleware';

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for GraphiQL playground
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Logging
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);

// REST API Routes
app.use(config.apiPrefix, routes);

// GraphQL Endpoint
app.use('/graphql', (req, res, next) => {
  // Optional: Apply authentication middleware selectively or globally for GraphQL
  // For mixed public/private schemas, handle inside resolvers. 
  // Here we allow exploration but resolvers check context.
  authenticate(req, res, () => {
    // Proceed regardless of auth success for public parts of schema if any,
    // or rely on resolvers to check req.user
    next();
  });
}, graphqlHTTP((req) => ({
  schema: schema,
  rootValue: rootResolver,
  graphiql: config.env === 'development',
  context: {
    user: (req as any).user
  }
})));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
