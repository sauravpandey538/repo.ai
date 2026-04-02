import Parser from "tree-sitter";
import { traverse } from "../utils/traverse.js";

export function extractExports(root: Parser.SyntaxNode) {
  const exports: any[] = [];

  traverse(root, (node) => {
    if (node.type === "export_statement") {
      const declaration = node.namedChildren[0];

      if (!declaration) return;

      let name = "unknown";

      if (declaration.type === "function_declaration") {
        name = declaration.childForFieldName("name")?.text || "anonymous";
      }

      if (declaration.type === "class_declaration") {
        name = declaration.childForFieldName("name")?.text || "anonymous";
      }

      exports.push({
        name,
        type: declaration.type,
      });
    }
  });

  return exports;
}
