export class LocalizedAsyncResource<T, U> {
  private resourceLangs: Map<T, CachedAsyncResource<U>>;
  private getFn: (lang: T) => Promise<U>;

  constructor(getFn: (lang: T) => Promise<U>) {
    this.resourceLangs = new Map<T, CachedAsyncResource<U>>();
    this.getFn = getFn;
  }

  public async get(lang: T): Promise<U> {
    if (!this.resourceLangs.has(lang)) {
      this.resourceLangs.set(
        lang,
        new CachedAsyncResource<U>(() => this.getFn(lang)),
      );
    }

    const resourceLang = this.resourceLangs.get(lang);
    if (resourceLang == null) {
      throw new Error('Resource language was null.');
    }

    return await resourceLang?.get();
  }
}

export class CachedAsyncResource<T> {
  data?: T;
  getFn: () => Promise<T>;

  constructor(getFn: () => Promise<T>) {
    this.getFn = getFn;
  }

  public async get(): Promise<T> {
    if (this.data == null) {
      this.data = await this.getFn();
    }

    return this.data;
  }
}
