/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import * as request from 'supertest';
import { Server } from 'http';
import { AppModule } from 'src/app.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { connectionSource } from 'src/config/typeorm';
import { Category } from 'src/database/entities/category.entity';
import { ProjectSort } from 'src/project/enums/project-sort.enum';
import { Project } from 'src/database/entities/project.entity';

dotenv.config({ path: '.env.test' });

const rolesGuardMock = { canActivate: () => true };

describe('Project Module (e2e with JWT)', () => {
  let app: INestApplication;
  let server: Server;
  let testUserId: string;
  let jwtToken: string;
  let jwtService: JwtService;
  let categories: Category[];
  const createdProjectIds: string[] = [];

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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    server = app.getHttpServer();
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await connectionSource.dropDatabase();
    await connectionSource.destroy();
  });

  it('/user/register (POST) - register and get JWT', async () => {
    const dto = {
      username: 'John123',
      email: 'mail@gmail.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'CLIENT',
    };
    const res = await request(server)
      .post('/user/register')
      .send(dto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    testUserId = res.body.id;
    jwtToken = jwtService.sign({
      id: testUserId,
      email: dto.email,
      role: dto.role,
    });
  });

  it('/category (POST) - create categories', async () => {
    const names = ['category1', 'category2', 'category3'];
    for (const name of names) {
      const res = await request(server)
        .post('/category')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name })
        .expect(201);
      expect(res.body.category).toBe(name);
    }
  });

  it('/category (GET) - get categories array', async () => {
    const res = await request(server).get('/category').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    categories = res.body;
    expect(categories.length).toBeGreaterThanOrEqual(3);
    expect(categories[0]).toHaveProperty('id');
  });

  it('/project (POST) - create multiple projects', async () => {
    const dtos = [
      {
        title: 'Project1',
        description: 'Description1',
        price: '99.99',
        categoryId: categories[0].id,
      },
      {
        title: 'Project2',
        description: 'Description2',
        price: '199.00',
        categoryId: categories[1].id,
      },
      {
        title: 'Project3',
        description: 'Description3',
        price: '299',
        categoryId: categories[2].id,
      },
      {
        title: 'Project4',
        description: 'Description4',
        price: '399.5',
        categoryId: categories[0].id,
      },
    ];
    for (const dto of dtos) {
      const res = await request(server)
        .post('/project')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(dto)
        .expect(201);
      expect(res.body).toHaveProperty('id');
      createdProjectIds.push(res.body.id as string);
    }
  });

  it('/project?limit&offset - pagination works', async () => {
    const limit = 2;
    const offset = 1;
    const res = await request(server)
      .get(`/project?limit=${limit}&offset=${offset}`)
      .expect(200);
    expect(res.body.data.length).toBeLessThanOrEqual(limit);
    expect(res.body.total).toBeGreaterThanOrEqual(createdProjectIds.length);
    expect(res.body.offset).toBe(offset);
    expect(res.body.limit).toBe(limit);
  });

  it('/project/search - partial title search', async () => {
    const res = await request(server)
      .get('/project/search?title=Project')
      .expect(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(res.body.data.every((p) => p.title.includes('Project'))).toBe(true);
  });

  it('/project/filter - filter by category and sort', async () => {
    const catId = categories[1].id;
    const res = await request(server)
      .get(
        `/project/filter?categories=${catId}&sortBy=${ProjectSort.CHEAPEST}&limit=10&offset=0`,
      )
      .expect(200);
    expect(res.body.data.every((p) => p.category.id === catId)).toBe(true);
  });

  it('/project/:id - get by id', async () => {
    const id = createdProjectIds[0];
    const res = await request(server).get(`/project/${id}`).expect(200);
    expect(res.body.id).toBe(id);
  });

  it('/project/user/:id - get by user id', async () => {
    const res = await request(server)
      .get(`/project/user/${testUserId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((p: Project) => p.client.id === testUserId)).toBe(
      true,
    );
  });

  it('/project/:id (PATCH) - update project', async () => {
    const id = createdProjectIds[1];
    const res = await request(server)
      .patch(`/project/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'UpdatedTitle' })
      .expect(200);
    expect(res.body.title).toBe('UpdatedTitle');
  });

  it('/project/:id (DELETE) - delete project', async () => {
    const id = createdProjectIds[2];
    const res = await request(server)
      .delete(`/project/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body).toEqual({ message: 'OK' });

    // Confirm deletion
    const notFound = await request(server).get(`/project/${id}`);
    expect(notFound.status).toBe(404);
  });
});
