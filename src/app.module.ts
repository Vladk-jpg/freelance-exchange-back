import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { BcryptModule } from './services/bcrypt/bcrypt.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { CategoryModule } from './category/category.module';
import { ProposalModule } from './proposal/proposal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const config = configService.get<TypeOrmModuleOptions>('typeorm');
        if (!config) {
          throw new Error('TypeORM config not found');
        }
        return config;
      },
    }),
    AuthModule,
    BcryptModule,
    UserModule,
    ProjectModule,
    CategoryModule,
    ProposalModule,
  ],
})
export class AppModule {}
