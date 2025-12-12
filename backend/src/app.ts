
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { graphqlHTTP } from 'express-graphql';
import { config } from './config/config';
import routes from './routes/v1';
import { errorHandler } from './middleware/error.middleware';
import { schema, rootResolver, createLoaders, formatError } from './graphql';
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

// GraphQL Endpoint with DataLoaders and enhanced context
app.use('/graphql', async (req, res, next) => {
  // Attempt authentication but don't block request
  // This allows public queries while protecting sensitive operations
  // IMPORTANT: All protected GraphQL resolvers MUST check context.user
  try {
    await new Promise<void>((resolve) => {
      authenticate(req, res, (err?: any) => {
        // Continue regardless of auth result
        // Authenticated: req.user and req.permissions will be set
        // Unauthenticated: req.user will be undefined
        resolve();
      });
    });
  } catch (error) {
    // Authentication error - continue with unauthenticated request
    // Protected resolvers will reject operations requiring authentication
  }
  next();
}, graphqlHTTP((req) => {
  // Create fresh DataLoaders for each request to prevent caching across requests
  const loaders = createLoaders();

  return {
    schema: schema,
    rootValue: rootResolver,
    graphiql: config.env === 'development',
    context: {
      user: (req as any).user,
      permissions: (req as any).permissions,
      loaders,
      ip: req.ip || req.socket.remoteAddress,
      req
    },
    customFormatErrorFn: formatError
  };
}));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
