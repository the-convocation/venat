import { DiscordGuard, EventType } from '@discord-nestjs/core';
import { UsersService } from '../users.service';
import { Message, User } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserIsBotAdminGuard implements DiscordGuard {
  constructor(private usersService: UsersService) {}

  public async canActive(
    event: EventType = 'interactionCreate',
    [message, user]: [Message, User],
  ): Promise<boolean> {
    const userEntity = await this.usersService.find(user);
    return userEntity?.isAdmin ?? false;
  }
}
