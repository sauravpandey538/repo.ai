import Parser from "tree-sitter";
import { traverse } from "../utils/traverse.js";

const IGNORED = new Set([
  // JS built-ins
  "push",
  "pop",
  "slice",
  "map",
  "filter",
  "reduce",
  "forEach",
  "find",
  "includes",

  // Object/Set/Map
  "has",
  "set",
  "get",
  "add",
  "delete",

  // console
  "log",
  "error",
  "warn",

  // misc
  "toString",
]);

export function extractCalls(root: Parser.SyntaxNode) {
  const calls: { name: string }[] = [];

  traverse(root, (node) => {
    if (node.type === "call_expression") {
      const fn = node.child(0);
      if (!fn) return;

      let callName: string | null = null;

      // foo()
      if (fn.type === "identifier") {
        callName = fn.text;
      }

      // obj.method()
      if (fn.type === "member_expression") {
        const property = fn.childForFieldName("property");
        if (property) {
          callName = property.text;
        }
      }

      // ✅ FILTER HERE
      if (callName && !IGNORED.has(callName)) {
        calls.push({ name: callName });
      }
    }
  });

  return calls;
}
