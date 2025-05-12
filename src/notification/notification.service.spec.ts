import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getModelToken } from '@nestjs/mongoose';
import { Notification } from 'src/database/schemas/notification.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Model } from 'mongoose';

describe('NotificationService', () => {
  let service: NotificationService;
  let eventEmitter: EventEmitter2;

  const mockNotification = {
    _id: 'notification_id_1',
    title: 'Test Notification',
    content: 'This is a test notification',
    userId: 'user_id_1',
    isRead: false,
    createdAt: new Date(),
  };

  const mockSave = jest.fn().mockResolvedValue(mockNotification);

  // Создаем отдельные функции для каждого метода
  const mockFind = jest.fn(() => ({
    sort: jest.fn(() => ({
      exec: jest.fn().mockResolvedValue([mockNotification]),
    })),
  }));

  const mockFindById = jest.fn(() => ({
    exec: jest.fn().mockResolvedValue(mockNotification),
  }));

  const mockFindByIdAndDelete = jest.fn(() => ({
    exec: jest.fn().mockResolvedValue(mockNotification),
  }));

  const mockFindByIdAndUpdate = jest.fn(() => ({
    exec: jest.fn().mockResolvedValue({ ...mockNotification, isRead: true }),
  }));

  // Создаем мок модели как функцию-конструктор
  const mockNotificationModel = function (dto: CreateNotificationDto) {
    return {
      ...dto,
      isRead: false,
      createdAt: new Date(),
      save: mockSave,
    };
  } as unknown as Model<Notification>;

  // Добавляем методы к функции-конструктору
  Object.assign(mockNotificationModel, {
    find: mockFind,
    findById: mockFindById,
    findByIdAndDelete: mockFindByIdAndDelete,
    findByIdAndUpdate: mockFindByIdAndUpdate,
  });

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    const createNotificationDto: CreateNotificationDto = {
      userId: 'user_id_1',
      title: 'New Notification',
      content: 'Notification content',
    };

    it('should create a new notification with correct properties', async () => {
      const result = await service.createNotification(createNotificationDto);

      expect(result).toEqual(mockNotification);
      expect(result.isRead).toBe(false);
      expect(result.createdAt).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle errors during notification creation', async () => {
      const error = new Error('Database error');
      mockSave.mockRejectedValueOnce(error);

      await expect(
        service.createNotification(createNotificationDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('handleNotificationCreateEvent', () => {
    const createNotificationDto: CreateNotificationDto = {
      userId: 'user_id_1',
      title: 'Event Notification',
      content: 'Event notification content',
    };

    it('should create notification when event is handled', async () => {
      await service.handleNotificationCreateEvent(createNotificationDto);

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('emitNotificationEvent', () => {
    const createNotificationDto: CreateNotificationDto = {
      userId: 'user_id_1',
      title: 'Event Notification',
      content: 'Event notification content',
    };

    it('should emit notification.create event with correct payload', () => {
      const emitSpy = jest.spyOn(eventEmitter, 'emit');
      service.emitNotificationEvent(createNotificationDto);

      expect(emitSpy).toHaveBeenCalledWith(
        'notification.create',
        createNotificationDto,
      );
    });
  });

  describe('getUnreadNotifications', () => {
    const userId = 'user_id_1';
    const mockNotifications = [mockNotification];

    it('should return unread notifications for user sorted by createdAt desc', async () => {
      const result = await service.getUnreadNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockFind).toHaveBeenCalledWith({
        userId,
        isRead: false,
      });
    });

    it('should return empty array when no unread notifications found', async () => {
      mockFind.mockReturnValueOnce({
        sort: jest.fn(() => ({
          exec: jest.fn().mockResolvedValue([]),
        })),
      });

      const result = await service.getUnreadNotifications(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    const notificationId = 'notification_id_1';

    it('should return notification by id', async () => {
      const result = await service.findById(notificationId);

      expect(result).toEqual(mockNotification);
      expect(mockFindById).toHaveBeenCalledWith(notificationId);
    });

    it('should return null when notification not found', async () => {
      mockFindById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById('nonexistent_id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    const notificationId = 'notification_id_1';

    it('should delete notification by id', async () => {
      const result = await service.delete(notificationId);

      expect(result).toEqual(mockNotification);
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(notificationId);
    });

    it('should return null when notification to delete not found', async () => {
      mockFindByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.delete('nonexistent_id');

      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notification_id_1';
    const updatedNotification = { ...mockNotification, isRead: true };

    it('should mark notification as read', async () => {
      const result = await service.markAsRead(notificationId);

      expect(result).toEqual(updatedNotification);
      expect(result?.isRead).toBe(true);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { isRead: true },
        { new: true },
      );
    });

    it('should return null when notification to mark as read not found', async () => {
      mockFindByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.markAsRead('nonexistent_id');

      expect(result).toBeNull();
    });
  });
});
