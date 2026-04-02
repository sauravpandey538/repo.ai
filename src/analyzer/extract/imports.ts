import Parser from "tree-sitter";
import { traverse } from "../utils/traverse.js";

export function extractImports(root: Parser.SyntaxNode) {
  const imports: any[] = [];

  traverse(root, (node) => {
    if (node.type === "import_statement") {
      const sourceNode = node.childForFieldName("source");

      const specifiers: string[] = [];

      node.namedChildren.forEach((child) => {
        if (child.type === "import_specifier") {
          const name = child.childForFieldName("name")?.text;
          if (name) specifiers.push(name);
        }

        if (child.type === "import_clause") {
          specifiers.push(child.text);
        }
      });

      imports.push({
        source: sourceNode?.text.replace(/['"]/g, ""),
        specifiers,
      });
    }
  });

  return imports;
}
