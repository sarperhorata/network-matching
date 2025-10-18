import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MeetingsService } from './meetings.service';
import { Meeting } from './entities/meeting.entity';
import { NotFoundException } from '@nestjs/common';

describe('MeetingsService', () => {
  let service: MeetingsService;

  const mockMeetingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        {
          provide: getRepositoryToken(Meeting),
          useValue: mockMeetingRepository,
        },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new meeting', async () => {
      const createMeetingDto = {
        participant2Id: 'user-2',
        scheduledAt: new Date(),
        location: 'Coffee Shop',
        agenda: 'Discuss partnership',
      };
      const userId = 'user-1';

      const meeting = {
        id: 'meeting-123',
        participant1Id: userId,
        ...createMeetingDto,
        status: 'pending',
      };

      mockMeetingRepository.create.mockReturnValue(meeting);
      mockMeetingRepository.save.mockResolvedValue(meeting);

      const result = await service.create(createMeetingDto, userId);

      expect(result).toEqual(meeting);
      expect(mockMeetingRepository.create).toHaveBeenCalled();
      expect(mockMeetingRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of meetings for user', async () => {
      const userId = 'user-123';
      const meetings = [
        { id: '1', participant1Id: userId },
        { id: '2', participant2Id: userId },
      ];

      const queryBuilder = mockMeetingRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(meetings);

      const result = await service.findAll(userId);

      expect(result).toEqual(meetings);
    });
  });

  describe('acceptMeeting', () => {
    it('should accept a meeting', async () => {
      const meetingId = 'meeting-123';
      const userId = 'user-2';
      const meeting = {
        id: meetingId,
        participant2Id: userId,
        status: 'pending',
      };

      mockMeetingRepository.findOne.mockResolvedValue(meeting);
      mockMeetingRepository.save.mockResolvedValue({
        ...meeting,
        status: 'confirmed',
      });

      const result = await service.acceptMeeting(meetingId, userId);

      expect(result.status).toBe('confirmed');
      expect(mockMeetingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if meeting not found', async () => {
      mockMeetingRepository.findOne.mockResolvedValue(null);

      await expect(
        service.acceptMeeting('invalid-id', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('declineMeeting', () => {
    it('should decline a meeting', async () => {
      const meetingId = 'meeting-123';
      const userId = 'user-2';
      const meeting = {
        id: meetingId,
        participant2Id: userId,
        status: 'pending',
      };

      mockMeetingRepository.findOne.mockResolvedValue(meeting);
      mockMeetingRepository.save.mockResolvedValue({
        ...meeting,
        status: 'declined',
      });

      const result = await service.declineMeeting(meetingId, userId);

      expect(result.status).toBe('declined');
    });
  });

  describe('completeMeeting', () => {
    it('should mark meeting as completed', async () => {
      const meetingId = 'meeting-123';
      const userId = 'user-1';
      const meeting = {
        id: meetingId,
        participant1Id: userId,
        status: 'confirmed',
      };

      mockMeetingRepository.findOne.mockResolvedValue(meeting);
      mockMeetingRepository.save.mockResolvedValue({
        ...meeting,
        status: 'completed',
      });

      const result = await service.completeMeeting(meetingId, userId);

      expect(result.status).toBe('completed');
    });
  });

  describe('generateCalendarLink', () => {
    it('should generate iCal calendar link', () => {
      const meeting = {
        id: 'meeting-123',
        scheduledAt: new Date('2025-12-01T10:00:00Z'),
        location: 'Coffee Shop',
        agenda: 'Business Discussion',
        participant1: { firstName: 'John', lastName: 'Doe' },
        participant2: { firstName: 'Jane', lastName: 'Smith' },
      };

      const result = service.generateCalendarLink(meeting as any);

      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('BEGIN:VEVENT');
      expect(result).toContain('Business Discussion');
      expect(result).toContain('Coffee Shop');
      expect(result).toContain('END:VEVENT');
      expect(result).toContain('END:VCALENDAR');
    });
  });
});

