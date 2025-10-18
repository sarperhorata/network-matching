import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SerendipityService } from './serendipity.service';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';

describe('SerendipityService', () => {
  let service: SerendipityService;

  const mockUserRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockMatchRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SerendipityService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
      ],
    }).compile();

    service = module.get<SerendipityService>(SerendipityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSerendipityScore', () => {
    it('should give high score for completely different industries', () => {
      const user1: any = {
        industries: ['Technology'],
        interests: ['AI'],
        networkingGoals: ['Find Partners'],
      };

      const user2: any = {
        industries: ['Fashion'],
        interests: ['Design'],
        networkingGoals: ['Find Partners'],
      };

      const score = service['calculateSerendipityScore'](user1, user2);

      expect(score).toBeGreaterThan(60); // High serendipity
    });

    it('should give low score for similar users', () => {
      const user1: any = {
        industries: ['Technology', 'AI'],
        interests: ['AI', 'ML', 'Data'],
        networkingGoals: ['Find Partners', 'Learn'],
      };

      const user2: any = {
        industries: ['Technology', 'Software'],
        interests: ['AI', 'ML', 'Cloud'],
        networkingGoals: ['Find Partners', 'Learn'],
      };

      const score = service['calculateSerendipityScore'](user1, user2);

      expect(score).toBeLessThan(50); // Low serendipity (too similar)
    });

    it('should give perfect score for maximum difference', () => {
      const user1: any = {
        industries: ['Technology'],
        interests: ['AI'],
        networkingGoals: ['Sell'],
      };

      const user2: any = {
        industries: ['Fashion'],
        interests: ['Design'],
        networkingGoals: ['Buy'],
      };

      const score = service['calculateSerendipityScore'](user1, user2);

      expect(score).toBeGreaterThanOrEqual(70);
    });
  });

  describe('generateSerendipityMatches', () => {
    it('should generate serendipitous matches', async () => {
      const user: any = {
        id: 'user-1',
        industries: ['Technology'],
        interests: ['AI'],
        networkingGoals: ['Find Partners'],
      };

      const eventParticipants = [
        {
          id: 'user-2',
          industries: ['Fashion'],
          interests: ['Design'],
          networkingGoals: ['Collaborate'],
        },
        {
          id: 'user-3',
          industries: ['Healthcare'],
          interests: ['Medicine'],
          networkingGoals: ['Research'],
        },
      ];

      mockUserRepository.findOne.mockResolvedValue(user);
      const queryBuilder = mockUserRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(eventParticipants);

      const result = await service.generateSerendipityMatches('event-123', 'user-1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('serendipityScore');
      expect(result[0]).toHaveProperty('reasons');
      expect(result[0]).toHaveProperty('type', 'serendipity');
    });
  });
});

