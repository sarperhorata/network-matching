import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockParticipantRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(EventParticipant),
          useValue: mockParticipantRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        location: 'Test Location',
        categories: ['Technology Conference'],
        capacity: 100,
        isPublic: true,
        requiresApproval: false,
      };

      const userId = 'user-123';
      const event = { id: 'event-123', ...createEventDto, organizerId: userId };

      mockEventRepository.create.mockReturnValue(event);
      mockEventRepository.save.mockResolvedValue(event);

      const result = await service.create(createEventDto, userId);

      expect(result).toEqual(event);
      expect(mockEventRepository.create).toHaveBeenCalledWith({
        ...createEventDto,
        organizerId: userId,
      });
      expect(mockEventRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of events', async () => {
      const events = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];

      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll();

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const event = { id: '1', title: 'Test Event' };

      mockEventRepository.findOne.mockResolvedValue(event);

      const result = await service.findOne('1');

      expect(result).toEqual(event);
      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['organizer', 'participants', 'participants.user'],
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinEvent', () => {
    it('should allow user to join event', async () => {
      const event = {
        id: 'event-123',
        capacity: 100,
        participants: [{ id: '1' }],
      };
      const userId = 'user-123';

      mockEventRepository.findOne.mockResolvedValue(event);
      mockParticipantRepository.findOne.mockResolvedValue(null);
      mockParticipantRepository.create.mockReturnValue({
        eventId: event.id,
        userId,
        status: 'pending',
      });
      mockParticipantRepository.save.mockResolvedValue({});

      const result = await service.joinEvent(event.id, userId);

      expect(result).toBeDefined();
      expect(mockParticipantRepository.save).toHaveBeenCalled();
    });

    it('should throw error if event is full', async () => {
      const event = {
        id: 'event-123',
        capacity: 1,
        participants: [{ id: '1' }],
      };
      const userId = 'user-123';

      mockEventRepository.findOne.mockResolvedValue(event);

      await expect(service.joinEvent(event.id, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if already joined', async () => {
      const event = {
        id: 'event-123',
        capacity: 100,
        participants: [],
      };
      const userId = 'user-123';

      mockEventRepository.findOne.mockResolvedValue(event);
      mockParticipantRepository.findOne.mockResolvedValue({
        eventId: event.id,
        userId,
      });

      await expect(service.joinEvent(event.id, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkIn', () => {
    it('should check in user to event', async () => {
      const eventId = 'event-123';
      const userId = 'user-123';
      const participant = {
        eventId,
        userId,
        status: 'approved',
        checkedIn: false,
      };

      mockParticipantRepository.findOne.mockResolvedValue(participant);
      mockParticipantRepository.save.mockResolvedValue({
        ...participant,
        hasCheckedIn: true,
        checkInTime: new Date(),
      });

      const result = await service.checkIn(eventId, userId);

      expect(result.hasCheckedIn).toBe(true);
      expect(result.checkInTime).toBeDefined();
    });

    it('should throw error if participant not found', async () => {
      mockParticipantRepository.findOne.mockResolvedValue(null);

      await expect(service.checkIn('event-123', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

