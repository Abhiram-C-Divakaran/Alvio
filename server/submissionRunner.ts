import { randomBytes } from 'node:crypto';

export const SUPPORTED_SUBMISSION_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'python3',
  'cpp',
  'c',
  'java',
  'csharp',
] as const;

export type SubmissionLanguage = (typeof SUPPORTED_SUBMISSION_LANGUAGES)[number];
export type PaizaLanguage = 'javascript' | 'typescript' | 'python3' | 'cpp' | 'c' | 'java' | 'csharp';
export type VerdictStatus = 'Passed' | 'Failed' | 'Error';
export type SubmissionErrorType = 'compilation' | 'runtime' | 'timeout' | 'provider' | 'unsupported' | null;

export const MAX_CODE_LENGTH = 65536;
export const DEFAULT_EXECUTION_TIMEOUT_MS = 15000;
export const MAX_PROVIDER_OUTPUT_BYTES = 65536;
const MAX_STDOUT_LINES = 50;
const MAX_MESSAGE_LENGTH = 4000;

export interface JudgeResourceLimits {
  cpuTimeLimitSec: number;
  memoryLimitMb: number;
  maxOutputBytes: number;
  networkDisabled: true;
}

export const DEFAULT_JUDGE_LIMITS: JudgeResourceLimits = {
  cpuTimeLimitSec: 5,
  memoryLimitMb: 256,
  maxOutputBytes: MAX_PROVIDER_OUTPUT_BYTES,
  networkDisabled: true,
};

export interface ProblemParam {
  name: string;
  type: string;
}

export interface ProblemSignature {
  name: string;
  params: ProblemParam[];
  returns: string;
}

export interface ProblemTestCase {
  input: unknown[];
  expected: unknown;
}

export interface SubmissionProblem {
  id: string;
  title?: string;
  signature: ProblemSignature;
  testCases: ProblemTestCase[];
  hiddenTestCases?: ProblemTestCase[];
}

export interface ProviderExecutionRequest {
  language: PaizaLanguage;
  sourceCode: string;
  timeoutMs: number;
  limits?: JudgeResourceLimits;
  signal?: AbortSignal;
}

export interface ProviderExecutionResponse {
  status: string;
  build_result?: string | null;
  build_stdout?: string | null;
  build_stderr?: string | null;
  result?: string | null;
  exit_code?: number | null;
  stdout?: string | null;
  stderr?: string | null;
  time?: string | number | null;
}

export type ExecutionProvider = (request: ProviderExecutionRequest) => Promise<ProviderExecutionResponse>;

export interface FailedTestCaseDetail {
  index: number;
  hidden?: boolean;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
}

export interface ServerSubmissionResult {
  status: VerdictStatus;
  passedCount: number;
  totalCount: number;
  visibleCount: number;
  hiddenCount: number;
  executionTimeMs: number;
  message: string;
  stdout: string[];
  errorType: SubmissionErrorType;
  recordable: boolean;
  failedTestCase?: FailedTestCaseDetail;
}

export class ExecutionProviderError extends Error {
  readonly kind: 'timeout' | 'provider';

  constructor(kind: 'timeout' | 'provider', message: string) {
    super(message);
    this.name = 'ExecutionProviderError';
    this.kind = kind;
  }
}

export function isSupportedLanguage(language: unknown): language is SubmissionLanguage {
  return typeof language === 'string' && (SUPPORTED_SUBMISSION_LANGUAGES as readonly string[]).includes(language);
}

export function normalizePaizaLanguage(language: SubmissionLanguage): PaizaLanguage {
  return language === 'python' ? 'python3' : language;
}

function isSafeIdentifier(name: unknown): name is string {
  return typeof name === 'string' && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
}

export function extractFunctionName(code: string, preferredName?: string): string {
  if (isSafeIdentifier(preferredName)) {
    const declarations = /\b(?:function|def)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|\b(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?::[^=;\n]+)?=\s*(?:async\s+)?(?:function\b|(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)(?:\s*:[^=;\n]+)?\s*=>)/g;
    const names = Array.from(code.matchAll(declarations), (match) => match[1] || match[2]);
    if (names.includes(preferredName)) return preferredName;
    if (names.length > 0 && isSafeIdentifier(names[0])) return names[0];
    return preferredName;
  }
  const declarations = /\b(?:function|def)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|\b(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?::[^=;\n]+)?=\s*(?:async\s+)?(?:function\b|(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)(?:\s*:[^=;\n]+)?\s*=>)/g;
  const names = Array.from(code.matchAll(declarations), (match) => match[1] || match[2]);
  return (names[0] && isSafeIdentifier(names[0])) ? names[0] : 'solution';
}

function trimMessage(message: string): string {
  const cleaned = message.trim();
  if (cleaned.length <= MAX_MESSAGE_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_MESSAGE_LENGTH)}... (truncated)`;
}

function normalizeInputArray(rawInput: unknown): unknown[] {
  if (Array.isArray(rawInput)) return rawInput;
  if (rawInput !== undefined && rawInput !== null) return [rawInput];
  return [];
}

function containsNullDeep(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.some(containsNullDeep);
  return false;
}

function escapeCLikeChar(ch: unknown): string {
  const str = String(ch ?? '');
  const c = str.length > 0 ? str[0] : '\0';
  if (c === '\\') return "'\\\\'";
  if (c === "'") return "'\\''";
  if (c === '\n') return "'\\n'";
  if (c === '\r') return "'\\r'";
  if (c === '\t') return "'\\t'";
  if (c === '\0') return "'\\0'";
  return `'${c}'`;
}

function escapeCLikeString(val: unknown): string {
  return JSON.stringify(String(val ?? ''));
}

function formatNumber(val: unknown): string {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0';
  return String(num);
}

// ---------- JavaScript / TypeScript Runner ----------

function generateJsOrTsRunner(
  userCode: string,
  problem: SubmissionProblem,
  marker: string,
  isTypeScript: boolean
): string {
  const fnName = extractFunctionName(userCode, problem.signature.name);
  const escapedTestCases = JSON.stringify(JSON.stringify(problem.testCases));
  const escapedMarker = JSON.stringify(marker);
  const stdoutDecl = isTypeScript ? 'const __ALVIO_STDOUT__: string[] = [];' : 'const __ALVIO_STDOUT__ = [];';
  const argsType = isTypeScript ? '...args: any[]' : '...args';
  const catchParam = isTypeScript ? 'err: any' : 'err';
  const logArgType = isTypeScript ? '(a: any)' : 'a';

  return `${userCode}

;(function __alvioRunner__() {
  const __ALVIO_TEST_CASES__ = JSON.parse(${escapedTestCases});
  const __ALVIO_MARKER__ = ${escapedMarker};
  ${stdoutDecl}
  const __ALVIO_ORIG_LOG__ = console.log.bind(console);
  console.log = (${argsType}) => {
    if (__ALVIO_STDOUT__.length < ${MAX_STDOUT_LINES}) {
      __ALVIO_STDOUT__.push(args.map(${logArgType} => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    }
  };

  const startTime = Date.now();
  let passed = 0;

  try {
    const userFunc = typeof ${fnName} === 'function' ? ${fnName} : undefined;
    if (typeof userFunc !== 'function') {
      __ALVIO_ORIG_LOG__(__ALVIO_MARKER__ + JSON.stringify({
        status: 'Error',
        errorType: 'runtime',
        message: 'Function ${fnName} is not defined.',
        passedCount: 0,
        stdout: __ALVIO_STDOUT__,
        executionTimeMs: Date.now() - startTime
      }));
      return;
    }

    for (let i = 0; i < __ALVIO_TEST_CASES__.length; i++) {
      const tc = __ALVIO_TEST_CASES__[i];
      const rawInput = tc && tc.input;
      const inputArr = Array.isArray(rawInput) ? rawInput : (rawInput !== undefined && rawInput !== null ? [rawInput] : []);
      const inputClone = JSON.parse(JSON.stringify(inputArr));
      const res = userFunc(...inputClone);
      if (JSON.stringify(res) === JSON.stringify(tc.expected)) {
        passed++;
      } else {
        __ALVIO_ORIG_LOG__(__ALVIO_MARKER__ + JSON.stringify({
          status: 'Failed',
          message: 'Test Case ' + (i + 1) + ' Failed.\\nInput: ' + JSON.stringify(tc.input) + '\\nExpected: ' + JSON.stringify(tc.expected) + '\\nOutput: ' + JSON.stringify(res),
          passedCount: passed,
          failedTestCase: { index: i + 1, input: tc.input, expected: tc.expected, actual: res },
          stdout: __ALVIO_STDOUT__,
          executionTimeMs: Date.now() - startTime
        }));
        return;
      }
    }

    __ALVIO_ORIG_LOG__(__ALVIO_MARKER__ + JSON.stringify({
      status: 'Passed',
      message: 'All provided test cases passed.',
      passedCount: passed,
      stdout: __ALVIO_STDOUT__,
      executionTimeMs: Date.now() - startTime
    }));
  } catch (${catchParam}) {
    __ALVIO_ORIG_LOG__(__ALVIO_MARKER__ + JSON.stringify({
      status: 'Error',
      errorType: 'runtime',
      message: err && err.message ? String(err.message) : String(err),
      passedCount: passed,
      stdout: __ALVIO_STDOUT__,
      executionTimeMs: Date.now() - startTime
    }));
  }
})();
`;
}

// ---------- Python Runner ----------

function generatePythonRunner(userCode: string, problem: SubmissionProblem, marker: string): string {
  const fnName = extractFunctionName(userCode, problem.signature.name);
  const escapedTestCases = JSON.stringify(JSON.stringify(problem.testCases));
  const escapedMarker = JSON.stringify(marker);

  return `import copy, json, sys, time
from typing import *

${userCode}

def __alvio_run__():
    marker = ${escapedMarker}
    test_cases = json.loads(${escapedTestCases})
    passed = 0
    stdout = []

    class StdoutCapture:
        def write(self, text):
            if text and text.strip() and len(stdout) < ${MAX_STDOUT_LINES}:
                stdout.append(text.strip())
        def flush(self):
            pass

    orig_stdout = sys.stdout
    sys.stdout = StdoutCapture()
    start_time = time.time()

    try:
        func = None
        if 'Solution' in globals():
            obj = globals()['Solution']()
            if hasattr(obj, ${JSON.stringify(fnName)}):
                func = getattr(obj, ${JSON.stringify(fnName)})
        if func is None:
            func = globals().get(${JSON.stringify(fnName)})

        if not callable(func):
            sys.stdout = orig_stdout
            print(marker + json.dumps({
                "status": "Error",
                "errorType": "runtime",
                "message": "Function ${fnName} not found. Define it at the top level or inside 'class Solution:'.",
                "passedCount": 0,
                "stdout": stdout,
                "executionTimeMs": int((time.time() - start_time) * 1000)
            }))
            return

        for i, tc in enumerate(test_cases):
            raw_inp = tc.get('input') if isinstance(tc, dict) else tc
            inp = raw_inp if isinstance(raw_inp, list) else ([raw_inp] if raw_inp is not None else [])
            result = func(*copy.deepcopy(inp))
            if (type(result) is bool) == (type(tc['expected']) is bool) and result == tc['expected']:
                passed += 1
            else:
                sys.stdout = orig_stdout
                print(marker + json.dumps({
                    "status": "Failed",
                    "message": f"Test Case {i + 1} Failed.\\nInput: {json.dumps(tc['input'])}\\nExpected: {json.dumps(tc['expected'])}\\nOutput: {json.dumps(result, default=str)}",
                    "passedCount": passed,
                    "failedTestCase": {"index": i + 1, "input": tc['input'], "expected": tc['expected'], "actual": result},
                    "stdout": stdout,
                    "executionTimeMs": int((time.time() - start_time) * 1000)
                }, default=str))
                return

        sys.stdout = orig_stdout
        print(marker + json.dumps({
            "status": "Passed",
            "message": "All provided test cases passed.",
            "passedCount": passed,
            "stdout": stdout,
            "executionTimeMs": int((time.time() - start_time) * 1000)
        }))
    except Exception as e:
        sys.stdout = orig_stdout
        print(marker + json.dumps({
            "status": "Error",
            "errorType": "runtime",
            "message": f"{type(e).__name__}: {e}",
            "passedCount": passed,
            "stdout": stdout,
            "executionTimeMs": int((time.time() - start_time) * 1000)
        }))

__alvio_run__()
`;
}

// ---------- C++ Runner ----------

const CPP_SUPPORTED_TYPES = new Set([
  'integer',
  'string',
  'boolean',
  'char',
  'integer[]',
  'string[]',
  'boolean[]',
  'char[]',
  'float[]',
  'integer[][]',
  'string[][]',
  'integer[][][]',
]);

function getCppType(type: string): string {
  switch (type) {
    case 'integer': return 'int';
    case 'string': return 'string';
    case 'boolean': return 'bool';
    case 'char': return 'char';
    case 'integer[]': return 'vector<int>';
    case 'string[]': return 'vector<string>';
    case 'boolean[]': return 'vector<bool>';
    case 'char[]': return 'vector<char>';
    case 'float[]': return 'vector<double>';
    case 'integer[][]': return 'vector<vector<int>>';
    case 'string[][]': return 'vector<vector<string>>';
    case 'integer[][][]': return 'vector<vector<vector<int>>>';
    default: return 'int';
  }
}

function getCppVal(type: string, val: unknown): string {
  if (type === 'integer') return formatNumber(val);
  if (type === 'boolean') return val ? 'true' : 'false';
  if (type === 'char') return escapeCLikeChar(val);
  if (type === 'string') return escapeCLikeString(val);
  if (type === 'char[]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map(escapeCLikeChar).join(', ')}}`;
  }
  if (type === 'boolean[]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map((v) => (v ? 'true' : 'false')).join(', ')}}`;
  }
  if (type === 'integer[]' || type === 'float[]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map(formatNumber).join(', ')}}`;
  }
  if (type === 'string[]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map(escapeCLikeString).join(', ')}}`;
  }
  if (type === 'integer[][]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map((row) => `{${(Array.isArray(row) ? row : []).map(formatNumber).join(', ')}}`).join(', ')}}`;
  }
  if (type === 'string[][]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map((row) => `{${(Array.isArray(row) ? row : []).map(escapeCLikeString).join(', ')}}`).join(', ')}}`;
  }
  if (type === 'integer[][][]') {
    const arr = Array.isArray(val) ? val : [];
    return `{${arr.map((mat) => `{${(Array.isArray(mat) ? mat : []).map((row) => `{${(Array.isArray(row) ? row : []).map(formatNumber).join(', ')}}`).join(', ')}}`).join(', ')}}`;
  }
  return '0';
}

function generateCppRunner(userCode: string, problem: SubmissionProblem, marker: string): { sourceCode?: string; unsupportedReason?: string } {
  const sig = problem.signature;
  const allTypes = [sig.returns, ...sig.params.map((p) => p.type)];
  const unsupported = allTypes.find((t) => !CPP_SUPPORTED_TYPES.has(t));
  if (unsupported) {
    return { unsupportedReason: `Server submission in C++ does not support the "${unsupported}" type for this problem. Try JavaScript, TypeScript, or Python, or use Run.` };
  }
  if (problem.testCases.some((tc) => containsNullDeep(tc.input) || containsNullDeep(tc.expected))) {
    return { unsupportedReason: 'Server submission in C++ does not support null elements in this problem’s test cases. Try JavaScript, TypeScript, or Python.' };
  }

  let runner = `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n${userCode}\n\nint main() {\n    Solution sol;\n    int passed = 0;\n`;
  problem.testCases.forEach((tc, i) => {
    const inputArr = normalizeInputArray(tc.input);
    runner += `    {\n`;
    sig.params.forEach((param, j) => {
      runner += `        ${getCppType(param.type)} ${param.name} = ${getCppVal(param.type, inputArr[j])};\n`;
    });
    const callArgs = sig.params.map((p) => p.name).join(', ');
    runner += `        auto res = sol.${sig.name}(${callArgs});\n`;
    runner += `        ${getCppType(sig.returns)} exp = ${getCppVal(sig.returns, tc.expected)};\n`;
    runner += `        if (res == exp) passed++;\n`;
    runner += `        else { cout << ${escapeCLikeString(marker)} << "Failed|" << ${i} << endl; return 0; }\n    }\n`;
  });
  runner += `    cout << ${escapeCLikeString(marker)} << "Passed|" << passed << endl;\n    return 0;\n}\n`;
  return { sourceCode: runner };
}

// ---------- C Runner ----------

const C_SUPPORTED_PARAM_TYPES = new Set(['integer', 'boolean', 'char', 'string', 'integer[]', 'char[]']);
const C_SUPPORTED_RETURN_TYPES = new Set(['integer', 'boolean', 'char', 'string', 'integer[]', 'char[]']);

function generateCRunner(userCode: string, problem: SubmissionProblem, marker: string): { sourceCode?: string; unsupportedReason?: string } {
  const sig = problem.signature;
  const unsupportedParam = sig.params.find((p) => !C_SUPPORTED_PARAM_TYPES.has(p.type));
  if (unsupportedParam || !C_SUPPORTED_RETURN_TYPES.has(sig.returns)) {
    const badType = unsupportedParam ? unsupportedParam.type : sig.returns;
    return { unsupportedReason: `Server submission in C does not support the "${badType}" type for this problem. Try JavaScript, Python, TypeScript, C++, Java, or C#, or use Run.` };
  }
  if (problem.testCases.some((tc) => containsNullDeep(tc.input) || containsNullDeep(tc.expected))) {
    return { unsupportedReason: 'Server submission in C does not support null elements in this problem’s test cases. Try JavaScript, TypeScript, or Python.' };
  }

  let runner = `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n\n${userCode}\n\nint main() {\n    int passed = 0;\n`;
  problem.testCases.forEach((tc, i) => {
    const inputArr = normalizeInputArray(tc.input);
    runner += `    {\n`;

    const callArgs: string[] = [];
    sig.params.forEach((param, j) => {
      const val = inputArr[j];
      if (param.type === 'integer') {
        runner += `        int ${param.name} = ${formatNumber(val)};\n`;
        callArgs.push(param.name);
      } else if (param.type === 'boolean') {
        runner += `        bool ${param.name} = ${val ? 'true' : 'false'};\n`;
        callArgs.push(param.name);
      } else if (param.type === 'char') {
        runner += `        char ${param.name} = ${escapeCLikeChar(val)};\n`;
        callArgs.push(param.name);
      } else if (param.type === 'string') {
        runner += `        char ${param.name}[] = ${escapeCLikeString(val)};\n`;
        callArgs.push(param.name);
      } else if (param.type === 'integer[]') {
        const arr = Array.isArray(val) ? val : [];
        const init = arr.length ? `{${arr.map(formatNumber).join(', ')}}` : `{0}`;
        runner += `        int ${param.name}Data[] = ${init};\n`;
        runner += `        int* ${param.name} = ${arr.length ? `${param.name}Data` : 'NULL'};\n`;
        callArgs.push(param.name, String(arr.length));
      } else if (param.type === 'char[]') {
        const arr = Array.isArray(val) ? val : [];
        const chars = arr.map(escapeCLikeChar).join(', ');
        runner += `        char ${param.name}[] = {${chars}${chars ? ', ' : ''}'\\0'};\n`;
        callArgs.push(param.name, String(arr.length));
      }
    });

    if (sig.returns === 'integer[]' || sig.returns === 'char[]') {
      runner += `        int returnSize = 0;\n`;
      callArgs.push('&returnSize');
    }

    let retType = 'int';
    if (sig.returns === 'boolean') retType = 'bool';
    if (sig.returns === 'char') retType = 'char';
    if (sig.returns === 'string') retType = 'char*';
    if (sig.returns === 'integer[]') retType = 'int*';
    if (sig.returns === 'char[]') retType = 'char*';

    runner += `        ${retType} res = ${sig.name}(${callArgs.join(', ')});\n`;

    if (sig.returns === 'integer') {
      runner += `        int exp = ${formatNumber(tc.expected)};\n`;
      runner += `        if (res == exp) passed++;\n`;
    } else if (sig.returns === 'boolean') {
      runner += `        bool exp = ${tc.expected ? 'true' : 'false'};\n`;
      runner += `        if (res == exp) passed++;\n`;
    } else if (sig.returns === 'char') {
      runner += `        char exp = ${escapeCLikeChar(tc.expected)};\n`;
      runner += `        if (res == exp) passed++;\n`;
    } else if (sig.returns === 'string') {
      runner += `        const char* exp = ${escapeCLikeString(tc.expected)};\n`;
      runner += `        if (res != NULL && strcmp(res, exp) == 0) passed++;\n`;
    } else if (sig.returns === 'integer[]') {
      const expArr = Array.isArray(tc.expected) ? tc.expected : [];
      runner += `        int exp[] = {${expArr.length ? expArr.map(formatNumber).join(', ') : '0'}};\n`;
      runner += `        bool ok = (returnSize == ${expArr.length}) && (${expArr.length === 0 ? 'true' : 'res != NULL'});\n`;
      runner += `        for (int k = 0; k < returnSize && ok; k++) if (res[k] != exp[k]) ok = false;\n`;
      runner += `        if (ok) passed++;\n`;
    } else if (sig.returns === 'char[]') {
      const expArr = Array.isArray(tc.expected) ? tc.expected : [];
      const eChars = expArr.map(escapeCLikeChar).join(', ');
      runner += `        char exp[] = {${eChars}${eChars ? ', ' : ''}'\\0'};\n`;
      runner += `        if (res != NULL && returnSize == ${expArr.length} && memcmp(res, exp, ${expArr.length}) == 0) passed++;\n`;
    }

    runner += `        else { printf("%sFailed|%d\\n", ${escapeCLikeString(marker)}, ${i}); return 0; }\n    }\n`;
  });

  runner += `    printf("%sPassed|%d\\n", ${escapeCLikeString(marker)}, passed);\n    return 0;\n}\n`;
  return { sourceCode: runner };
}

// ---------- Java Runner ----------

const JAVA_SUPPORTED_TYPES = new Set([
  'integer',
  'string',
  'boolean',
  'char',
  'integer[]',
  'string[]',
  'boolean[]',
  'char[]',
  'float[]',
  'integer[][]',
  'string[][]',
]);

function getJavaType(type: string): string {
  switch (type) {
    case 'integer': return 'int';
    case 'string': return 'String';
    case 'boolean': return 'boolean';
    case 'char': return 'char';
    case 'integer[]': return 'int[]';
    case 'string[]': return 'String[]';
    case 'boolean[]': return 'boolean[]';
    case 'char[]': return 'char[]';
    case 'float[]': return 'double[]';
    case 'integer[][]': return 'int[][]';
    case 'string[][]': return 'String[][]';
    default: return 'Object';
  }
}

function getJavaVal(type: string, val: unknown): string {
  if (type === 'integer') return formatNumber(val);
  if (type === 'string') return escapeCLikeString(val);
  if (type === 'boolean') return val ? 'true' : 'false';
  if (type === 'char') return escapeCLikeChar(val);
  if (type === 'integer[]') return `new int[]{${(Array.isArray(val) ? val : []).map(formatNumber).join(',')}}`;
  if (type === 'float[]') return `new double[]{${(Array.isArray(val) ? val : []).map(formatNumber).join(',')}}`;
  if (type === 'boolean[]') return `new boolean[]{${(Array.isArray(val) ? val : []).map((v) => (v ? 'true' : 'false')).join(',')}}`;
  if (type === 'string[]') return `new String[]{${(Array.isArray(val) ? val : []).map(escapeCLikeString).join(',')}}`;
  if (type === 'char[]') return `new char[]{${(Array.isArray(val) ? val : []).map(escapeCLikeChar).join(',')}}`;
  if (type === 'integer[][]') {
    const arr = Array.isArray(val) ? val : [];
    return `new int[][]{${arr.map((r) => `{${(Array.isArray(r) ? r : []).map(formatNumber).join(',')}}`).join(',')}}`;
  }
  if (type === 'string[][]') {
    const arr = Array.isArray(val) ? val : [];
    return `new String[][]{${arr.map((r) => `{${(Array.isArray(r) ? r : []).map(escapeCLikeString).join(',')}}`).join(',')}}`;
  }
  return 'null';
}

function generateJavaRunner(userCode: string, problem: SubmissionProblem, marker: string): { sourceCode?: string; unsupportedReason?: string } {
  const sig = problem.signature;
  const allTypes = [sig.returns, ...sig.params.map((p) => p.type)];
  const unsupported = allTypes.find((t) => !JAVA_SUPPORTED_TYPES.has(t));
  if (unsupported) {
    return { unsupportedReason: `Server submission in Java does not support the "${unsupported}" type for this problem. Try JavaScript, TypeScript, or Python, or use Run.` };
  }
  if (problem.testCases.some((tc) => containsNullDeep(tc.input) || containsNullDeep(tc.expected))) {
    return { unsupportedReason: 'Server submission in Java does not support null elements in this problem’s test cases. Try JavaScript, TypeScript, or Python.' };
  }

  let runner = `import java.util.*;\nimport java.util.stream.*;\n\n${userCode}\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int passed = 0;\n`;
  problem.testCases.forEach((tc, i) => {
    const inputArr = normalizeInputArray(tc.input);
    runner += `        {\n`;
    sig.params.forEach((param, j) => {
      runner += `            ${getJavaType(param.type)} ${param.name} = ${getJavaVal(param.type, inputArr[j])};\n`;
    });
    const callArgs = sig.params.map((p) => p.name).join(', ');
    runner += `            ${getJavaType(sig.returns)} res = sol.${sig.name}(${callArgs});\n`;
    runner += `            ${getJavaType(sig.returns)} exp = ${getJavaVal(sig.returns, tc.expected)};\n`;

    if (sig.returns.endsWith('[][]')) {
      runner += `            if (Arrays.deepEquals(res, exp)) passed++;\n`;
    } else if (sig.returns.endsWith('[]')) {
      runner += `            if (Arrays.equals(res, exp)) passed++;\n`;
    } else if (sig.returns === 'string') {
      runner += `            if (Objects.equals(res, exp)) passed++;\n`;
    } else {
      runner += `            if (res == exp) passed++;\n`;
    }
    runner += `            else { System.out.println(${escapeCLikeString(marker)} + "Failed|" + ${i}); return; }\n        }\n`;
  });
  runner += `        System.out.println(${escapeCLikeString(marker)} + "Passed|" + passed);\n    }\n}\n`;
  return { sourceCode: runner };
}

// ---------- C# Runner ----------

const CSHARP_SUPPORTED_TYPES = new Set([
  'integer',
  'string',
  'boolean',
  'char',
  'integer[]',
  'string[]',
  'boolean[]',
  'char[]',
  'float[]',
  'integer[][]',
  'string[][]',
]);

function getCsharpType(type: string): string {
  switch (type) {
    case 'integer': return 'int';
    case 'string': return 'string';
    case 'boolean': return 'bool';
    case 'char': return 'char';
    case 'integer[]': return 'int[]';
    case 'string[]': return 'string[]';
    case 'boolean[]': return 'bool[]';
    case 'char[]': return 'char[]';
    case 'float[]': return 'double[]';
    case 'integer[][]': return 'int[][]';
    case 'string[][]': return 'string[][]';
    default: return 'object';
  }
}

function getCsharpVal(type: string, val: unknown): string {
  if (type === 'integer') return formatNumber(val);
  if (type === 'string') return escapeCLikeString(val);
  if (type === 'boolean') return val ? 'true' : 'false';
  if (type === 'char') return escapeCLikeChar(val);
  if (type === 'integer[]') return `new int[]{${(Array.isArray(val) ? val : []).map(formatNumber).join(',')}}`;
  if (type === 'float[]') return `new double[]{${(Array.isArray(val) ? val : []).map(formatNumber).join(',')}}`;
  if (type === 'boolean[]') return `new bool[]{${(Array.isArray(val) ? val : []).map((v) => (v ? 'true' : 'false')).join(',')}}`;
  if (type === 'string[]') return `new string[]{${(Array.isArray(val) ? val : []).map(escapeCLikeString).join(',')}}`;
  if (type === 'char[]') return `new char[]{${(Array.isArray(val) ? val : []).map(escapeCLikeChar).join(',')}}`;
  if (type === 'integer[][]') {
    const arr = Array.isArray(val) ? val : [];
    return `new int[][]{${arr.map((r) => `new int[]{${(Array.isArray(r) ? r : []).map(formatNumber).join(',')}}`).join(',')}}`;
  }
  if (type === 'string[][]') {
    const arr = Array.isArray(val) ? val : [];
    return `new string[][]{${arr.map((r) => `new string[]{${(Array.isArray(r) ? r : []).map(escapeCLikeString).join(',')}}`).join(',')}}`;
  }
  return 'null';
}

function generateCsharpRunner(userCode: string, problem: SubmissionProblem, marker: string): { sourceCode?: string; unsupportedReason?: string } {
  const sig = problem.signature;
  const allTypes = [sig.returns, ...sig.params.map((p) => p.type)];
  const unsupported = allTypes.find((t) => !CSHARP_SUPPORTED_TYPES.has(t));
  if (unsupported) {
    return { unsupportedReason: `Server submission in C# does not support the "${unsupported}" type for this problem. Try JavaScript, TypeScript, or Python, or use Run.` };
  }
  if (problem.testCases.some((tc) => containsNullDeep(tc.input) || containsNullDeep(tc.expected))) {
    return { unsupportedReason: 'Server submission in C# does not support null elements in this problem’s test cases. Try JavaScript, TypeScript, or Python.' };
  }

  let runner = `using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\n${userCode}\n\npublic class Program {\n    public static void Main(string[] args) {\n        Solution sol = new Solution();\n        int passed = 0;\n`;
  problem.testCases.forEach((tc, i) => {
    const inputArr = normalizeInputArray(tc.input);
    runner += `        {\n`;
    sig.params.forEach((param, j) => {
      runner += `            ${getCsharpType(param.type)} ${param.name} = ${getCsharpVal(param.type, inputArr[j])};\n`;
    });
    const callArgs = sig.params.map((p) => p.name).join(', ');
    runner += `            ${getCsharpType(sig.returns)} res = sol.${sig.name}(${callArgs});\n`;
    runner += `            ${getCsharpType(sig.returns)} exp = ${getCsharpVal(sig.returns, tc.expected)};\n`;

    if (sig.returns.endsWith('[][]')) {
      runner += `            bool ok = res != null && res.Length == exp.Length;\n`;
      runner += `            if (ok) for (int k = 0; k < res.Length; k++) if (res[k] == null || !res[k].SequenceEqual(exp[k])) ok = false;\n`;
      runner += `            if (ok) passed++;\n`;
    } else if (sig.returns.endsWith('[]')) {
      runner += `            if (res != null && res.SequenceEqual(exp)) passed++;\n`;
    } else {
      runner += `            if (res == exp) passed++;\n`;
    }
    runner += `            else { Console.WriteLine(${escapeCLikeString(marker)} + "Failed|" + ${i}); return; }\n        }\n`;
  });
  runner += `        Console.WriteLine(${escapeCLikeString(marker)} + "Passed|" + passed);\n    }\n}\n`;
  return { sourceCode: runner };
}

export function generateExecutionWrapper(
  language: SubmissionLanguage,
  userCode: string,
  problem: SubmissionProblem,
  marker: string
): { paizaLanguage: PaizaLanguage; sourceCode?: string; unsupportedReason?: string } {
  const paizaLanguage = normalizePaizaLanguage(language);
  switch (paizaLanguage) {
    case 'javascript':
      return { paizaLanguage, sourceCode: generateJsOrTsRunner(userCode, problem, marker, false) };
    case 'typescript':
      return { paizaLanguage, sourceCode: generateJsOrTsRunner(userCode, problem, marker, true) };
    case 'python3':
      return { paizaLanguage, sourceCode: generatePythonRunner(userCode, problem, marker) };
    case 'cpp':
      return { paizaLanguage, ...generateCppRunner(userCode, problem, marker) };
    case 'c':
      return { paizaLanguage, ...generateCRunner(userCode, problem, marker) };
    case 'java':
      return { paizaLanguage, ...generateJavaRunner(userCode, problem, marker) };
    case 'csharp':
      return { paizaLanguage, ...generateCsharpRunner(userCode, problem, marker) };
  }
}

// ---------- Paiza External Execution Provider ----------

export interface PaizaProviderOptions {
  baseUrl?: string;
  apiKey?: string;
  pollIntervalMs?: number;
  fetchImpl?: typeof fetch;
}

export function createPaizaProvider(options: PaizaProviderOptions = {}): ExecutionProvider {
  const baseUrl = (options.baseUrl || process.env.PAIZA_API_BASE || 'https://api.paiza.io').replace(/\/+$/, '');
  const apiKey = options.apiKey || process.env.PAIZA_API_KEY || 'guest';
  const pollIntervalMs = options.pollIntervalMs ?? 1000;
  const fetchImpl = options.fetchImpl ?? fetch;

  return async ({ language, sourceCode, timeoutMs, signal }: ProviderExecutionRequest): Promise<ProviderExecutionResponse> => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', onExternalAbort, { once: true });
    }

    const requestJson = async (url: string, init?: RequestInit): Promise<Record<string, any>> => {
      let response: Response;
      try {
        response = await fetchImpl(url, { ...init, signal: controller.signal });
      } catch {
        if (timedOut) {
          throw new ExecutionProviderError('timeout', 'Time Limit Exceeded: execution timed out.');
        }
        throw new ExecutionProviderError('provider', 'Code execution service is temporarily unavailable. Please try again.');
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new ExecutionProviderError('provider', `Code execution service returned an invalid response (HTTP ${response.status}).`);
      }

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ExecutionProviderError('provider', 'Code execution service returned a malformed response.');
      }
      const record = data as Record<string, any>;
      if (!response.ok || record.error) {
        throw new ExecutionProviderError('provider', typeof record.error === 'string' && record.error.trim()
          ? `Execution service error: ${record.error.trim()}`
          : `Code execution service request failed (HTTP ${response.status}).`);
      }
      return record;
    };

    try {
      const createData = await requestJson(`${baseUrl}/runners/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: sourceCode,
          language,
          api_key: apiKey,
        }),
      });

      if (typeof createData.id !== 'string' || !createData.id) {
        throw new ExecutionProviderError('provider', 'Code execution service did not return a runner ID.');
      }

      const maxPolls = Math.max(1, Math.ceil(timeoutMs / Math.max(50, pollIntervalMs)));
      let details: Record<string, any> | null = null;
      for (let i = 0; i < maxPolls; i++) {
        if (controller.signal.aborted) {
          throw new ExecutionProviderError(timedOut ? 'timeout' : 'provider', timedOut ? 'Time Limit Exceeded: execution timed out.' : 'Submission request was cancelled.');
        }
        details = await requestJson(
          `${baseUrl}/runners/get_details?id=${encodeURIComponent(createData.id)}&api_key=${encodeURIComponent(apiKey)}`
        );
        if (details.status === 'completed') break;
        await new Promise<void>((resolve) => {
          const waitTimer = setTimeout(resolve, pollIntervalMs);
          controller.signal.addEventListener('abort', () => {
            clearTimeout(waitTimer);
            resolve();
          }, { once: true });
        });
      }

      if (!details || details.status !== 'completed') {
        throw new ExecutionProviderError('timeout', 'Time Limit Exceeded: execution timed out.');
      }

      return details as ProviderExecutionResponse;
    } finally {
      clearTimeout(timeout);
      if (signal) signal.removeEventListener('abort', onExternalAbort);
    }
  };
}

// ---------- Isolated External Judge Integration Boundary ----------

export interface IsolatedJudgeProviderOptions {
  baseUrl?: string;
  token?: string;
  limits?: Partial<JudgeResourceLimits>;
  fetchImpl?: typeof fetch;
}

/**
 * Integration boundary for a dedicated, out-of-process isolated container/microVM judge service.
 * Sends explicit CPU, memory, output-size, timeout, and network-disabled execution constraints.
 * Express never executes untrusted student code in-process.
 */
export function createIsolatedJudgeProvider(options: IsolatedJudgeProviderOptions = {}): ExecutionProvider {
  const baseUrl = (options.baseUrl ?? process.env.ISOLATED_JUDGE_URL ?? '').trim().replace(/\/+$/, '');
  if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
    throw new Error('ISOLATED_JUDGE_URL must be configured with an http(s) URL when JUDGE_PROVIDER=isolated.');
  }
  const token = (options.token ?? process.env.ISOLATED_JUDGE_TOKEN ?? '').trim();
  const fetchImpl = options.fetchImpl ?? fetch;
  const configuredLimits: JudgeResourceLimits = {
    cpuTimeLimitSec: Number(options.limits?.cpuTimeLimitSec ?? process.env.JUDGE_CPU_LIMIT_SEC) || DEFAULT_JUDGE_LIMITS.cpuTimeLimitSec,
    memoryLimitMb: Number(options.limits?.memoryLimitMb ?? process.env.JUDGE_MEMORY_LIMIT_MB) || DEFAULT_JUDGE_LIMITS.memoryLimitMb,
    maxOutputBytes: Number(options.limits?.maxOutputBytes) || DEFAULT_JUDGE_LIMITS.maxOutputBytes,
    networkDisabled: true,
  };

  return async ({ language, sourceCode, timeoutMs, limits, signal }: ProviderExecutionRequest): Promise<ProviderExecutionResponse> => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}/execute`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            language,
            sourceCode,
            timeoutMs,
            limits: { ...configuredLimits, ...limits, networkDisabled: true },
          }),
          signal: controller.signal,
        });
      } catch {
        if (timedOut) {
          throw new ExecutionProviderError('timeout', 'Time Limit Exceeded: execution timed out.');
        }
        throw new ExecutionProviderError('provider', 'Isolated judge service is temporarily unavailable. Please try again.');
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new ExecutionProviderError('provider', `Isolated judge returned an invalid response (HTTP ${response.status}).`);
      }

      if (!response.ok || !data || typeof data !== 'object' || Array.isArray(data)) {
        const msg = (data as Record<string, unknown> | null)?.error;
        throw new ExecutionProviderError(
          'provider',
          typeof msg === 'string' && msg.trim()
            ? `Isolated judge error: ${msg.trim()}`
            : `Isolated judge request failed (HTTP ${response.status}).`
        );
      }

      return data as ProviderExecutionResponse;
    } finally {
      clearTimeout(timeout);
      if (signal) signal.removeEventListener('abort', onExternalAbort);
    }
  };
}

export function resolveExecutionProvider(env: NodeJS.ProcessEnv = process.env): ExecutionProvider {
  const mode = (env.JUDGE_PROVIDER || 'paiza').trim().toLowerCase();
  if (mode === 'isolated') {
    return createIsolatedJudgeProvider({
      baseUrl: env.ISOLATED_JUDGE_URL,
      token: env.ISOLATED_JUDGE_TOKEN,
    });
  }
  return createPaizaProvider({
    baseUrl: env.PAIZA_API_BASE,
    apiKey: env.PAIZA_API_KEY,
  });
}

// ---------- Verdict Calculation ----------

function computeExecutionTimeMs(details: ProviderExecutionResponse, parsedTimeMs: unknown, startedAt: number): number {
  if (typeof parsedTimeMs === 'number' && Number.isFinite(parsedTimeMs) && parsedTimeMs >= 0) {
    return Math.round(parsedTimeMs);
  }
  const providerSeconds = details.time != null ? Number(details.time) : NaN;
  if (Number.isFinite(providerSeconds) && providerSeconds >= 0) {
    return Math.round(providerSeconds * 1000);
  }
  return Math.max(0, Math.round(performance.now() - startedAt));
}

function looksLikeSyntaxError(stderr: string): boolean {
  return /\b(SyntaxError|IndentationError|TabError|error TS\d+)\b/i.test(stderr);
}

export async function evaluateSubmission(params: {
  problem: SubmissionProblem;
  code: string;
  language: SubmissionLanguage;
  provider?: ExecutionProvider;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<ServerSubmissionResult> {
  const { problem, code, language, signal } = params;
  const timeoutMs = params.timeoutMs ?? DEFAULT_EXECUTION_TIMEOUT_MS;
  const provider = params.provider ?? resolveExecutionProvider();
  const startedAt = performance.now();

  const visibleCount = Array.isArray(problem.testCases) ? problem.testCases.length : 0;
  const hiddenCases = Array.isArray(problem.hiddenTestCases) ? problem.hiddenTestCases : [];
  const hiddenCount = hiddenCases.length;
  const allTestCases = [...(Array.isArray(problem.testCases) ? problem.testCases : []), ...hiddenCases];

  if (allTestCases.length === 0) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount: 0,
      visibleCount: 0,
      hiddenCount: 0,
      executionTimeMs: 0,
      message: 'No test cases are available for this problem.',
      stdout: [],
      errorType: 'unsupported',
      recordable: false,
    };
  }

  if (
    !problem.signature ||
    !isSafeIdentifier(problem.signature.name) ||
    !Array.isArray(problem.signature.params) ||
    !problem.signature.params.every((p) => p && isSafeIdentifier(p.name) && typeof p.type === 'string') ||
    typeof problem.signature.returns !== 'string'
  ) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount: allTestCases.length,
      visibleCount,
      hiddenCount,
      executionTimeMs: 0,
      message: 'This problem is missing a valid function signature for server verification.',
      stdout: [],
      errorType: 'unsupported',
      recordable: false,
    };
  }

  const totalCount = allTestCases.length;
  const combinedProblem: SubmissionProblem = { ...problem, testCases: allTestCases };
  const marker = `__ALVIO_RES_${randomBytes(6).toString('hex')}__:`;
  const wrapped = generateExecutionWrapper(language, code, combinedProblem, marker);

  if (wrapped.unsupportedReason || !wrapped.sourceCode) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: 0,
      message: wrapped.unsupportedReason || 'This language is not supported for server submission on this problem.',
      stdout: [],
      errorType: 'unsupported',
      recordable: false,
    };
  }

  let details: ProviderExecutionResponse;
  try {
    details = await provider({
      language: wrapped.paizaLanguage,
      sourceCode: wrapped.sourceCode,
      timeoutMs,
      signal,
    });
  } catch (err: any) {
    const elapsed = Math.max(0, Math.round(performance.now() - startedAt));
    if (err instanceof ExecutionProviderError && err.kind === 'timeout') {
      return {
        status: 'Error',
        passedCount: 0,
        totalCount,
        visibleCount,
        hiddenCount,
        executionTimeMs: elapsed,
        message: 'Time Limit Exceeded: execution timed out.',
        stdout: [],
        errorType: 'timeout',
        recordable: true,
      };
    }
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: elapsed,
      message: err instanceof ExecutionProviderError
        ? err.message
        : 'Code execution service is temporarily unavailable. Please try again.',
      stdout: [],
      errorType: 'provider',
      recordable: false,
    };
  }

  if (!details || typeof details !== 'object' || typeof details.status !== 'string') {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: Math.max(0, Math.round(performance.now() - startedAt)),
      message: 'Code execution service returned a malformed response.',
      stdout: [],
      errorType: 'provider',
      recordable: false,
    };
  }

  if (details.status !== 'completed' || details.result === 'timeout') {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: 'Time Limit Exceeded: execution timed out.',
      stdout: [],
      errorType: 'timeout',
      recordable: true,
    };
  }

  if (details.build_result && details.build_result !== 'success') {
    const buildMsg = details.build_stderr || details.build_stdout || 'Compilation failed.';
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: trimMessage(`Compilation Error:\n${buildMsg}`),
      stdout: [],
      errorType: 'compilation',
      recordable: true,
    };
  }

  const rawStdout = typeof details.stdout === 'string'
    ? details.stdout.slice(-MAX_PROVIDER_OUTPUT_BYTES).trim()
    : '';
  const rawStderr = typeof details.stderr === 'string'
    ? details.stderr.slice(0, MAX_PROVIDER_OUTPUT_BYTES).trim()
    : '';

  if (details.result !== 'success' || (details.exit_code != null && Number(details.exit_code) !== 0)) {
    const isSyntax = looksLikeSyntaxError(rawStderr);
    const errText = rawStderr || rawStdout || 'Runtime Error';
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: trimMessage(isSyntax ? `Compilation Error:\n${errText}` : errText),
      stdout: [],
      errorType: isSyntax ? 'compilation' : 'runtime',
      recordable: true,
    };
  }

  if (!rawStdout) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: trimMessage(rawStderr || 'Execution completed without a test result.'),
      stdout: [],
      errorType: 'runtime',
      recordable: true,
    };
  }

  const outLines = rawStdout.split(/\r?\n/);
  let markerIndex = -1;
  for (let i = outLines.length - 1; i >= 0; i--) {
    if (outLines[i].startsWith(marker)) {
      markerIndex = i;
      break;
    }
  }

  if (markerIndex === -1) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: 'Execution completed without a valid test result.',
      stdout: outLines.slice(0, MAX_STDOUT_LINES),
      errorType: 'runtime',
      recordable: true,
    };
  }

  const payloadStr = outLines[markerIndex].slice(marker.length).trim();
  const capturedBeforeMarker = outLines.slice(0, markerIndex).filter((line) => line.length > 0).slice(0, MAX_STDOUT_LINES);

  let parsed: {
    status?: unknown;
    passedCount?: unknown;
    message?: unknown;
    stdout?: unknown;
    executionTimeMs?: unknown;
    errorType?: unknown;
    failedTestCase?: unknown;
  } | null = null;

  const pipeMatch = /^(Passed|Failed)\|(\d+)$/.exec(payloadStr);
  if (payloadStr.startsWith('{')) {
    try {
      const json = JSON.parse(payloadStr);
      if (json && typeof json === 'object' && !Array.isArray(json)) {
        parsed = json;
      }
    } catch {
      parsed = null;
    }
  } else if (pipeMatch) {
    const status = pipeMatch[1] as 'Passed' | 'Failed';
    const count = Number(pipeMatch[2]);
    const failingCase = status === 'Failed' ? allTestCases[count] : undefined;
    parsed = {
      status,
      passedCount: count,
      message: status === 'Passed'
        ? (hiddenCount > 0 ? 'All visible and hidden test cases passed.' : 'All provided test cases passed.')
        : `Test Case ${count + 1} Failed. Wrong Answer.`,
      ...(failingCase
        ? { failedTestCase: { index: count + 1, input: failingCase.input, expected: failingCase.expected } }
        : {}),
    };
  }

  if (!parsed || !['Passed', 'Failed', 'Error'].includes(String(parsed.status))) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: 'Execution returned an unreadable test result.',
      stdout: capturedBeforeMarker,
      errorType: 'provider',
      recordable: false,
    };
  }

  const status = parsed.status as VerdictStatus;
  const passedCount = typeof parsed.passedCount === 'number' ? parsed.passedCount : 0;

  if (
    !Number.isInteger(passedCount) ||
    passedCount < 0 ||
    passedCount > totalCount ||
    (status === 'Passed' && passedCount !== totalCount) ||
    (status === 'Failed' && passedCount >= totalCount)
  ) {
    return {
      status: 'Error',
      passedCount: 0,
      totalCount,
      visibleCount,
      hiddenCount,
      executionTimeMs: computeExecutionTimeMs(details, undefined, startedAt),
      message: 'Execution returned an invalid test count.',
      stdout: capturedBeforeMarker,
      errorType: 'provider',
      recordable: false,
    };
  }

  const stdout = Array.isArray(parsed.stdout)
    ? parsed.stdout.slice(0, MAX_STDOUT_LINES).map((item) => String(item))
    : capturedBeforeMarker;

  const isHiddenFailure = status === 'Failed' && passedCount >= visibleCount;

  const defaultMessage =
    status === 'Passed'
      ? (hiddenCount > 0 ? 'All visible and hidden test cases passed.' : 'All provided test cases passed.')
      : status === 'Failed'
        ? (isHiddenFailure
          ? `Hidden Test Case ${passedCount - visibleCount + 1} Failed. Wrong Answer.`
          : `Test Case ${passedCount + 1} Failed. Wrong Answer.`)
        : 'Runtime Error';

  // Never leak hidden test case inputs, expected outputs, or actual outputs back to the client.
  const message = isHiddenFailure
    ? `Hidden Test Case ${passedCount - visibleCount + 1} Failed. Wrong Answer.`
    : (typeof parsed.message === 'string' && parsed.message.trim()
      ? trimMessage(parsed.message)
      : defaultMessage);

  const errorType: SubmissionErrorType =
    status === 'Error'
      ? (parsed.errorType === 'compilation' || parsed.errorType === 'timeout' ? parsed.errorType : 'runtime')
      : null;

  let failedTestCase: FailedTestCaseDetail | undefined;
  if (status === 'Failed') {
    if (isHiddenFailure) {
      failedTestCase = { index: passedCount + 1, hidden: true };
    } else {
      const rawDetail =
        parsed.failedTestCase && typeof parsed.failedTestCase === 'object' && !Array.isArray(parsed.failedTestCase)
          ? (parsed.failedTestCase as Record<string, unknown>)
          : undefined;
      const fallbackCase = allTestCases[passedCount];
      failedTestCase = {
        index:
          typeof rawDetail?.index === 'number' && Number.isInteger(rawDetail.index) && rawDetail.index >= 1
            ? rawDetail.index
            : passedCount + 1,
        hidden: false,
        input: rawDetail && 'input' in rawDetail ? rawDetail.input : fallbackCase?.input,
        expected: rawDetail && 'expected' in rawDetail ? rawDetail.expected : fallbackCase?.expected,
        ...(rawDetail && 'actual' in rawDetail ? { actual: rawDetail.actual } : {}),
      };
    }
  }

  return {
    status,
    passedCount,
    totalCount,
    visibleCount,
    hiddenCount,
    executionTimeMs: computeExecutionTimeMs(details, parsed.executionTimeMs, startedAt),
    message,
    stdout,
    errorType,
    recordable: true,
    ...(failedTestCase ? { failedTestCase } : {}),
  };
}
