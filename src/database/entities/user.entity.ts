import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users') // Имя таблицы в базе данных (можно оставить по умолчанию, если нужно)
export class User {
  @PrimaryGeneratedColumn() // Первичный ключ
  id: number;

  @Column({ type: 'varchar', length: 255 }) // Поле для имени
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true }) // Поле для email с уникальностью
  email: string;

  @Column({ type: 'varchar', length: 255 }) // Поле для пароля
  password: string;

  @CreateDateColumn() // Дата создания записи
  createdAt: Date;

  @UpdateDateColumn() // Дата последнего обновления записи
  updatedAt: Date;
}
