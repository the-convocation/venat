import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from './entities/user.entity';
import { User as DiscordUser } from 'discord.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  // todo: implement some in-memory cache?
  async find(id: string | number | DiscordUser): Promise<UserEntity | null> {
    if (id instanceof DiscordUser) {
      id = parseInt(id.id);
    } else if (typeof id === 'string') {
      id = parseInt(id);
    }

    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
