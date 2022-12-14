import { Bucket } from "./Bucket";

export class Move {
  static solutionFound: number;
  static solutions: Move[] = [] as Move[];
  constructor(
    public Position: number = 0,
    public Parent: Move = null,
    public BucketA: Bucket,
    public BucketB: Bucket,
    public Description: string = "",
    public Children: Move[] = [] as Move[]
  ) {}

  static newBaseMove(bucketA: Bucket, bucketB: Bucket): Move {
    return new Move(0, null, bucketA, bucketB, "starting setup", []);
  }

  public rejected: string;

  WithChildren(children: Move[]): Move {
    return new Move(
      this.Position,
      this.Parent,
      this.BucketA,
      this.BucketB,
      this.Description,
      children
    );
  }

  equals(other: Move): boolean {
    return (
      this.Position === other.Position &&
      ((this.Parent === null && other.Parent === null) ||
        this.Parent.equals(other.Parent)) &&
      this.BucketA.equals(other.BucketA) &&
      this.BucketB.equals(other.BucketB) &&
      this.Description === other.Description &&
      this.Children.every((child) => other.Children.includes(child))
    );
  }

  shallowEquals(other: Move): boolean {
    return (
      this.Position === other.Position &&
      this.BucketA.equals(other.BucketA) &&
      this.BucketB.equals(other.BucketB) &&
      this.Description === other.Description
    );
  }

  length(depth: number = 0): number {
    let length = depth + 1;
    if (this.Children.length === 0) {
      return length;
    }
    return this.Children[0].length(length);
  }

  newMoveWithContents(a: Bucket, b: Bucket, description: string): Move {
    if (this.BucketA.Name === a.Name) {
      return new Move(this.Position + 1, this, a, b, description);
    } else {
      return new Move(this.Position + 1, this, b, a, description);
    }
  }

  toString(): string {
    return (
      `step ${this.Position + 1}: ${this.Description}`.padEnd(75) +
      `Buckets: ${this.BucketA.toString()} | ${this.BucketB.toString()}${this.ChildStrings()}`
    );
  }

  ChildStrings(): string {
    if (this.Children.length === 0) return "";
    let output = "\n";
    this.Children.forEach((child) => {
      output += child.toString();
    });
    return output;
  }

  toJSON() {
    return {
      position: this.Position,
      bucketA: this.BucketA,
      bucketB: this.BucketB,
      description: this.Description,
      children: this.Children.map((child) => child.toJSON()),
    };
  }

  findBestSolution(target: number): Move {
    this.downTheRabbitHole(target);
    return this.bestSolution();
  }
  bestSolution(): Move {
    let solution = null;
    Move.solutions.forEach((root) => {
      if (root.length() === Move.solutionFound + 1) solution = root;
    });
    return solution;
  }

  downTheRabbitHole(target: number) {
    let result = [];

    this.Children = this.getNextMoves();
    this.Children.forEach((nm) => {
      if (Move.solutionFound < nm.Position) {
        return;
      }
      if (nm.BucketA.Contents === 0 && nm.BucketB.Contents === 0) {
        // buckets have reset, and this path is a failure
        return;
      }
      if (nm.seenThisComboBefore()) {
        return;
      }
      if (nm.BucketA.Contents === target || nm.BucketB.Contents === target) {
        Move.solutionFound = nm.Position;
        Move.solutions.push(nm.getPathToMove());
        return;
      }
      nm.downTheRabbitHole(target);
    });
  }

  getPathToMove(): Move {
    let parent = this.Parent;
    parent.Children = [this];
    if (parent === null) return this;
    while (true) {
      if (parent.Parent === null) return parent;
      parent = parent.Parent.WithChildren([parent]);
    }
  }

  seenThisComboBefore(): boolean {
    let parent = this.Parent;
    while (parent !== null) {
      if (
        this.BucketA.Contents === parent.BucketA.Contents &&
        this.BucketB.Contents === parent.BucketB.Contents
      ) {
        return true;
      }
      parent = parent.Parent;
    }
    return false;
  }

  getNextMoves(): Move[] {
    let result = [];
    let aPerms = this.getAllPermutations(this.BucketA, this.BucketB);
    let bPerms = this.getAllPermutations(this.BucketB, this.BucketA);
    aPerms.forEach((x) => {
      result.push(this.newMoveWithContents(x[0], x[1], x[2]));
    });
    bPerms.forEach((x) => {
      result.push(this.newMoveWithContents(x[0], x[1], x[2]));
    });
    return result;
  }

  getAllPermutations(bucket1: Bucket, bucket2: Bucket): any[][] {
    let result = [];
    if (bucket1.Contents > 0) {
      if (bucket1.Contents !== bucket1.Size) {
        result.push([
          bucket1.full(),
          bucket2,
          `topping off bucket ${bucket1.Name}`,
        ]);
      }
      result.push([bucket1.empty(), bucket2, `empty ${bucket1.Name} Bucket`]);
      if (bucket2.Contents !== bucket2.Size) {
        if (bucket1.Contents > bucket2.Size - bucket2.Contents) {
          let newContents =
            bucket1.Contents - (bucket2.Size - bucket2.Contents);
          let msg = `pour ${bucket1.Name} into ${bucket2.Name}, filling it, and ${newContents} remains in ${bucket1.Name}`;
          result.push([bucket1.withContents(newContents), bucket2.full(), msg]);
        } else if (bucket1.Contents < bucket2.Size - bucket2.Contents) {
          let newContents = bucket1.Contents + bucket2.Contents;
          result.push([
            bucket1.empty(),
            bucket2.withContents(newContents),
            `pour remaining ${bucket1.Contents} into ${bucket2.Name}, filling to ${newContents}, and none remains in ${bucket1.Name}`,
          ]);
        }
      }
    } else {
      result.push([
        bucket1.full(),
        bucket2,
        `fill bucket ${bucket1.Name} from empty`,
      ]);
    }
    return result;
  }
}

export default { Move };
