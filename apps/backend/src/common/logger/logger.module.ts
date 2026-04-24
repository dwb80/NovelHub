import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') !== 'production';
        
        return {
          pinoHttp: {
            name: 'novelhub-backend',
            level: isDevelopment ? 'debug' : 'info',
            transport: isDevelopment
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
            formatters: {
              level: (label) => ({ level: label }),
              bindings: () => ({}),
            },
            serializers: {
              req: (req: any) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                headers: {
                  'user-agent': req.headers['user-agent'],
                  'content-type': req.headers['content-type'],
                },
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
              }),
              err: (err: any) => ({
                type: err.constructor?.name,
                message: err.message,
                stack: err.stack,
              }),
            },
            customProps: () => ({
              context: 'http',
              environment: configService.get('NODE_ENV', 'development'),
            }),
            customSuccessMessage: (req: any, res: any) => {
              return `${req.method} ${req.url} ${res.statusCode}`;
            },
            customErrorMessage: (req: any, res: any, error: any) => {
              return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
            },
            customAttributeKeys: {
              req: 'request',
              res: 'response',
              err: 'error',
              responseTime: 'responseTimeMs',
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.token',
                'req.body.accessToken',
                'req.body.refreshToken',
              ],
              censor: '[REDACTED]',
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
