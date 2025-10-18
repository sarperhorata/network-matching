import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { User } from '../users/entities/user.entity';

describe('MatchesService', () => {
  let service: MatchesService;

  const mockMatchRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateMatchScore', () => {
    it('should calculate match score correctly', () => {
      const user1 = {
        industries: ['Technology', 'Finance'],
        interests: ['AI', 'Blockchain', 'Web3'],
        networkingGoals: ['Find Business Partners', 'Networking'],
      };

      const user2 = {
        industries: ['Technology', 'Healthcare'],
        interests: ['AI', 'Machine Learning', 'Web3'],
        networkingGoals: ['Find Business Partners', 'Learn'],
      };

      const result = service.calculateMatchScore(user1 as any, user2 as any);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('reasons');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.reasons).toBeInstanceOf(Array);
    });

    it('should return 0 score for no matches', () => {
      const user1 = {
        industries: ['Technology'],
        interests: ['AI'],
        networkingGoals: ['Networking'],
      };

      const user2 = {
        industries: ['Healthcare'],
        interests: ['Medicine'],
        networkingGoals: ['Learn'],
      };

      const result = service.calculateMatchScore(user1 as any, user2 as any);

      expect(result.score).toBe(0);
    });

    it('should return perfect score for identical users', () => {
      const user = {
        industries: ['Technology', 'Finance', 'Healthcare'],
        interests: ['AI', 'Blockchain', 'Web3'],
        networkingGoals: ['Find Business Partners', 'Networking', 'Learn'],
      };

      const result = service.calculateMatchScore(user as any, user as any);

      expect(result.score).toBe(100);
    });
  });

  describe('generateMatches', () => {
    it('should generate matches for event', async () => {
      const eventId = 'event-123';
      const users = [
        {
          id: '1',
          industries: ['Technology'],
          interests: ['AI'],
          networkingGoals: ['Networking'],
        },
        {
          id: '2',
          industries: ['Technology'],
          interests: ['AI'],
          networkingGoals: ['Networking'],
        },
      ];

      mockUserRepository.find.mockResolvedValue(users);
      mockMatchRepository.findOne.mockResolvedValue(null);
      mockMatchRepository.create.mockImplementation((match) => match);
      mockMatchRepository.save.mockImplementation((match) =>
        Promise.resolve(match),
      );

      const result = await service.generateMatches(eventId);

      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
      expect(mockMatchRepository.save).toHaveBeenCalled();
    });
  });

  describe('acceptMatch', () => {
    it('should accept a match', async () => {
      const matchId = 'match-123';
      const userId = 'user-123';
      const match = {
        id: matchId,
        user1Id: userId,
        status: 'pending',
      };

      mockMatchRepository.findOne.mockResolvedValue(match);
      mockMatchRepository.save.mockResolvedValue({
        ...match,
        status: 'accepted',
      });

      const result = await service.acceptMatch(matchId, userId);

      expect(result.status).toBe('accepted');
      expect(mockMatchRepository.save).toHaveBeenCalled();
    });
  });

  describe('declineMatch', () => {
    it('should decline a match', async () => {
      const matchId = 'match-123';
      const userId = 'user-123';
      const match = {
        id: matchId,
        user1Id: userId,
        status: 'pending',
      };

      mockMatchRepository.findOne.mockResolvedValue(match);
      mockMatchRepository.save.mockResolvedValue({
        ...match,
        status: 'declined',
      });

      const result = await service.declineMatch(matchId, userId);

      expect(result.status).toBe('declined');
      expect(mockMatchRepository.save).toHaveBeenCalled();
    });
  });

  describe('getMyMatches', () => {
    it('should return user matches', async () => {
      const userId = 'user-123';
      const matches = [
        { id: '1', user1Id: userId, score: 85 },
        { id: '2', user2Id: userId, score: 75 },
      ];

      const queryBuilder = mockMatchRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(matches);

      const result = await service.getMyMatches(userId);

      expect(result).toEqual(matches);
    });
  });
});

