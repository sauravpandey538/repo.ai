import Parser from "tree-sitter";

export function traverse(
  node: Parser.SyntaxNode,
  callback: (node: Parser.SyntaxNode) => void,
) {
  callback(node);

  for (const child of node.children) {
    traverse(child, callback);
  }
}
