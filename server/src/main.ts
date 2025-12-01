import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for GitHub Codespaces
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Sentinel CyberIntel API')
    .setDescription('Cyber Intelligence Platform API')
    .setVersion('1.0')
    .addTag('threats', 'Threat management')
    .addTag('cases', 'Case management')
    .addTag('actors', 'Threat actor management')
    .addTag('analysis', 'Analysis tools')
    .addTag('campaigns', 'Campaign management')
    .addTag('vulnerabilities', 'Vulnerability management')
    .addTag('system', 'System health and nodes')
    .addTag('users', 'User management')
    .addTag('reports', 'Reporting')
    .addTag('messaging', 'Messaging and channels')
    .addTag('evidence', 'Evidence management')
    .addTag('osint', 'OSINT operations')
    .addTag('orchestrator', 'Response orchestration')
    .addTag('ingestion', 'Data ingestion')
    .addTag('detection', 'Detection engineering')
    .addTag('feed', 'IoC feed management')
    .addTag('incidents', 'Incident response')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api`);
}
bootstrap();
