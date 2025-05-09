import { Injectable, Logger, Inject } from '@nestjs/common';
import { Client } from 'minio';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioEndPoint: string;
  private readonly minioPort: number;

  constructor(
    @Inject('MINIO_CLIENT') private readonly client: Client,
    private readonly configService: ConfigService,
  ) {
    this.minioEndPoint = this.configService.get<string>(
      'MINIO_ENDPOINT',
      'localhost',
    );
    this.minioPort = this.configService.get<number>('MINIO_PORT', 9000);
  }

  async ensureBucket(bucket: string, region = 'us-east-1'): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket, region);
      this.logger.log(`Bucket "${bucket}" created in region "${region}"`);
    }
  }

  async upload(
    bucket: string,
    objectName: string,
    data: Buffer | Readable,
    meta?: Record<string, string>,
  ): Promise<void> {
    try {
      const size = data instanceof Buffer ? data.length : undefined;
      await this.client.putObject(bucket, objectName, data, size, meta);
      this.logger.log(`Uploaded object "${objectName}" to bucket "${bucket}"`);
    } catch (error) {
      this.logger.error(
        `Error uploading object "${objectName}" to bucket "${bucket}": ${error.message}`,
      );
      throw error;
    }
  }

  async download(
    bucket: string,
    objectName: string,
  ): Promise<NodeJS.ReadableStream> {
    return this.client.getObject(bucket, objectName);
  }

  async remove(bucket: string, objectName: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, objectName);
      this.logger.log(`Removed object "${objectName}" from bucket "${bucket}"`);
    } catch (error) {
      this.logger.error(
        `Error removing object "${objectName}" from bucket "${bucket}": ${error.message}`,
      );
      throw error;
    }
  }

  list(bucket: string, prefix = ''): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const objects: string[] = [];
      const stream = this.client.listObjects(bucket, prefix, false);

      stream.on('data', (obj) => {
        if (obj.name) {
          objects.push(obj.name);
        }
      });

      stream.on('end', () => {
        resolve(objects);
      });

      stream.on('error', (err) => {
        this.logger.error(
          `Error listing objects in bucket "${bucket}": ${err.message}`,
        );
        reject(err);
      });
    });
  }

  async getPresignedUrl(
    bucket: string,
    objectName: string,
    expires: number = 60,
  ): Promise<string> {
    try {
      const presignedUrl = await this.client.presignedUrl(
        'GET',
        bucket,
        objectName,
        expires,
      );
      return presignedUrl;
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL for object "${objectName}": ${error.message}`,
      );
      throw error;
    }
  }

  getPublicUrl(bucket: string, objectName: string): string {
    const fileUrl = `http://${this.minioEndPoint}:${this.minioPort}/${bucket}/${objectName}`;
    return fileUrl;
  }
}
