import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserIsBotAdminGuard } from './guards/user-is-bot-admin.guard';
import { UserCanUseBotGuard } from './guards/user-can-use-bot.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [UsersService, UserIsBotAdminGuard, UserCanUseBotGuard],
  exports: [UsersService, UserIsBotAdminGuard, UserCanUseBotGuard],
})
export class UsersModule {}
