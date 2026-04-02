import fs from "fs";
import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";
import { analyzeFile } from "../analyzer/index.js";

const parser = new Parser();
parser.setLanguage(JavaScript as any);

export async function parseFile(filePath: string) {
  const code = fs.readFileSync(filePath, "utf-8");
  const tree = parser.parse(code);

  const result = analyzeFile(tree.rootNode, code, filePath);
  return result;
}
