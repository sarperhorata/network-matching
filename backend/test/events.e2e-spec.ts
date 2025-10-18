import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let eventId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and login a test user
    const testUser = {
      email: `organizer-${Date.now()}@example.com`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'Organizer',
      role: 'organizer',
      company: 'Test Company',
      industries: ['Technology'],
      interests: ['AI'],
      networkingGoals: ['Organize Events'],
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/events (POST)', () => {
    it('should create a new event', () => {
      const event = {
        title: 'Tech Conference 2025',
        description: 'Annual technology conference',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Istanbul Convention Center',
        categories: ['Technology Conference'],
        capacity: 500,
        isPublic: true,
        requiresApproval: false,
      };

      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(event)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(event.title);
          expect(res.body.organizerId).toBe(userId);
          eventId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({
          title: 'Test Event',
          startDate: new Date(),
          endDate: new Date(),
        })
        .expect(401);
    });
  });

  describe('/events (GET)', () => {
    it('should get all events', () => {
      return request(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter events by category', () => {
      return request(app.getHttpServer())
        .get('/events?category=Technology Conference')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/events/:id (GET)', () => {
    it('should get event by id', () => {
      return request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(eventId);
          expect(res.body.title).toBeDefined();
        });
    });

    it('should return 404 for non-existent event', () => {
      return request(app.getHttpServer())
        .get('/events/non-existent-id')
        .expect(404);
    });
  });

  describe('/events/:id/join (POST)', () => {
    it('should allow user to join event', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/join`)
        .expect(401);
    });
  });

  describe('/events/:id/check-in (POST)', () => {
    it('should check in user to event', () => {
      return request(app.getHttpServer())
        .post(`/events/${eventId}/check-in`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });
  });

  describe('/events/:id (PUT)', () => {
    it('should update event', () => {
      return request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Tech Conference 2025',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Tech Conference 2025');
        });
    });

    it('should fail for non-organizer', async () => {
      // Create a new participant user
      const participant = {
        email: `participant-${Date.now()}@example.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'Participant',
        role: 'participant',
        company: 'Test Company',
        industries: ['Technology'],
        interests: ['AI'],
        networkingGoals: ['Networking'],
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(participant);

      const participantToken = response.body.access_token;

      return request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          title: 'Hacked Event',
        })
        .expect(403);
    });
  });
});

