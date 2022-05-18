import { Test } from '@nestjs/testing';
import {
  CONFIG_SUBJECT,
  CONFIG_SUBJECT_TYPE,
  ConfigService,
} from './config.service';
import { MODULE_PACKAGE_NAME } from '../module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
import { Repository } from 'typeorm';
import { ConfigSubjectType } from './config-subject-type.enum';

type TestConfigType = {
  testOne: string;
  testTwo: number;
};

describe('ConfigService', () => {
  let service: ConfigService;
  let testConfig: TestConfigType;
  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        {
          provide: MODULE_PACKAGE_NAME,
          useValue: 'test',
        },
        {
          provide: getRepositoryToken(Config),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = new ConfigService(
      'test',
      mockRepository as unknown as Repository<Config>,
    );

    testConfig = {
      testOne: 'testOne',
      testTwo: 2,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get config without defaults', async () => {
    const spy = jest
      .spyOn(mockRepository, 'findOne')
      .mockResolvedValueOnce(undefined);
    const result = await service.getGlobalConfig<TestConfigType>();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({});
  });

  it('should get config with defaults', async () => {
    const spy = jest
      .spyOn(mockRepository, 'findOne')
      .mockResolvedValueOnce(undefined);
    const result = await service.getGlobalConfig<TestConfigType>(testConfig);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(testConfig);
  });

  it('should return a global config with correct metadata', async () => {
    const spy = jest
      .spyOn(mockRepository, 'findOne')
      .mockResolvedValueOnce(undefined);
    const result = await service.getGlobalConfig<TestConfigType>(testConfig);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(Reflect.getMetadata(CONFIG_SUBJECT_TYPE, result)).toBe(
      ConfigSubjectType.Global,
    );
    expect(Reflect.hasMetadata(CONFIG_SUBJECT, result)).toBe(false);
  });

  it('should return a guild config with correct metadata', async () => {
    const spy = jest
      .spyOn(mockRepository, 'findOne')
      .mockResolvedValueOnce(undefined);
    const result = await service.getGuildConfig<TestConfigType>(
      1234,
      testConfig,
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(Reflect.getMetadata(CONFIG_SUBJECT_TYPE, result)).toBe(
      ConfigSubjectType.Guild,
    );
    expect(Reflect.getMetadata(CONFIG_SUBJECT, result)).toBe(1234);
  });

  it('should return a user config with correct metadata', async () => {
    const spy = jest
      .spyOn(mockRepository, 'findOne')
      .mockResolvedValueOnce(undefined);
    const result = await service.getUserConfig<TestConfigType>(
      1234,
      testConfig,
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(Reflect.getMetadata(CONFIG_SUBJECT_TYPE, result)).toBe(
      ConfigSubjectType.User,
    );
    expect(Reflect.getMetadata(CONFIG_SUBJECT, result)).toBe(1234);
  });

  it('should save a global config', async () => {
    const spy = jest.spyOn(mockRepository, 'save');
    const config = await service.getGlobalConfig<TestConfigType>();

    await service.saveConfig(config);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      module: 'test',
      subjectType: ConfigSubjectType.Global,
      data: config,
    });
  });

  it('should save a guild config', async () => {
    const spy = jest.spyOn(mockRepository, 'save');
    const config = await service.getGuildConfig<TestConfigType>(
      1234,
      testConfig,
    );

    await service.saveConfig(config);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      module: 'test',
      subjectType: ConfigSubjectType.Guild,
      subject: 1234,
      data: config,
    });
  });

  it('should save a user config', async () => {
    const spy = jest.spyOn(mockRepository, 'save');
    const config = await service.getUserConfig<TestConfigType>(
      1234,
      testConfig,
    );

    await service.saveConfig(config);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      module: 'test',
      subjectType: ConfigSubjectType.User,
      subject: 1234,
      data: config,
    });
  });

  it('should not throw when saving a config object with no metadata', async () => {
    expect(async () => {
      await service.saveConfig({});
    }).not.toThrow();
  });

  it('should not throw when the save call fails', async () => {
    jest.spyOn(mockRepository, 'save').mockRejectedValueOnce(new Error('test'));

    expect(async () => {
      await service.saveConfig(testConfig);
    }).not.toThrow();
  });
});
