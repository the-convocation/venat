import { Injectable, Logger, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import { ConfigSubjectType } from './config-subject-type.enum';
import * as Sentry from '@sentry/core';

export const CONFIG_SUBJECT_TYPE = 'config_subject_type';
export const CONFIG_SUBJECT = 'config_subject';

type ConfigMetadata = {
  subjectType: ConfigSubjectType;
  subject?: number;
};

@Injectable({ scope: Scope.TRANSIENT })
export class ConfigService {
  private readonly logger: Logger = new Logger(ConfigService.name);

  constructor(
    private readonly packageId: string,
    private readonly repository: Repository<Config>,
  ) {}

  private static getMetadata<T>(config: T): ConfigMetadata {
    const subjectType = Reflect.getMetadata(CONFIG_SUBJECT_TYPE, config);
    const subject = Reflect.getMetadata(CONFIG_SUBJECT, config);

    if (
      !subjectType ||
      (subjectType !== ConfigSubjectType.Global && !subject)
    ) {
      throw new Error(
        'Provided configuration is missing metadata - did you load it through ConfigService?',
      );
    }

    return { subjectType, subject };
  }

  private static assignMetadata<T>(
    config: T,
    subjectType: ConfigSubjectType,
    subject?: number,
  ): T {
    Reflect.defineMetadata(CONFIG_SUBJECT_TYPE, subjectType, config);
    if (subject) {
      Reflect.defineMetadata(CONFIG_SUBJECT, subject, config);
    }

    return config;
  }

  private async getConfig<T>(
    defaults: T = {} as T,
    subjectType: ConfigSubjectType,
    subject?: number,
  ): Promise<T> {
    try {
      const result = await this.repository.findOne({
        where: {
          module: this.packageId,
          subjectType,
          subject,
        },
      });

      if (result) {
        return ConfigService.assignMetadata(result.data, subjectType, subject);
      }
    } catch (err) {
      const subjectString = subject ? `, ${subjectType} ${subject}` : '';

      this.logger.warn(
        `Failed to load ${subjectType} config for ${this.packageId}${subjectString}; returning defaults`,
        err,
      );
      Sentry.captureException(err);
    }

    return ConfigService.assignMetadata(
      { ...defaults } as T,
      subjectType,
      subject,
    );
  }

  public async saveConfig<T>(config: T): Promise<void> {
    let metadata;
    try {
      metadata = ConfigService.getMetadata(config);

      await this.repository.save({
        module: this.packageId,
        subjectType: metadata.subjectType,
        subject: metadata.subject,
        data: config,
      });
    } catch (err) {
      const subjectType = metadata?.subjectType;
      const subjectString = metadata?.subject
        ? `, ${subjectType} ${metadata.subject}`
        : '';

      this.logger.warn(
        `Failed to save ${subjectType} config for ${this.packageId}${subjectString}; ignoring`,
        err,
      );
      Sentry.captureException(err);
    }
  }

  public async getGlobalConfig<T>(defaults: T = {} as T): Promise<T> {
    return this.getConfig<T>(defaults, ConfigSubjectType.Global);
  }

  public async getGuildConfig<T>(
    guildId: number,
    defaults: T = {} as T,
  ): Promise<T> {
    return this.getConfig<T>(defaults, ConfigSubjectType.Guild, guildId);
  }

  public async getUserConfig<T>(
    userId: number,
    defaults: T = {} as T,
  ): Promise<T> {
    return this.getConfig<T>(defaults, ConfigSubjectType.User, userId);
  }
}
