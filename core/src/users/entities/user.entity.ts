import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  /**
   * The Discord user ID/snowflake.
   */
  @PrimaryColumn()
  id!: number;

  /**
   * Is this Discord user an administrator of this bot instance?
   */
  // todo: replace this with roles in the future?
  @Column()
  isAdmin!: boolean;

  /**
   * Is this Discord user banned from using the bot?
   */
  @Column()
  isBanned!: boolean;
}
