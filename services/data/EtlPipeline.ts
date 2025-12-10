
type TransformFn<T> = (data: T) => T;

export class EtlPipeline<T> {
  private transforms: TransformFn<T>[] = [];

  addStep(fn: TransformFn<T>) {
    this.transforms.push(fn);
    return this;
  }

  process(data: T): T {
    return this.transforms.reduce((acc, fn) => fn(acc), data);
  }

  async processBatch(batch: T[]): Promise<T[]> {
    return batch.map(item => this.process(item));
  }
}
