import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

interface SubmittedAnswer {
  questionId: string;
  selectedOptionIndex?: number | null;
  codeSubmitted?: string | null;
}

interface QuestionData {
  id: string;
  type: string;
  correctOptionIndex?: number | null;
  language?: string | null;
  testCases?: any; // JSON array of { input: string, expectedOutput: string, isHidden: boolean }
  marks: number;
}

interface AnswerResult {
  questionId: string;
  isCorrect: boolean;
}

interface EvaluationResult {
  scoredMarks: number;
  totalMarks: number;
  percentage: number;
  passFail: 'PASS' | 'FAIL';
  answerResults: AnswerResult[];
}

/**
 * Execute JS code against a test case input and compare output
 */
function evaluateJavaScript(code: string, input: string, expected: string): boolean {
  const tmpFile = path.join(os.tmpdir(), `eval_${Date.now()}_${Math.random().toString(36).substring(7)}.js`);
  try {
    // Append the input statement to the user's code
    // For safety, wrap in try/catch and log the output
    const wrapper = `
      ${code}
      try {
        const result = ${input};
        console.log(result !== undefined ? String(result).trim() : '');
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    `;
    fs.writeFileSync(tmpFile, wrapper);
    const output = execSync(`node ${tmpFile}`, { timeout: 3000, encoding: 'utf-8' });
    fs.unlinkSync(tmpFile);
    return output.trim() === expected.trim();
  } catch (err) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return false;
  }
}

/**
 * Execute Python code against a test case input and compare output
 */
function evaluatePython(code: string, input: string, expected: string): boolean {
  const tmpFile = path.join(os.tmpdir(), `eval_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);
  try {
    const wrapper = `
${code}
try:
    result = ${input}
    print(str(result).strip() if result is not None else "")
except Exception as e:
    import sys
    print(str(e), file=sys.stderr)
    sys.exit(1)
`;
    fs.writeFileSync(tmpFile, wrapper);
    const output = execSync(`python ${tmpFile}`, { timeout: 3000, encoding: 'utf-8' });
    fs.unlinkSync(tmpFile);
    return output.trim() === expected.trim();
  } catch (err) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return false;
  }
}

export async function evaluateExam(
  submittedAnswers: SubmittedAnswer[],
  questions: QuestionData[],
  passingMark: number = 50
): Promise<EvaluationResult> {
  let scoredMarks = 0;
  let totalMarks = 0;
  const answerResults: AnswerResult[] = [];

  for (const q of questions) {
    totalMarks += q.marks;
    const ans = submittedAnswers.find((a) => a.questionId === q.id);

    if (!ans) {
      answerResults.push({ questionId: q.id, isCorrect: false });
      continue;
    }

    if (q.type === 'MCQ') {
      const isCorrect = ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex !== null && ans.selectedOptionIndex === q.correctOptionIndex;
      if (isCorrect) {
        scoredMarks += q.marks;
      }
      answerResults.push({ questionId: q.id, isCorrect });
    } else if (q.type === 'CODING') {
      const code = ans.codeSubmitted || '';
      if (!code.trim()) {
        answerResults.push({ questionId: q.id, isCorrect: false });
        continue;
      }

      let testCasesArray: any[] = [];
      try {
        if (typeof q.testCases === 'string') {
          testCasesArray = JSON.parse(q.testCases);
        } else if (Array.isArray(q.testCases)) {
          testCasesArray = q.testCases;
        }
      } catch (e) {
        console.error('Failed to parse test cases for question:', q.id, e);
      }

      // If no test cases are specified, simple non-empty code is counted as passing (fallback)
      if (testCasesArray.length === 0) {
        scoredMarks += q.marks;
        answerResults.push({ questionId: q.id, isCorrect: true });
        continue;
      }

      // Evaluate against all test cases. If any fail, it's incorrect.
      let allPassed = true;
      const lang = (q.language || '').toLowerCase();

      for (const tc of testCasesArray) {
        const input = tc.input || '';
        const expected = String(tc.expectedOutput || '').trim();

        let passed = false;
        if (lang === 'javascript' || lang === 'js') {
          passed = evaluateJavaScript(code, input, expected);
        } else if (lang === 'python' || lang === 'py') {
          passed = evaluatePython(code, input, expected);
        } else {
          // Mock evaluation for non-JS/Python languages (like C++/Java)
          // We check if code output includes the expected output, or if they ran it on frontend
          passed = code.includes(expected);
        }

        if (!passed) {
          allPassed = false;
          break;
        }
      }

      if (allPassed) {
        scoredMarks += q.marks;
      }
      answerResults.push({ questionId: q.id, isCorrect: allPassed });
    } else {
      answerResults.push({ questionId: q.id, isCorrect: false });
    }
  }

  const percentage = totalMarks > 0 ? parseFloat(((scoredMarks / totalMarks) * 100).toFixed(2)) : 0;
  const passFail = percentage >= passingMark ? 'PASS' : 'FAIL';

  return {
    scoredMarks,
    totalMarks,
    percentage,
    passFail,
    answerResults,
  };
}
