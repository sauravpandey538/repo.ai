import Parser from "tree-sitter";
import { traverse } from "../utils/traverse.js";

const IGNORED = new Set([
  "push",
  "slice",
  "map",
  "forEach",
  "has",
  "set",
  "get",
  "add",
  "log",
  "error",
]);

export function extractFunctions(
  root: Parser.SyntaxNode,
  code: string,
  file: string,
) {
  const functions: any[] = [];

  traverse(root, (node) => {
    if (node.type === "function_declaration") {
      const name = node.childForFieldName("name")?.text;

      const calls: string[] = [];

      // 🔥 Traverse INSIDE function
      traverse(node, (child) => {
        if (child.type === "call_expression") {
          const fn = child.child(0);
          if (!fn) return;

          let callName: string | null = null;

          if (fn.type === "identifier") {
            callName = fn.text;
          }

          if (fn.type === "member_expression") {
            const prop = fn.childForFieldName("property");
            if (prop) callName = prop.text;
          }

          if (callName && !IGNORED.has(callName)) {
            calls.push(callName);
          }
        }
      });

      functions.push({
        name,
        calls,
        file,
      });
    }
  });

  return functions;
}
