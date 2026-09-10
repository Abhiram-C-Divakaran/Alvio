import { executeJavaScript, extractFunctionName } from '../../coding/CodeExecutionEngine';
import type { CodingProblem } from '../../../data/codingProblems';
self.onmessage = async ({ data }: MessageEvent<{ code: string; problem: CodingProblem }>) => {
  const result = await executeJavaScript(data.code, data.problem.testCases, extractFunctionName(data.code, data.problem.signature.name));
  self.postMessage(result);
};
