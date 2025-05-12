import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/database/schemas/notification.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notifModel(dto);
    notification.isRead = false;
    notification.createdAt = new Date();
    return notification.save();
  }

  @OnEvent('notification.create')
  async handleNotificationCreateEvent(payload: CreateNotificationDto) {
    await this.createNotification(payload);
  }

  emitNotificationEvent(dto: CreateNotificationDto) {
    this.eventEmitter.emit('notification.create', dto);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notifModel
      .find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifModel.findById(id).exec();
  }

  async delete(id: string): Promise<Notification | null> {
    return this.notifModel.findByIdAndDelete(id).exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notifModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();
  }
}
