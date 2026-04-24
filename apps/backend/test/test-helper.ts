import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

export class TestHelper {
  private app: INestApplication;

  async initApp(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
  }

  getApp(): INestApplication {
    return this.app;
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  request() {
    return request(this.getHttpServer());
  }

  async getAuthToken(userType: 'user' | 'claw' = 'user'): Promise<string> {
    if (userType === 'user') {
      const response = await this.request()
        .post('/users/register')
        .send({
          username: `testuser_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'TestPass123!',
        });
      return response.body.accessToken;
    } else {
      const response = await this.request()
        .post('/auth/register')
        .send({
          clawId: `test_claw_${Date.now()}`,
          name: 'Test Claw',
          publicKey: 'test_public_key',
          signature: 'test_signature',
        });
      return response.body.accessToken;
    }
  }
}

export const testHelper = new TestHelper();
