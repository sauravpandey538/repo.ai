import Parser from "tree-sitter";
import { traverse } from "../utils/traverse.js";

export function extractClasses(root: Parser.SyntaxNode) {
  const classes: any[] = [];

  traverse(root, (node) => {
    if (node.type === "class_declaration") {
      const name = node.childForFieldName("name")?.text;

      const methods: string[] = [];

      const body = node.childForFieldName("body");

      if (body) {
        body.children.forEach((child) => {
          if (child.type === "method_definition") {
            const methodName = child.childForFieldName("name")?.text;
            if (methodName) methods.push(methodName);
          }
        });
      }

      classes.push({
        name,
        methods,
      });
    }
  });

  return classes;
}
