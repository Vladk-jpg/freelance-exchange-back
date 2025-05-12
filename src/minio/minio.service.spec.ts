import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

const mockMinioClient = {
  bucketExists: jest.fn(),
  makeBucket: jest.fn(),
  putObject: jest.fn(),
  getObject: jest.fn(),
  removeObject: jest.fn(),
  listObjects: jest.fn(),
  presignedUrl: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      MINIO_ENDPOINT: 'localhost',
      MINIO_PORT: 9000,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config[key];
  }),
};

describe('MinioService', () => {
  let service: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: 'MINIO_CLIENT',
          useValue: mockMinioClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ensureBucket', () => {
    it('should create bucket if not exists', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockResolvedValue(undefined);

      await service.ensureBucket('test-bucket');

      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('test-bucket');
      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith(
        'test-bucket',
        'us-east-1',
      );
    });
  });

  describe('upload', () => {
    it('should upload buffer to bucket', async () => {
      const buffer = Buffer.from('test-data');
      mockMinioClient.putObject.mockResolvedValue(undefined);

      await service.upload('bucket', 'file.txt', buffer);

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        'bucket',
        'file.txt',
        buffer,
        buffer.length,
        undefined,
      );
    });
  });

  describe('download', () => {
    it('should return stream from getObject', async () => {
      const stream = new Readable();
      mockMinioClient.getObject.mockResolvedValue(stream);

      const result = await service.download('bucket', 'file.txt');
      expect(result).toBe(stream);
    });
  });

  describe('getPublicUrl', () => {
    it('should return correct public url', () => {
      const url = service.getPublicUrl('bucket', 'file.txt');
      expect(url).toBe('http://localhost:9000/bucket/file.txt');
    });
  });

  describe('getPresignedUrl', () => {
    it('should return presigned url', async () => {
      mockMinioClient.presignedUrl.mockResolvedValue(
        'http://example.com/presigned',
      );

      const result = await service.getPresignedUrl('bucket', 'file.txt');
      expect(result).toBe('http://example.com/presigned');
    });
  });

  describe('remove', () => {
    it('should remove object from bucket', async () => {
      mockMinioClient.removeObject.mockResolvedValue(undefined);

      await service.remove('bucket', 'file.txt');
      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        'bucket',
        'file.txt',
      );
    });
  });
});
