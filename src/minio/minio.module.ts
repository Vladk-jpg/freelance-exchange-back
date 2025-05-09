import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';
import { Client } from 'minio';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MINIO_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Client({
          endPoint: config.get<string>('MINIO_ENDPOINT', 'localhost'),
          port: config.get<number>('MINIO_PORT', 9000),
          useSSL: false,
          accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
          secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
        });
      },
      inject: [ConfigService],
    },
    MinioService,
  ],
  exports: ['MINIO_CLIENT', MinioService],
})
export class MinioModule {}
