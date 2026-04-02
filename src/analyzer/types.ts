export type FunctionInfo = {
  name: string;
  params: string[];
  isAsync: boolean;
  code: string;
};

export type ImportInfo = {
  source: string;
  specifiers: string[];
};

export type CallInfo = {
  name: string;
};

export type FileAnalysis = {
  file: string;
  functions: FunctionInfo[];
  imports: ImportInfo[];
  calls: CallInfo[];
};
