import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocialCapitalService } from './social-capital.service';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';
import { Message } from '../messages/entities/message.entity';
import { Meeting } from '../meetings/entities/meeting.entity';

describe('SocialCapitalService', () => {
  let service: SocialCapitalService;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockMatchRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockMessageRepository = {
    count: jest.fn(),
  };

  const mockMeetingRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialCapitalService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(Meeting),
          useValue: mockMeetingRepository,
        },
      ],
    }).compile();

    service = module.get<SocialCapitalService>(SocialCapitalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSocialCapital', () => {
    it('should calculate comprehensive social capital score', async () => {
      mockMatchRepository.count.mockResolvedValue(25);
      mockMessageRepository.count.mockResolvedValue(50);
      mockMeetingRepository.count.mockResolvedValue(10);

      const queryBuilder = mockMatchRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([
        {
          user1: { industries: ['Tech'] },
          user2: { industries: ['Finance'] },
        },
      ]);

      const result = await service.calculateSocialCapital('user-123');

      expect(result).toHaveProperty('userId', 'user-123');
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('rank');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('badges');
      expect(result).toHaveProperty('level');
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getRank', () => {
    it('should return correct rank for score', () => {
      expect(service['getRank'](95)).toBe('Maven');
      expect(service['getRank'](80)).toBe('Influencer');
      expect(service['getRank'](65)).toBe('Connector');
      expect(service['getRank'](45)).toBe('Networker');
      expect(service['getRank'](20)).toBe('Beginner');
    });
  });

  describe('calculateBadges', () => {
    it('should award badges based on achievements', async () => {
      mockMatchRepository.count.mockResolvedValue(15);
      mockMeetingRepository.count.mockResolvedValue(7);

      const badges = await service['calculateBadges']('user-123');

      expect(badges).toContain('First Connection');
      expect(badges).toContain('Rising Networker');
      expect(badges).toContain('Meeting Master');
    });

    it('should award legend badge for 100+ connections', async () => {
      mockMatchRepository.count.mockResolvedValue(150);
      mockMeetingRepository.count.mockResolvedValue(25);

      const badges = await service['calculateBadges']('user-123');

      expect(badges).toContain('Networking Legend');
      expect(badges).toContain('Calendar Champion');
    });
  });
});

