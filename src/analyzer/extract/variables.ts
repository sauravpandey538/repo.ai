import Parser from "tree-sitter";
import { traverse } from "../utils/traverse.js";

export function extractVariables(root: Parser.SyntaxNode) {
  const variables: any[] = [];

  traverse(root, (node) => {
    if (node.type === "variable_declarator") {
      const nameNode = node.childForFieldName("name");
      const valueNode = node.childForFieldName("value");

      variables.push({
        name: nameNode?.text,
        valueType: valueNode?.type,
      });
    }
  });

  return variables;
}
