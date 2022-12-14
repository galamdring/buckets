import { Move } from './Move'


  export class Bucket {
    constructor(
      public Name: string,
      public Contents: number,
      public Size: number
    ) {}

    toString(): string {
      return `${this.Name} ${this.Contents}L of ${this.Size}L`;
    }

    equals(other: Bucket): boolean {
      return this.Name === other.Name && this.Contents === other.Contents && this.Size === other.Size
    }

    // withContents returns a Bucket with the same Name and Size as the parent, and the specified contents.
    withContents(c: number): Bucket {
      return new Bucket(this.Name, c, this.Size);
    }

    // full returns a Bucket with the same Name and Size as the parent, and the Size as contents.
    full(): Bucket {
      return new Bucket(this.Name, this.Size, this.Size);
    }

    // empty returns a Bucket with the same Name and Size as the parent, and 0 as contents.
    empty(): Bucket {
      return new Bucket(this.Name, 0, this.Size);
    }
  }
