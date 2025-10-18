import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TravelBuddyService } from './travel-buddy.service';
import { TravelInfo } from './entities/travel-info.entity';

describe('TravelBuddyService', () => {
  let service: TravelBuddyService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelBuddyService,
        {
          provide: getRepositoryToken(TravelInfo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TravelBuddyService>(TravelBuddyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveTravelInfo', () => {
    it('should save new travel info', async () => {
      const travelData = {
        departureCity: 'Istanbul',
        arrivalCity: 'Ankara',
        arrivalDate: new Date(),
        flightNumber: 'TK123',
        interestedInDinner: true,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        userId: 'user-123',
        eventId: 'event-123',
        ...travelData,
      });
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.saveTravelInfo(
        'user-123',
        'event-123',
        travelData,
      );

      expect(result).toBeDefined();
      expect(result.departureCity).toBe('Istanbul');
    });

    it('should update existing travel info', async () => {
      const existing = {
        id: '1',
        userId: 'user-123',
        eventId: 'event-123',
        departureCity: 'Istanbul',
      };

      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.saveTravelInfo('user-123', 'event-123', {
        arrivalDate: new Date(),
      });

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findTravelBuddies', () => {
    it('should find same flight travelers', async () => {
      const userTravel = {
        userId: 'user-1',
        eventId: 'event-123',
        flightNumber: 'TK123',
        arrivalDate: new Date('2025-12-01'),
        user: { id: 'user-1', firstName: 'John' },
      };

      const otherTravelers = [
        {
          userId: 'user-2',
          flightNumber: 'TK123', // Same flight!
          arrivalDate: new Date('2025-12-01'),
          user: { id: 'user-2', firstName: 'Jane' },
        },
        {
          userId: 'user-3',
          flightNumber: 'TK456', // Different flight
          arrivalDate: new Date('2025-12-01'),
          user: { id: 'user-3', firstName: 'Bob' },
        },
      ];

      mockRepository.findOne.mockResolvedValue(userTravel);
      mockRepository.find.mockResolvedValue([userTravel, ...otherTravelers]);

      const result = await service.findTravelBuddies('user-1', 'event-123');

      expect(result).toBeInstanceOf(Array);
      const sameFlightMatch = result.find((m) => m.matchType === 'same_flight');
      expect(sameFlightMatch).toBeDefined();
      expect(sameFlightMatch?.user.id).toBe('user-2');
      expect(sameFlightMatch?.similarity).toBe(100);
    });

    it('should find same day arrival travelers', async () => {
      const arrivalDate = new Date('2025-12-01T10:00:00Z');

      const userTravel = {
        userId: 'user-1',
        eventId: 'event-123',
        arrivalDate,
        user: { id: 'user-1', firstName: 'John' },
      };

      const otherTravelers = [
        {
          userId: 'user-2',
          arrivalDate: new Date('2025-12-01T14:00:00Z'), // Same day!
          user: { id: 'user-2', firstName: 'Jane' },
        },
      ];

      mockRepository.findOne.mockResolvedValue(userTravel);
      mockRepository.find.mockResolvedValue([userTravel, ...otherTravelers]);

      const result = await service.findTravelBuddies('user-1', 'event-123');

      const sameDayMatch = result.find((m) => m.matchType === 'same_day');
      expect(sameDayMatch).toBeDefined();
      expect(sameDayMatch?.similarity).toBe(90);
    });

    it('should match roommate seekers', async () => {
      const arrivalDate = new Date('2025-12-01');

      const userTravel = {
        userId: 'user-1',
        eventId: 'event-123',
        arrivalDate,
        lookingForRoommate: true,
        user: { id: 'user-1', firstName: 'John' },
      };

      const otherTravelers = [
        {
          userId: 'user-2',
          arrivalDate,
          lookingForRoommate: true,
          user: { id: 'user-2', firstName: 'Jane' },
        },
      ];

      mockRepository.findOne.mockResolvedValue(userTravel);
      mockRepository.find.mockResolvedValue([userTravel, ...otherTravelers]);

      const result = await service.findTravelBuddies('user-1', 'event-123');

      const roommateMatch = result.find((m) => m.matchType === 'accommodation');
      expect(roommateMatch).toBeDefined();
      expect(roommateMatch?.similarity).toBe(95);
    });
  });
});

