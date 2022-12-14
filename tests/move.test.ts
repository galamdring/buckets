import { Move } from "../src/Move";
import { Bucket } from "../src/Bucket";

describe("Move", () => {
  beforeEach(() => {
    Move.solutionFound = undefined;
  });
  let BucketA = new Bucket("A", 0, 5);
  let BucketB = new Bucket("B", 0, 3);

  test("length", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Buckets");
    expect(move.length()).toStrictEqual(1);
  });

  test("newMoveWithContents correctly assigns the buckets when b is given first", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Buckets");
    let newMove = move.newMoveWithContents(
      BucketB,
      BucketA,
      "backwards buckets"
    );

    expect(newMove.BucketA).toStrictEqual(BucketA);
  });
  test("newMoveWithContents correctly assigns the buckets when a is given first", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Buckets");
    let newMove = move.newMoveWithContents(
      BucketA,
      BucketB,
      "backwards buckets"
    );

    expect(newMove.BucketA).toStrictEqual(BucketA);
  });

  test("equals returns true with same elements", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Buckets");
    expect(move.equals(move)).toBeTruthy;
  });

  test("equals returns true with same elements", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Buckets");
    expect(JSON.stringify(move, null, 2)).toStrictEqual(
      `{
  "position": 0,
  "bucketA": {
    "Name": "A",
    "Contents": 0,
    "Size": 5
  },
  "bucketB": {
    "Name": "B",
    "Contents": 0,
    "Size": 3
  },
  "description": "empty Buckets",
  "children": []
}`
    );
  });

  test("toString returns the expected string", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Buckets");
    expect(move.toString()).toStrictEqual(`step 1: empty Buckets                                                 Buckets: A 0L of 5L | B 0L of 3L`);
  });

  test("downTheRabbitHole should correctly return an empty array with matching target", () => {
    let move = new Move(
      0,
      null,
      BucketA.empty(),
      BucketB.empty(),
      "empty Bucket"
    );
    let expectedMove = new Move(
      1,
      move,
      BucketA.full(),
      BucketB.empty(),
      "fill bucket A from empty"
    );
    let result = move.findBestSolution(5);
    expect(result).toBeDefined();
    console.log(move.Children.map(x=> x.toString()).join("\n"))
    expect(
      move.Children.some((m) => m.shallowEquals(expectedMove))
    ).toStrictEqual(true);
  });

  test("downTheRabbitHole should correctly return a two step array with matching target", () => {
    let move = Move.newBaseMove(BucketA, BucketB);
    move.downTheRabbitHole(3);
    let move1 = new Move(
      1,
      move,
      BucketA.empty(),
      BucketB.full(),
      "fill bucket B from empty"
    );
    expect(move.Children.some((m) => m.shallowEquals(move1))).toStrictEqual(
      true
    );
  });
  test("downTheRabbitHole returns correct next step", () => {
    let move = new Move(0, null, BucketA, BucketB, "empty Bucket");
    let second = new Move(
      1,
      move,
      BucketA.full(),
      BucketB.empty(),
      "fill bucket A from empty"
    );
    let second2 = new Move(
      1,
      move,
      BucketA.empty(),
      BucketB.full(),
      "fill bucket B from empty"
    );

    move.Children = [second];
    let firstSteps = move.getNextMoves();
    expect(firstSteps).toStrictEqual([second, second2]);

    let third = new Move(
      2,
      second,
      BucketA.withContents(2),
      BucketB.full(),
      "pour A into B, filling it, and 2 remains in A"
    );
    second.Children = [third];
    let secondSteps = second.getNextMoves();
    //console.log(secondSteps.map((x) => x.toString()).join("\n"));
    expect(secondSteps.some((move) => move.equals(third))).toBeTruthy();

    let fourth = new Move(
      3,
      third,
      BucketA.withContents(2),
      BucketB.empty(),
      "empty B Bucket"
    );
    third.Children = [fourth];
    let thirdSteps = third.getNextMoves();
    //console.log(thirdSteps.map((x) => x.toString()).join("\n"));
    expect(thirdSteps.some((move) => move.equals(fourth))).toBeTruthy();

    let fifth = new Move(
      4,
      fourth,
      BucketA.empty(),
      BucketB.withContents(2),
      "pour remaining 2 into B, filling to 2, and none remains in A"
    );
    fourth.Children = [fifth];
    let fourthSteps = fourth.getNextMoves();
    //console.log(fourthSteps.map((x) => x.toString()).join("\n"));
    expect(fourthSteps.some((move) => move.equals(fifth))).toBeTruthy();

    let sixth = new Move(
      5,
      fifth,
      BucketA.full(),
      fifth.BucketB,
      "fill bucket A from empty"
    );
    fifth.Children = [sixth];
    let fifthSteps = fifth.getNextMoves();
    //console.log(fifthSteps.map((x) => x.toString()).join("\n"));
    expect(fifthSteps.some((move) => move.equals(sixth))).toBeTruthy();

    let seventh = new Move(
      6,
      sixth,
      BucketA.withContents(4),
      BucketB.full(),
      "pour A into B, filling it, and 4 remains in A"
    );
    sixth.Children = [seventh];
    let sixthSteps = sixth.getNextMoves();
    //console.log(sixthSteps.map((x) => x.toString()).join("\n"));
    expect(sixthSteps.some((move) => move.equals(seventh))).toBeTruthy();
  });

  test("bestSolution should return the expected moves", () => {
    let expected: string = `step 1: starting setup                                                Buckets: One 0L of 1L | Dos 0L of 5L
step 2: fill bucket Dos from empty                                    Buckets: One 0L of 1L | Dos 5L of 5L
step 3: pour Dos into One, filling it, and 4 remains in Dos           Buckets: One 1L of 1L | Dos 4L of 5L`;

    let move = new Move(
      0,
      null,
      new Bucket("One", 0, 1),
      new Bucket("Dos", 0, 5),
      "starting setup"
    );
    move.downTheRabbitHole(4);
    let result = move.bestSolution();
    expect(result.toString()).toStrictEqual(expected);
  });
});
