import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { connectionSource } from 'src/config/typeorm';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Repository } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { UserStatus } from 'src/database/enums/user-status.enum';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'http';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

const rolesGuardMock = { canActivate: () => true };

describe('User Module (e2e with JWT)', () => {
  let app: INestApplication;
  let server: Server;
  let testUserId: string;
  let jwtToken: string;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectionSource.initialize();
    await connectionSource.synchronize(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();

    userRepo = connectionSource.getRepository(User);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await connectionSource.dropDatabase();
    await connectionSource.destroy();
  });

  it('/user/register (POST) - should register a new user', async () => {
    const dto = {
      username: 'John123',
      email: 'mail@gmail.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'CLIENT',
    };
    const res = await request(server).post('/user/register').send(dto);
    if (res.status !== 201) {
      console.error('Registration failed:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    testUserId = res.body.id;

    // Generate real JWT token for subsequent requests
    jwtToken = jwtService.sign({
      id: testUserId,
      email: dto.email,
      role: dto.role,
    });
  });

  it('/user/register (POST) - should not register a new user due to invalid data', async () => {
    const dto = {
      username: 'John123',
      email: 'mail@gmail.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'CLIENT',
    };
    const res = await request(server).post('/user/register').send(dto);
    if (res.status !== 409) {
      console.error('Registration failed:', res.body);
    }
    expect(res.status).toBe(409);
  });

  it('/user/profile (GET) - should return profile', () => {
    return request(server)
      .get('/user/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          username: 'John123',
          email: 'mail@gmail.com',
        });
      });
  });

  it('/user/update (PATCH) - should update username', () => {
    const dto = { username: 'updatedUser' };
    return request(server)
      .patch('/user')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(200)
      .expect(({ body }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(body.username).toBe('updatedUser');
      });
  });

  it('/user/soft-delete (PATCH) - should soft-delete the user', async () => {
    await request(server)
      .patch('/user/soft-delete')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const user = await userRepo.findOne({ where: { id: testUserId } });
    expect(user).not.toBeNull();
    expect(user!.status).toBe(UserStatus.DELETED);
  });
});
