import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const createDto = {
        userId: 'user-123',
        type: NotificationType.MATCH,
        title: 'Yeni Eşleşme!',
        message: '%85 uyumla yeni bir eşleşmeniz var!',
      };

      const notification = { id: 'notif-123', ...createDto };

      mockNotificationRepository.create.mockReturnValue(notification);
      mockNotificationRepository.save.mockResolvedValue(notification);

      const result = await service.create(createDto);

      expect(result).toEqual(notification);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return user notifications', async () => {
      const userId = 'user-123';
      const notifications = [
        { id: '1', title: 'Test 1', isRead: false },
        { id: '2', title: 'Test 2', isRead: true },
      ];

      const queryBuilder = mockNotificationRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(notifications);

      const result = await service.findByUser(userId, 50, false);

      expect(result).toEqual(notifications);
    });

    it('should filter by unread only', async () => {
      const userId = 'user-123';
      const queryBuilder = mockNotificationRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findByUser(userId, 50, true);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.isRead = :isRead',
        { isRead: false },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-123');

      expect(result).toBe(5);
      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRead: false,
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = {
        id: 'notif-123',
        userId: 'user-123',
        isRead: false,
      };

      mockNotificationRepository.findOne.mockResolvedValue(notification);
      mockNotificationRepository.save.mockResolvedValue({
        ...notification,
        isRead: true,
        readAt: expect.any(Date),
      });

      const result = await service.markAsRead('notif-123', 'user-123');

      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
    });

    it('should throw error if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsRead('invalid-id', 'user-123'),
      ).rejects.toThrow();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const queryBuilder = mockNotificationRepository.createQueryBuilder();

      await service.markAllAsRead('user-123');

      expect(queryBuilder.update).toHaveBeenCalled();
      expect(queryBuilder.set).toHaveBeenCalled();
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('helper methods', () => {
    it('should create match notification', async () => {
      mockNotificationRepository.create.mockReturnValue({});
      mockNotificationRepository.save.mockResolvedValue({});

      await service.notifyNewMatch('user-123', 'user-456', 85);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.MATCH,
          title: 'Yeni Eşleşme!',
        }),
      );
    });

    it('should create message notification', async () => {
      mockNotificationRepository.create.mockReturnValue({});
      mockNotificationRepository.save.mockResolvedValue({});

      await service.notifyNewMessage('user-123', 'user-456', 'John Doe');

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.MESSAGE,
          title: 'Yeni Mesaj',
        }),
      );
    });

    it('should create event reminder notification', async () => {
      mockNotificationRepository.create.mockReturnValue({});
      mockNotificationRepository.save.mockResolvedValue({});

      await service.notifyEventReminder(
        'user-123',
        'event-456',
        'Tech Conference',
        2,
      );

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.EVENT,
          title: 'Etkinlik Hatırlatıcısı',
        }),
      );
    });

    it('should create meeting request notification', async () => {
      mockNotificationRepository.create.mockReturnValue({});
      mockNotificationRepository.save.mockResolvedValue({});

      await service.notifyMeetingRequest(
        'user-123',
        'meeting-456',
        'Jane Smith',
      );

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.MEETING,
          title: 'Yeni Toplantı Daveti',
        }),
      );
    });
  });
});

