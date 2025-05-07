import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import * as request from 'supertest';
import { Server } from 'http';
import { AppModule } from 'src/app.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { connectionSource } from 'src/config/typeorm';

dotenv.config({ path: '.env.test' });

const rolesGuardMock = { canActivate: () => true };

describe('Proposal Module (e2e with JWT)', () => {
  let app: INestApplication;
  let server: Server;
  let jwtTokenFreelancer: string;
  let jwtTokenClient: string;
  let testProjectId: string;
  let testProjectId2: string;
  let testProjectId3: string;
  let createdProposalId: string;
  let testCategoryId: string;

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

    const jwtService = new JwtService({
      secret: 'lirili larila',
    });

    const clientDto = {
      username: 'ClientUser',
      email: 'client@gmail.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'CLIENT',
    };
    const clientRes = await request(server)
      .post('/user/register')
      .send(clientDto)
      .expect(201);
    jwtTokenClient = jwtService.sign({
      id: clientRes.body.id as string,
      email: clientDto.email,
      role: clientDto.role,
    });

    const freelancerDto = {
      username: 'FreelancerUser',
      email: 'freelancer@gmail.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'FREELANCER',
    };
    const freelancerRes = await request(server)
      .post('/user/register')
      .send(freelancerDto)
      .expect(201);
    jwtTokenFreelancer = jwtService.sign({
      id: freelancerRes.body.id as string,
      email: freelancerDto.email,
      role: freelancerDto.role,
    });

    const categoryDto = { name: 'Test Category' };
    const categoryRes = await request(server)
      .post('/category')
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .send(categoryDto)
      .expect(201);
    testCategoryId = categoryRes.body.id as string;

    const projectDto = {
      title: 'Test Project',
      description: 'Test Description',
      price: '100.00',
      categoryId: testCategoryId,
    };
    const projectRes = await request(server)
      .post('/project')
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .send(projectDto)
      .expect(201);
    testProjectId = projectRes.body.id as string;

    const projectDto2 = {
      title: 'Test Project 2',
      description: 'Test Description 2',
      price: '200.00',
      categoryId: testCategoryId,
    };
    const projectRes2 = await request(server)
      .post('/project')
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .send(projectDto2)
      .expect(201);
    testProjectId2 = projectRes2.body.id as string;

    const projectDto3 = {
      title: 'Test Project 3',
      description: 'Test Description 3',
      price: '300.00',
      categoryId: testCategoryId,
    };
    const projectRes3 = await request(server)
      .post('/project')
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .send(projectDto3)
      .expect(201);
    testProjectId3 = projectRes3.body.id as string;
  });

  afterAll(async () => {
    await app.close();
    await connectionSource.dropDatabase();
    await connectionSource.destroy();
  });

  it('/proposal (POST) - create a proposal', async () => {
    const dto = {
      message: 'This is a test proposal',
      projectId: testProjectId,
    };
    const res = await request(server)
      .post('/proposal')
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .send(dto)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    createdProposalId = res.body.id as string;
  });

  it('/proposal (POST) - create another one proposal at the same project', async () => {
    const dto = {
      message: 'This is another test proposal',
      projectId: testProjectId,
    };
    await request(server)
      .post('/proposal')
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .send(dto)
      .expect(403);
  });

  it('/proposal/:id (PATCH) - update a proposal', async () => {
    const dto = { message: 'Updated proposal message' };
    const res = await request(server)
      .patch(`/proposal/${createdProposalId}`)
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .send(dto)
      .expect(200);
    expect(res.body.message).toBe(dto.message);
  });

  it('/proposal/freelancer (GET) - get proposals by freelancer', async () => {
    const res = await request(server)
      .get('/proposal/freelancer')
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/proposal/project/:id (GET) - get proposals by project', async () => {
    const res = await request(server)
      .get(`/proposal/project/${testProjectId}`)
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/proposal/:id (DELETE) - delete a proposal', async () => {
    const res = await request(server)
      .delete(`/proposal/${createdProposalId}`)
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .expect(200);
    expect(res.body).toEqual({ message: 'OK' });
  });

  it('/proposal/accept/:id (PATCH) - accept a proposal', async () => {
    const dto = {
      message: 'This is another test proposal',
      projectId: testProjectId2,
    };
    const newProposalRes = await request(server)
      .post('/proposal')
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .send(dto)
      .expect(201);
    const newProposalId = newProposalRes.body.id as string;

    const depositDto = {
      cardNumber: '4111111111111111',
      expirationDate: '12/25',
      cvv: '123',
      amount: 100000,
    };
    await request(server)
      .patch('/wallet/deposit')
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .send(depositDto)
      .expect(200);

    const res = await request(server)
      .patch(`/proposal/accept/${newProposalId}`)
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .expect(200);
    expect(res.body).toEqual({ message: 'OK' });

    const proposalRes = await request(server)
      .get(`/proposal/${newProposalId}`)
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .expect(200);
    expect(proposalRes.body.status).toBe('ACCEPTED');
  });

  it('/proposal/reject/:id (PATCH) - reject a proposal', async () => {
    const dto = {
      message: 'This is another test proposal',
      projectId: testProjectId3,
    };

    const newProposalRes = await request(server)
      .post('/proposal')
      .set('Authorization', `Bearer ${jwtTokenFreelancer}`)
      .send(dto)
      .expect(201);
    const newProposalId = newProposalRes.body.id as string;

    const res = await request(server)
      .patch(`/proposal/reject/${newProposalId}`)
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .expect(200);
    expect(res.body).toEqual({ message: 'OK' });

    const proposalRes = await request(server)
      .get(`/proposal/${newProposalId}`)
      .set('Authorization', `Bearer ${jwtTokenClient}`)
      .expect(200);
    expect(proposalRes.body.status).toBe('REJECTED');
  });
});
