export enum ConfigSubjectType {
  /**
   * Global configuration, to be used by the entire bot instance.
   * This is typically used to store bot-wide settings, like API keys.
   */
  Global = 'global',

  /**
   * Configuration for a specific guild.
   * This may store settings like role selection, moderation settings, etc.
   */
  Guild = 'guild',

  /**
   * Configuration for a specific user.
   * This may store settings like a user's preferred language.
   */
  User = 'user',
}
