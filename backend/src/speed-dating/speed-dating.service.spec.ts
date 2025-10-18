import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpeedDatingService } from './speed-dating.service';
import { SpeedDatingSession } from './entities/speed-dating-session.entity';

describe('SpeedDatingService', () => {
  let service: SpeedDatingService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeedDatingService,
        {
          provide: getRepositoryToken(SpeedDatingSession),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SpeedDatingService>(SpeedDatingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new speed dating session', async () => {
      const createDto = {
        eventId: 'event-123',
        title: 'Business Speed Networking',
        scheduledAt: new Date(),
        roundDurationMinutes: 5,
        totalRounds: 10,
        maxParticipants: 30,
      };

      const session = { id: 'session-123', ...createDto };

      mockRepository.create.mockReturnValue(session);
      mockRepository.save.mockResolvedValue(session);

      const result = await service.createSession(createDto);

      expect(result).toEqual(session);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('joinSession', () => {
    it('should allow user to join session', async () => {
      const session = {
        id: 'session-123',
        maxParticipants: 30,
        participantIds: ['user-1', 'user-2'],
      };

      mockRepository.findOne.mockResolvedValue(session);
      mockRepository.save.mockResolvedValue({
        ...session,
        participantIds: [...session.participantIds, 'user-3'],
      });

      const result = await service.joinSession('session-123', 'user-3');

      expect(result.participantIds).toContain('user-3');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error if session is full', async () => {
      const session = {
        id: 'session-123',
        maxParticipants: 2,
        participantIds: ['user-1', 'user-2'],
      };

      mockRepository.findOne.mockResolvedValue(session);

      await expect(service.joinSession('session-123', 'user-3')).rejects.toThrow(
        'Session is full',
      );
    });

    it('should throw error if already joined', async () => {
      const session = {
        id: 'session-123',
        maxParticipants: 30,
        participantIds: ['user-1', 'user-2'],
      };

      mockRepository.findOne.mockResolvedValue(session);

      await expect(service.joinSession('session-123', 'user-1')).rejects.toThrow(
        'Already joined',
      );
    });
  });

  describe('generatePairings', () => {
    it('should generate round-robin pairings', async () => {
      const session = {
        id: 'session-123',
        totalRounds: 3,
        participantIds: ['user-1', 'user-2', 'user-3', 'user-4'],
        pairings: [],
      };

      mockRepository.findOne.mockResolvedValue(session);
      mockRepository.save.mockImplementation((s) => Promise.resolve(s));

      const result = await service.generatePairings('session-123');

      expect(result.pairings).toBeDefined();
      expect(result.pairings.length).toBeGreaterThan(0);
      expect(result.pairings[0]).toHaveProperty('round');
      expect(result.pairings[0]).toHaveProperty('user1Id');
      expect(result.pairings[0]).toHaveProperty('user2Id');
    });
  });

  describe('getCurrentPairing', () => {
    it('should return current round pairing', async () => {
      const session = {
        id: 'session-123',
        scheduledAt: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
        roundDurationMinutes: 5,
        totalRounds: 10,
        pairings: [
          { round: 1, user1Id: 'user-1', user2Id: 'user-2' },
          { round: 2, user1Id: 'user-1', user2Id: 'user-3' },
        ],
      };

      mockRepository.findOne.mockResolvedValue(session);

      const result = await service.getCurrentPairing('session-123', 'user-1');

      expect(result).toBeDefined();
      expect(result.round).toBe(2); // Should be in round 2
      expect(result.pairing).toBeDefined();
    });
  });
});

