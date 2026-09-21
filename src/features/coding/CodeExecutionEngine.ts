// ============================================================
// Code Execution Engine (Client-side JS Sandbox)
// ============================================================

import type { CodingProblem, TestCase, DataType } from '../../data/codingProblems';

export interface ExecutionResult {
  status: 'Passed' | 'Failed' | 'Error';
  message?: string;
  passedCount: number;
  totalCount: number;
  stdout: string[];
  executionTimeMs: number;
}

export async function executeJavaScript(userCode:string,testCases:TestCase[],functionName:string):Promise<ExecutionResult>{
 const source=`const run = ${executeJavaScriptInline.toString()}; self.onmessage=async(e)=>self.postMessage(await run(...e.data));`;
 const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
 return new Promise(resolve=>{const worker=new Worker(url);const finish=(result:ExecutionResult)=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);resolve(result)};const timer=setTimeout(()=>finish({status:'Error',message:'Time Limit Exceeded (3 seconds)',passedCount:0,totalCount:testCases.length,stdout:[],executionTimeMs:3000}),3000);worker.onmessage=e=>finish(e.data);worker.onerror=e=>finish({status:'Error',message:e.message||'Runtime Error',passedCount:0,totalCount:testCases.length,stdout:[],executionTimeMs:0});worker.postMessage([userCode,testCases,functionName]);});
}

async function executeJavaScriptInline(userCode: string, testCases: TestCase[], functionName: string): Promise<ExecutionResult> {
  const stdout: string[] = [];
  let passedCount = 0;
  const originalLog = console.log;
  const mockConsole = {
    log: (...args: any[]) => {
      stdout.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    }
  };
  const startTime = performance.now();
  try {
    const wrappedCode = `
      return (function() {
        const console = mockConsole;
        ${userCode}
        if (typeof ${functionName} !== 'function') {
          throw new Error('Function ' + '${functionName}' + ' is not defined.');
        }
        return ${functionName};
      })();
    `;
    const evaluator = new Function('mockConsole', wrappedCode);
    const userFn = evaluator(mockConsole);
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const rawInput = tc?.input;
      const inputArr = Array.isArray(rawInput) ? rawInput : (rawInput !== undefined && rawInput !== null ? [rawInput] : []);
      const inputClone = JSON.parse(JSON.stringify(inputArr));
      const result = userFn(...inputClone);
      if (JSON.stringify(result) === JSON.stringify(tc.expected)) {
        passedCount++;
      } else {
        return {
          status: 'Failed',
          message: `Test Case ${i + 1} Failed.\nInput: ${JSON.stringify(tc.input)}\nExpected: ${JSON.stringify(tc.expected)}\nOutput: ${JSON.stringify(result)}`,
          passedCount, totalCount: testCases.length, stdout,
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }
    return { status: 'Passed', passedCount, totalCount: testCases.length, stdout, executionTimeMs: Math.round(performance.now() - startTime) };
  } catch (err: any) {
    return { status: 'Error', message: err.message || String(err), passedCount, totalCount: testCases.length, stdout, executionTimeMs: Math.round(performance.now() - startTime) };
  } finally {
    console.log = originalLog;
  }
}

export function extractFunctionName(code: string, preferredName?: string): string {
  const declarations = /\b(?:function|def)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|\b(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?::[^=;\n]+)?=\s*(?:async\s+)?(?:function\b|(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)(?:\s*:[^=;\n]+)?\s*=>)/g;
  const names = Array.from(code.matchAll(declarations), match => match[1] || match[2]);
  return (preferredName && names.includes(preferredName) ? preferredName : names[0]) || 'solution';
}

export async function executePython(userCode: string, testCases: TestCase[], functionName: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  const escapedTestCases = JSON.stringify(JSON.stringify(testCases));
  const runner = `
import json, sys, time
from typing import *
${userCode}
test_cases = json.loads(${escapedTestCases})
passed = 0
stdout = []
class StdoutCapture:
    def write(self, text):
        if text.strip(): stdout.append(text.strip())
    def flush(self): pass
sys.stdout = StdoutCapture()
try:
    func = None
    if 'Solution' in globals():
        obj = globals()['Solution']()
        if hasattr(obj, '${functionName}'):
            func = getattr(obj, '${functionName}')
    if not func:
        func = globals().get('${functionName}')

    if not func:
        sys.stdout = sys.__stdout__
        print(json.dumps({"status": "Error", "message": f"Function ${functionName} not found. Please ensure it's defined at the top level or inside 'class Solution:'.", "passedCount": 0}))
        sys.exit(0)
    start_time = time.time()
    for i, tc in enumerate(test_cases):
        try:
            raw_inp = tc.get('input') if isinstance(tc, dict) else tc
            inp = raw_inp if isinstance(raw_inp, list) else ([raw_inp] if raw_inp is not None else [])
            result = func(*inp)
            if result == tc['expected']: passed += 1
            else:
                sys.stdout = sys.__stdout__
                print(json.dumps({"status": "Failed", "message": f"Test Case {i+1} Failed.\\nInput: {tc['input']}\\nExpected: {tc['expected']}\\nOutput: {result}", "passedCount": passed, "stdout": stdout, "executionTimeMs": int((time.time() - start_time) * 1000)}))
                sys.exit(0)
        except Exception as e:
            sys.stdout = sys.__stdout__
            print(json.dumps({"status": "Error", "message": str(e), "passedCount": passed, "stdout": stdout, "executionTimeMs": int((time.time() - start_time) * 1000)}))
            sys.exit(0)
    sys.stdout = sys.__stdout__
    print(json.dumps({"status": "Passed", "passedCount": passed, "stdout": stdout, "executionTimeMs": int((time.time() - start_time) * 1000)}))
except Exception as e:
    sys.stdout = sys.__stdout__
    print(json.dumps({"status": "Error", "message": str(e), "passedCount": passed, "stdout": [], "executionTimeMs": 0}))
`;
  return await executeOnPaiza('python3', runner, testCases.length, startTime);
}

function getCppType(type: DataType): string {
    switch(type) {
        case 'integer': return 'int';
        case 'string': return 'string';
        case 'boolean': return 'bool';
        case 'integer[]': return 'vector<int>';
        case 'string[]': return 'vector<string>';
        case 'integer[][]': return 'vector<vector<int>>';
        case 'char[]': return 'vector<char>';
        default: return 'int';
    }
}

function getCppVal(type: DataType, val: any): string {
    if (type === 'integer') return String(val);
    if (type === 'boolean') return val ? 'true' : 'false';
    if (type === 'string') return `"${val}"`;
    if (type === 'char[]') {
        if (!val || val.length === 0) return '{}';
        return '{' + val.map((c:any) => `'${c}'`).join(', ') + '}';
    }
    if (type === 'integer[]' || type === 'string[]') {
        if (!val || val.length === 0) return '{}';
        if (type === 'string[]') return '{' + val.map((v:any) => `"${v}"`).join(', ') + '}';
        return '{' + val.join(', ') + '}';
    }
    if (type === 'integer[][]') {
        if (!val || val.length === 0) return '{}';
        return '{' + val.map((arr:any) => '{' + arr.join(', ') + '}').join(', ') + '}';
    }
    return String(val);
}

function generateCppRunner(userCode: string, problem: CodingProblem): string {
    const sig = problem.signature;
    if (!sig) return '#error "Missing signature"';

    let runner = `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n${userCode}\n\nint main() {\n    Solution sol;\n    int passed = 0;\n`;

    problem.testCases.forEach((tc, i) => {
        const inputArr = Array.isArray(tc?.input) ? tc.input : (tc?.input !== undefined && tc?.input !== null ? [tc.input] : []);
        runner += `    {\n`;
        sig.params.forEach((param, j) => {
            runner += `        ${getCppType(param.type)} ${param.name} = ${getCppVal(param.type, inputArr[j])};\n`;
        });

        const callArgs = sig.params.map(p => p.name).join(', ');
        runner += `        auto res = sol.${sig.name}(${callArgs});\n`;
        runner += `        ${getCppType(sig.returns)} exp = ${getCppVal(sig.returns, tc.expected)};\n`;
        runner += `        if (res == exp) passed++;\n`;
        runner += `        else { cout << "Failed|" << ${i} << endl; return 0; }\n    }\n`;
    });

    runner += `    cout << "Passed|" << passed << endl;\n    return 0;\n}\n`;
    return runner;
}

export async function executeCpp(userCode: string, problem: CodingProblem): Promise<ExecutionResult> {
    const startTime = performance.now();
    const runner = generateCppRunner(userCode, problem);
    return await executeOnPaiza('cpp', runner, problem.testCases.length, startTime);
}

function generateCRunner(userCode: string, problem: CodingProblem): string {
    const sig = problem.signature;
    if (!sig) return '#error "Missing signature"';

    let runner = `#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n\n${userCode}\n\nint main() {\n    int passed = 0;\n`;

    problem.testCases.forEach((tc, i) => {
        const inputArr = Array.isArray(tc?.input) ? tc.input : (tc?.input !== undefined && tc?.input !== null ? [tc.input] : []);
        runner += `    {\n`;

        let callArgs = [];
        sig.params.forEach((param, j) => {
            const val = inputArr[j];
            if (param.type === 'integer') {
                runner += `        int ${param.name} = ${val};\n`;
                callArgs.push(param.name);
            } else if (param.type === 'string') {
                runner += `        char ${param.name}[] = "${val}";\n`;
                callArgs.push(param.name);
            } else if (param.type === 'integer[]') {
                const arr = Array.isArray(val) ? val : [];
                let init = arr.length ? `{${arr.join(', ')}}` : `{}`;
                runner += `        int ${param.name}Data[] = ${init};\n`;
                runner += `        int* ${param.name} = ${arr.length ? param.name + "Data" : "NULL"};\n`;
                callArgs.push(param.name);
                callArgs.push(arr.length);
            } else if (param.type === 'char[]') {
                const arr = Array.isArray(val) ? val : [];
                let chars = arr.map((c:string)=>`'${c}'`).join(', ');
                runner += `        char ${param.name}[] = {${chars}${chars ? ',' : ''} '\\0'};\n`;
                callArgs.push(param.name);
                callArgs.push(arr.length);
            }
        });

        if (sig.returns === 'integer[]' || sig.returns === 'char[]' || sig.name === 'twoSum') {
            callArgs.push('&returnSize');
            runner += `        int returnSize = 0;\n`;
        }
        if (sig.name === 'merge') {
            callArgs.push('&returnColSizes');
            runner += `        int* returnColSizes = NULL;\n`;
        }

        let retType = 'int';
        if (sig.returns === 'boolean') retType = 'bool';
        if (sig.returns === 'integer[]') retType = 'int*';
        if (sig.returns === 'char[]') retType = 'char*';
        if (sig.returns === 'integer[][]') retType = 'int**';

        runner += `        ${retType} res = ${sig.name}(${callArgs.join(', ')});\n`;

        if (sig.returns === 'integer' || sig.returns === 'boolean') {
            runner += `        ${retType} exp = ${tc.expected};\n`;
            runner += `        if (res == exp) passed++;\n`;
        } else if (sig.returns === 'integer[]') {
            runner += `        int exp[] = {${tc.expected.join(', ')}${tc.expected.length ? '' : '0'}};\n`;
            runner += `        bool ok = (returnSize == ${tc.expected.length});\n`;
            runner += `        for(int k=0; k<returnSize && ok; k++) if(res[k] != exp[k]) ok = false;\n`;
            runner += `        if (ok) passed++;\n`;
        } else if (sig.returns === 'char[]') {
            let eChars = tc.expected.map((c:string)=>`'${c}'`).join(', ');
            runner += `        char exp[] = {${eChars}${eChars ? ',' : ''} '\\0'};\n`;
            runner += `        if (strcmp(res, exp) == 0) passed++;\n`;
        } else {
            runner += `        passed++;\n`;
        }
        runner += `        else { printf("Failed|%d\\n", ${i}); return 0; }\n    }\n`;
    });

    runner += `    printf("Passed|%d\\n", passed);\n    return 0;\n}\n`;
    return runner;
}

export async function executeC(userCode: string, problem: CodingProblem): Promise<ExecutionResult> {
    const startTime = performance.now();
    const runner = generateCRunner(userCode, problem);
    return await executeOnPaiza('c', runner, problem.testCases.length, startTime);
}


type PaizaLanguage = 'python3' | 'c' | 'cpp' | 'typescript' | 'java' | 'csharp';

async function executeOnPaiza(language: PaizaLanguage, code: string, testCasesLength: number, startTime: number): Promise<ExecutionResult> {
  const errorResult = (message: string): ExecutionResult => ({
    status: 'Error', message, passedCount: 0, totalCount: testCasesLength,
    stdout: [], executionTimeMs: Math.round(performance.now() - startTime)
  });
  if (testCasesLength === 0) return errorResult('No test cases are available for this problem.');

  // Bound the requests themselves as well as the polling loop.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const request = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let data: any;
    try { data = await response.json(); } catch {
      throw new Error(`Execution service returned an invalid response (HTTP ${response.status}).`);
    }
    if (!response.ok || data?.error) {
      throw new Error(data?.error || `Execution service request failed (HTTP ${response.status}).`);
    }
    if (!data || typeof data !== 'object') throw new Error('Execution service returned an invalid response.');
    return data;
  };

  try {
    const createData = await request('https://api.paiza.io/runners/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code: code, language, api_key: 'guest' })
    });
    if (typeof createData.id !== 'string' || !createData.id) {
      throw new Error('Execution service did not return a runner ID.');
    }

    let details: any;
    for (let i = 0; i < 15; i++) {
      if (controller.signal.aborted) throw new Error('Execution timed out');
      details = await request(`https://api.paiza.io/runners/get_details?id=${encodeURIComponent(createData.id)}&api_key=guest`);
      if (details.status === 'completed') break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (details?.status !== 'completed') return errorResult('Execution timed out');

    if (details.build_result && details.build_result !== 'success') {
      return errorResult(details.build_stderr || details.build_stdout || 'Build Error');
    }

    const output = typeof details.stdout === 'string' ? details.stdout.trim() : '';
    if (details.result !== 'success' || (details.exit_code != null && Number(details.exit_code) !== 0)) {
      return errorResult(details.stderr || output || 'Runtime Error');
    }
    if (!output) return errorResult(details.stderr || 'Execution completed without a test result.');

    const outLines = output.split(/\r?\n/);
    const lastLine = outLines[outLines.length - 1];
    const marker = /^(Passed|Failed)\|(\d+)$/.exec(lastLine);
    let result: any;
    if (lastLine.startsWith('{')) {
      result = JSON.parse(lastLine);
    } else if (marker) {
      result = { status: marker[1], passedCount: Number(marker[2]), message: marker[1] === 'Failed' ? 'Wrong Answer' : '' };
    }
    if (!result || !['Passed', 'Failed', 'Error'].includes(result.status)) {
      return errorResult('Execution completed without a valid test result.');
    }
    const passedCount = result.passedCount ?? 0;
    if (!Number.isInteger(passedCount) || passedCount < 0 || passedCount > testCasesLength ||
        (result.status === 'Passed' && passedCount !== testCasesLength)) {
      return errorResult('Execution returned an invalid test count.');
    }
    return {
      status: result.status, message: result.message, passedCount, totalCount: testCasesLength,
      stdout: Array.isArray(result.stdout) ? result.stdout : outLines.slice(0, -1),
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  } catch (err: any) {
    return errorResult(controller.signal.aborted ? 'Execution timed out' : err.message || 'Execution failed');
  } finally {
    clearTimeout(timeout);
  }
}

export async function executeTypescript(userCode: string, testCases: any[], functionName: string): Promise<ExecutionResult> {
  const escapedTestCases = JSON.stringify(JSON.stringify(testCases));

  const runner = `
const testCases = JSON.parse(${escapedTestCases});
${userCode}

let passed = 0;
const stdout = [];
const originalLog = console.log;
console.log = (...args) => {
    stdout.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

try {
    const userFunc = eval(\`(${functionName})\`);
    if (typeof userFunc !== 'function') {
        throw new Error('Function ${functionName} not found.');
    }

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const tcInput = Array.isArray(tc.input) ? tc.input : (tc.input !== undefined && tc.input !== null ? [tc.input] : []);
        const res = userFunc(...tcInput);
        if (JSON.stringify(res) === JSON.stringify(tc.expected)) {
            passed++;
        } else {
            originalLog(JSON.stringify({
                status: 'Failed',
                message: \`Test Case \${i + 1} Failed.\\nInput: \${JSON.stringify(tc.input)}\\nExpected: \${JSON.stringify(tc.expected)}\\nOutput: \${JSON.stringify(res)}\`,
                passedCount: passed,
                stdout
            }));
            process.exit(0);
        }
    }
    originalLog(JSON.stringify({status: 'Passed', passedCount: passed, stdout}));
} catch(e) {
    originalLog(JSON.stringify({status: 'Error', message: String(e), passedCount: passed, stdout}));
}
`;

  const startTime = performance.now();
  return await executeOnPaiza('typescript', runner, testCases.length, startTime);
}

function getJavaType(type: DataType): string {
    if (type === 'integer') return 'int';
    if (type === 'string') return 'String';
    if (type === 'boolean') return 'boolean';
    if (type === 'integer[]') return 'int[]';
    if (type === 'char[]') return 'char[]';
    if (type === 'integer[][]') return 'int[][]';
    return 'Object';
}

function getJavaVal(type: DataType, val: any): string {
    if (type === 'integer') return String(val);
    if (type === 'string') return `"${val}"`;
    if (type === 'boolean') return val ? 'true' : 'false';
    if (type === 'integer[]') return `new int[]{${val.join(',')}}`;
    if (type === 'char[]') return `new char[]{${val.map((c:string)=>`'${c}'`).join(',')}}`;
    if (type === 'integer[][]') return `new int[][]{${val.map((r:any)=>`{${r.join(',')}}`).join(',')}}`;
    return 'null';
}

function generateJavaRunner(userCode: string, problem: CodingProblem): string {
    const sig = problem.signature;
    if (!sig) return '#error "Missing signature"';

    let runner = `import java.util.*;\nimport java.util.stream.*;\n\n${userCode}\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int passed = 0;\n`;

    problem.testCases.forEach((tc, i) => {
        const inputArr = Array.isArray(tc?.input) ? tc.input : (tc?.input !== undefined && tc?.input !== null ? [tc.input] : []);
        runner += `        {\n`;
        sig.params.forEach((param, j) => {
            runner += `            ${getJavaType(param.type)} ${param.name} = ${getJavaVal(param.type, inputArr[j])};\n`;
        });

        const callArgs = sig.params.map(p => p.name).join(', ');
        runner += `            ${getJavaType(sig.returns)} res = sol.${sig.name}(${callArgs});\n`;
        runner += `            ${getJavaType(sig.returns)} exp = ${getJavaVal(sig.returns, tc.expected)};\n`;

        if (sig.returns.endsWith('[]')) {
            if (sig.returns === 'integer[][]') {
                runner += `            if (Arrays.deepEquals(res, exp)) passed++;\n`;
            } else {
                runner += `            if (Arrays.equals(res, exp)) passed++;\n`;
            }
        } else {
            if (sig.returns === 'string') {
                runner += `            if (res.equals(exp)) passed++;\n`;
            } else {
                runner += `            if (res == exp) passed++;\n`;
            }
        }
        runner += `            else { System.out.println("Failed|" + ${i}); return; }\n        }\n`;
    });

    runner += `        System.out.println("Passed|" + passed);\n    }\n}\n`;
    return runner;
}

export async function executeJava(userCode: string, problem: CodingProblem): Promise<ExecutionResult> {
    const startTime = performance.now();
    const runner = generateJavaRunner(userCode, problem);
    return await executeOnPaiza('java', runner, problem.testCases.length, startTime);
}

function getCsharpType(type: DataType): string {
    if (type === 'integer') return 'int';
    if (type === 'string') return 'string';
    if (type === 'boolean') return 'bool';
    if (type === 'integer[]') return 'int[]';
    if (type === 'char[]') return 'char[]';
    if (type === 'integer[][]') return 'int[][]';
    return 'object';
}

function getCsharpVal(type: DataType, val: any): string {
    if (type === 'integer') return String(val);
    if (type === 'string') return `"${val}"`;
    if (type === 'boolean') return val ? 'true' : 'false';
    if (type === 'integer[]') return `new int[]{${val.join(',')}}`;
    if (type === 'char[]') return `new char[]{${val.map((c:string)=>`'${c}'`).join(',')}}`;
    if (type === 'integer[][]') return `new int[][]{${val.map((r:any)=>`new int[]{${r.join(',')}}`).join(',')}}`;
    return 'null';
}

function generateCsharpRunner(userCode: string, problem: CodingProblem): string {
    const sig = problem.signature;
    if (!sig) return '#error "Missing signature"';

    let runner = `using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\n${userCode}\n\npublic class Program {\n    public static void Main(string[] args) {\n        Solution sol = new Solution();\n        int passed = 0;\n`;

    problem.testCases.forEach((tc, i) => {
        const inputArr = Array.isArray(tc?.input) ? tc.input : (tc?.input !== undefined && tc?.input !== null ? [tc.input] : []);
        runner += `        {\n`;
        sig.params.forEach((param, j) => {
            runner += `            ${getCsharpType(param.type)} ${param.name} = ${getCsharpVal(param.type, inputArr[j])};\n`;
        });

        const callArgs = sig.params.map(p => p.name).join(', ');
        runner += `            ${getCsharpType(sig.returns)} res = sol.${sig.name}(${callArgs});\n`;
        runner += `            ${getCsharpType(sig.returns)} exp = ${getCsharpVal(sig.returns, tc.expected)};\n`;

        if (sig.returns.endsWith('[]')) {
            if (sig.returns === 'integer[][]') {
                runner += `            bool ok = true;\n`;
                runner += `            if(res.Length != exp.Length) ok = false;\n`;
                runner += `            else for(int k=0; k<res.Length; k++) if(!res[k].SequenceEqual(exp[k])) ok = false;\n`;
                runner += `            if (ok) passed++;\n`;
            } else {
                runner += `            if (res.SequenceEqual(exp)) passed++;\n`;
            }
        } else {
            runner += `            if (res == exp) passed++;\n`;
        }
        runner += `            else { Console.WriteLine("Failed|" + ${i}); return; }\n        }\n`;
    });

    runner += `        Console.WriteLine("Passed|" + passed);\n    }\n}\n`;
    return runner;
}

export async function executeCsharp(userCode: string, problem: CodingProblem): Promise<ExecutionResult> {
    const startTime = performance.now();
    const runner = generateCsharpRunner(userCode, problem);
    return await executeOnPaiza('csharp', runner, problem.testCases.length, startTime);
}
