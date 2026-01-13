import { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
  className?: string;
  onSaveSnippet?: (code: string, language: string) => void;
}

interface ExecutionResult {
  output: string[];
  error: string | null;
  executionTime: number;
}

// Pyodide types
interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (name: string | string[]) => Promise<void>;
}

// Global Pyodide instance
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading = false;
let pyodideLoadPromise: Promise<PyodideInterface> | null = null;

// Load Pyodide on demand
const loadPyodide = async (): Promise<PyodideInterface> => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  pyodideLoading = true;

  pyodideLoadPromise = new Promise(async (resolve, reject) => {
    try {
      // Load Pyodide script
      if (!document.querySelector('script[src*="pyodide"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise<void>((res, rej) => {
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load Pyodide'));
        });
      }

      // Initialize Pyodide
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });

      pyodideInstance = pyodide;
      pyodideLoading = false;
      resolve(pyodide);
    } catch (error) {
      pyodideLoading = false;
      pyodideLoadPromise = null;
      reject(error);
    }
  });

  return pyodideLoadPromise;
};

// Execute Python code using Pyodide
const executePython = async (code: string): Promise<ExecutionResult> => {
  const output: string[] = [];
  const startTime = performance.now();
  let error: string | null = null;

  try {
    const pyodide = await loadPyodide();

    // Redirect stdout to capture print statements
    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);

    // Run the user's code
    let result: unknown;
    try {
      result = pyodide.runPython(code);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    // Capture output
    const stdout = pyodide.runPython('sys.stdout.getvalue()') as string;
    const stderr = pyodide.runPython('sys.stderr.getvalue()') as string;

    // Reset stdout/stderr
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

    if (stdout.trim()) {
      output.push(...stdout.trim().split('\n'));
    }

    if (stderr.trim()) {
      output.push(`[STDERR] ${stderr.trim()}`);
    }

    if (!error && result !== undefined && result !== null) {
      const resultStr = String(result);
      if (resultStr !== 'None') {
        output.push(`=> ${resultStr}`);
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const executionTime = performance.now() - startTime;
  return { output, error, executionTime };
};

// Safely execute JavaScript code and capture output
const executeJavaScript = (code: string): ExecutionResult => {
  const output: string[] = [];
  const startTime = performance.now();
  let error: string | null = null;

  // Create a mock console
  const mockConsole = {
    log: (...args: unknown[]) => {
      output.push(args.map(arg => formatValue(arg)).join(' '));
    },
    error: (...args: unknown[]) => {
      output.push(`[ERROR] ${args.map(arg => formatValue(arg)).join(' ')}`);
    },
    warn: (...args: unknown[]) => {
      output.push(`[WARN] ${args.map(arg => formatValue(arg)).join(' ')}`);
    },
    info: (...args: unknown[]) => {
      output.push(`[INFO] ${args.map(arg => formatValue(arg)).join(' ')}`);
    },
  };

  try {
    // Create a safe execution context
    const safeCode = `
      'use strict';
      const console = mockConsole;
      ${code}
    `;

    // Execute with limited capabilities
    // eslint-disable-next-line no-new-func
    const fn = new Function('mockConsole', safeCode);
    const result = fn(mockConsole);

    // If the code returns a value, add it to output
    if (result !== undefined) {
      output.push(`=> ${formatValue(result)}`);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const executionTime = performance.now() - startTime;

  return { output, error, executionTime };
};

// Format values for display
const formatValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
};

export default function CodePlayground({
  initialCode = '// Write your JavaScript code here\nconsole.log("Hello, World!");',
  language = 'javascript',
  className = '',
  onSaveSnippet,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<'code' | 'output'>('code');

  // Track if code has been modified from original
  const hasChanges = code !== initialCode;

  const handleRun = async (codeToRun: string) => {
    const supportedLanguages = ['javascript', 'typescript', 'python'];
    if (!supportedLanguages.includes(language)) {
      setResult({
        output: [],
        error: `Running ${language} code is not supported yet. Supported languages: JavaScript, Python.`,
        executionTime: 0,
      });
      return;
    }

    setIsRunning(true);

    if (language === 'python') {
      // Check if Pyodide needs to be loaded
      if (!pyodideInstance && !pyodideLoading) {
        setResult({
          output: ['Loading Python runtime (first time may take a few seconds)...'],
          error: null,
          executionTime: 0,
        });
      }

      try {
        const executionResult = await executePython(codeToRun);
        setResult(executionResult);
      } catch (err) {
        setResult({
          output: [],
          error: err instanceof Error ? err.message : String(err),
          executionTime: 0,
        });
      } finally {
        setIsRunning(false);
      }
    } else {
      // JavaScript/TypeScript
      setTimeout(() => {
        const executionResult = executeJavaScript(codeToRun);
        setResult(executionResult);
        setIsRunning(false);
      }, 10);
    }
  };

  const clearOutput = () => {
    setResult(null);
    setHtmlPreview('');
  };

  const handleSaveSnippet = () => {
    console.log('Save snippet clicked', { onSaveSnippet: !!onSaveSnippet, code: code.trim().length > 0 });
    if (onSaveSnippet && code.trim()) {
      onSaveSnippet(code, language);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleResetCode = () => {
    setCode(initialCode);
    setResult(null);
    setShowResetSuccess(true);
    setTimeout(() => setShowResetSuccess(false), 2000);
  };

  // For HTML/CSS - show live preview
  const [htmlPreview, setHtmlPreview] = useState('');

  // Live preview for HTML/CSS
  useEffect(() => {
    if (language === 'html' || language === 'css') {
      setHtmlPreview(code);
    }
  }, [code, language]);

  const isHtmlMode = language === 'html' || language === 'css';

  // Auto-switch to output tab when code runs
  const handleRunWithTabSwitch = async (codeToRun: string) => {
    setMobileTab('output');
    await handleRun(codeToRun);
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {/* Mobile Tab Switcher - only show on small screens for JS/Python */}
      {!isHtmlMode && (
        <div className="flex sm:hidden border-3 border-b-0 border-border bg-gray-800">
          <button
            onClick={() => setMobileTab('code')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              mobileTab === 'code'
                ? 'bg-gray-900 text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setMobileTab('output')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              mobileTab === 'output'
                ? 'bg-gray-900 text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Output
            {result && !result.error && result.output.length > 0 && (
              <span className="ml-1 text-xs text-green-400">●</span>
            )}
            {result?.error && (
              <span className="ml-1 text-xs text-red-400">●</span>
            )}
          </button>
        </div>
      )}

      {/* Code Editor - hide on mobile when output tab is selected */}
      <div className={`${!isHtmlMode && mobileTab === 'output' ? 'hidden sm:block' : ''}`}>
        <CodeEditor
          initialCode={code}
          language={language}
          onChange={setCode}
          onRun={isHtmlMode ? undefined : handleRunWithTabSwitch}
          readOnly={false}
        />
      </div>

      {/* HTML Preview Panel */}
      {isHtmlMode && (
        <div className="border-3 border-t-0 border-border bg-white">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b-2 border-gray-300">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs text-gray-600 font-mono">LIVE PREVIEW</span>
            </div>
            <span className="text-xs text-gray-500">Changes update automatically</span>
          </div>
          <div className="p-4 min-h-[150px] max-h-[300px] overflow-auto">
            <iframe
              srcDoc={language === 'html' ? htmlPreview : `<style>${htmlPreview}</style><p>CSS applied to this text</p>`}
              title="HTML Preview"
              className="w-full h-full min-h-[120px] border border-gray-200"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}

      {/* Output Panel for JS/Python */}
      {!isHtmlMode && (
        <div className={`border-3 border-t-0 border-border bg-gray-900 ${mobileTab === 'code' ? 'hidden sm:block' : ''}`}>
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400 font-mono">OUTPUT</span>
              {result && (
                <span className="text-xs text-gray-500">
                  ({result.executionTime.toFixed(2)}ms)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isRunning && (
                <span className="text-xs text-green-400 animate-pulse">Running...</span>
              )}
              {showSaveSuccess && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </span>
              )}
              {showResetSuccess && (
                <span className="text-xs text-cyan-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Reset!
                </span>
              )}
              {hasChanges && !showResetSuccess && (
                <button
                  onClick={handleResetCode}
                  className="text-xs text-cyan-400 hover:text-white flex items-center gap-1"
                  title="Reset to original code"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              )}
              {onSaveSnippet && !showSaveSuccess && (
                <button
                  onClick={handleSaveSnippet}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  title="Save Snippet"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Snippet
                </button>
              )}
              {result && (
                <button
                  onClick={clearOutput}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              )}
              {/* Mobile-only Run button in output panel */}
              <button
                onClick={() => handleRunWithTabSwitch(code)}
                disabled={isRunning}
                className="sm:hidden px-2 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white border border-black transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </button>
            </div>
          </div>

          <div className="p-3 font-mono text-sm min-h-[100px] max-h-[200px] overflow-auto">
            {!result && !isRunning && (
              <span className="text-gray-500">Click "Run" or press Ctrl+Enter to execute code</span>
            )}

          {result && result.error && (
            <div className="text-red-400">
              <span className="font-semibold">Error: </span>
              {result.error}
            </div>
          )}

          {result && result.output.length > 0 && (
            <div className="space-y-1">
              {result.output.map((line, index) => (
                <div key={index} className="text-green-400 whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          )}

          {result && !result.error && result.output.length === 0 && (
            <span className="text-gray-500">No output</span>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
