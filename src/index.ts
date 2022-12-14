import { Move } from "./Move";
import { Bucket } from "./Bucket";
import { question } from "./Question";

async function getSizeInput(identifier: string) {
  let size: number;
  await question(`${identifier} size? (Whole numbers only)`)
    .then((response) => {
      let num = +response;
      if (num < 1 || Number.isNaN(num)) {
        throw new Error(
          "Please enter valid size(Whole numbers greater than 0)."
        );
      } else {
        size = num;
      }
      console.log(`${identifier} size will be ${size}`);
    })
    .catch((error) => {
      console.log(error);
    });
  if (size === undefined) {
    size = await getSizeInput(identifier);
  }
  return size;
}

function main() {
    let aSize: number;
    let bSize: number;
    let target: number;
    getSizeInput("Bucket A").then((size) => (aSize = size)).then(() => {

      getSizeInput("Bucket B").then((size) => (bSize = size))
    .then(() => {
      getSizeInput("Target").then((size) => (target = size))
    .then(() => {
      if (aSize < target && bSize < target) {
        console.log("No Solution Found: Target too big to reach with those buckets");
        process.exit(1);
      }
      if (target % gcd(aSize, bSize) !== 0) {
        console.log(
          "No Solution Found: Target must be multiple of greatest common denominator."
        );
        process.exit(1);
      }
      console.log(
        `Bucket One has size ${aSize}, and Bucket Dos has size ${bSize}, Target is ${target}`
      );
      let BucketA = new Bucket("One", 0, aSize);
      let BucketB = new Bucket("Dos", 0, bSize);
      let emptyBuckets = Move.newBaseMove(BucketA, BucketB);
      emptyBuckets.downTheRabbitHole(target);
      let solution = emptyBuckets.bestSolution();
      if (solution === null) {
        console.log("No Solution Found");
      } else {
        console.log(solution.toString());
        console.log(`Solution in ${Move.solutionFound + 1} moves`);
      }

    }).then(() => {
      question("Would you like to try another? [Y/N]").then( answer => {
        if(answer.toLowerCase() == 'y') {
          main()
        }
      })
    })})})

}

function gcd(k, n) {
  return k ? gcd(n % k, k) : n;
}

main()
