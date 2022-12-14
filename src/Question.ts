import * as readline from "readline";

export const question = (questionText: string):Promise<string> => {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let response: string;
  rl.setPrompt(questionText);
  rl.prompt();
  return new Promise<string>((resolve, reject) => {
    rl.on("line", (input) => {
      response = input;
      rl.close();
    });

    rl.on("close", () => {
      resolve(response);
    });
  });
};
