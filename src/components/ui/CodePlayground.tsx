import { useState, useEffect, useRef, useCallback, Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import { useAuthStore } from '../../stores/authStore';

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

// Error Boundary for graceful error handling
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CodePlaygroundErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CodePlayground error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="border-3 border-border bg-gray-900 text-white p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold">Code Playground Error</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Something went wrong with the code playground. Please refresh the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm border border-gray-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Execution timeout in milliseconds (5 seconds)
const EXECUTION_TIMEOUT = 5000;

// Create the sandboxed iframe HTML content for JavaScript execution
const createSandboxedRunner = (code: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
<script>
(function() {
  'use strict';

  const output = [];
  const startTime = performance.now();
  let error = null;

  // Format values for display
  function formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'function') return '[Function: ' + (value.name || 'anonymous') + ']';
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (Array.isArray(value)) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Array]';
      }
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }

  // Override console methods
  const mockConsole = {
    log: function() {
      const args = Array.from(arguments);
      output.push(args.map(formatValue).join(' '));
    },
    error: function() {
      const args = Array.from(arguments);
      output.push('[ERROR] ' + args.map(formatValue).join(' '));
    },
    warn: function() {
      const args = Array.from(arguments);
      output.push('[WARN] ' + args.map(formatValue).join(' '));
    },
    info: function() {
      const args = Array.from(arguments);
      output.push('[INFO] ' + args.map(formatValue).join(' '));
    },
    debug: function() {
      const args = Array.from(arguments);
      output.push('[DEBUG] ' + args.map(formatValue).join(' '));
    },
    table: function(data) {
      output.push(formatValue(data));
    },
    clear: function() {
      // No-op in sandbox
    },
    assert: function(condition) {
      if (!condition) {
        const args = Array.from(arguments).slice(1);
        output.push('[ASSERT FAILED] ' + (args.length > 0 ? args.map(formatValue).join(' ') : 'Assertion failed'));
      }
    },
    count: function() {},
    countReset: function() {},
    group: function() {},
    groupEnd: function() {},
    groupCollapsed: function() {},
    time: function() {},
    timeEnd: function() {},
    timeLog: function() {},
    trace: function() {
      output.push('[TRACE] Stack trace requested');
    }
  };

  // Replace global console
  window.console = mockConsole;

  // Block dangerous APIs
  window.fetch = undefined;
  window.XMLHttpRequest = undefined;
  window.WebSocket = undefined;
  window.Worker = undefined;
  window.SharedWorker = undefined;
  window.ServiceWorker = undefined;
  window.localStorage = undefined;
  window.sessionStorage = undefined;
  window.indexedDB = undefined;
  window.openDatabase = undefined;
  window.alert = function(msg) { output.push('[ALERT] ' + formatValue(msg)); };
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };
  window.open = undefined;
  window.close = undefined;
  window.print = undefined;
  window.eval = undefined;

  try {
    // Execute user code
    const userCode = ${JSON.stringify(code)};
    const result = (function() {
      'use strict';
      return eval(userCode);
    })();

    // If code returns a value, add to output
    if (result !== undefined) {
      output.push('=> ' + formatValue(result));
    }
  } catch (e) {
    error = e.name + ': ' + e.message;
  }

  const executionTime = performance.now() - startTime;

  // Send results back to parent
  parent.postMessage({
    type: 'execution-result',
    output: output,
    error: error,
    executionTime: executionTime
  }, '*');
})();
</script>
</body>
</html>
`;
};

function CodePlaygroundInner({
  initialCode = '// Write your JavaScript code here\nconsole.log("Hello, World!");',
  language = 'javascript',
  className = '',
  onSaveSnippet,
}: CodePlaygroundProps) {
  const { user } = useAuthStore();
  const isPro = user?.tier === 'PRO';

  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<'code' | 'output'>('code');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Track if code has been modified from original
  const hasChanges = code !== initialCode;

  // Handle messages from the sandboxed iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === 'execution-result') {
      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setResult({
        output: event.data.output || [],
        error: event.data.error || null,
        executionTime: event.data.executionTime || 0,
      });
      setIsRunning(false);

      // Clean up iframe
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }
    }
  }, []);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleMessage]);

  // Show upgrade prompt for free users
  if (!isPro) {
    return (
      <div className={`border-3 border-border bg-gray-900 text-white ${className}`}>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b-2 border-border">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-400 font-mono uppercase ml-2">{language}</span>
          </div>
          <span className="text-xs text-yellow-400 font-medium">PRO FEATURE</span>
        </div>

        {/* Blurred code preview */}
        <div className="relative">
          <div className="p-4 font-mono text-sm text-gray-500 blur-sm select-none">
            <pre>{initialCode.split('\n').slice(0, 5).join('\n')}...</pre>
          </div>

          {/* Upgrade overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interactive Code Editor</h3>
              <p className="text-gray-400 text-sm mb-4 max-w-xs">
                Run and experiment with code examples in real-time. Upgrade to Pro to unlock the interactive code playground.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-2 border-black transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const executeJavaScriptInSandbox = (codeToRun: string) => {
    setIsRunning(true);
    setResult(null);

    // Clean up any existing iframe
    if (iframeRef.current) {
      iframeRef.current.remove();
    }

    // Create a new sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    // Strict sandbox: only allow scripts, no forms, no popups, no top navigation
    iframe.sandbox.add('allow-scripts');
    iframe.setAttribute('referrerpolicy', 'no-referrer');

    // Set up the iframe content
    const sandboxHtml = createSandboxedRunner(codeToRun);
    iframe.srcdoc = sandboxHtml;

    // Add iframe to DOM
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    // Set execution timeout (5 seconds)
    timeoutRef.current = window.setTimeout(() => {
      setResult({
        output: [],
        error: 'Execution timed out after 5 seconds. Your code may have an infinite loop.',
        executionTime: EXECUTION_TIMEOUT,
      });
      setIsRunning(false);

      // Clean up iframe
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }
    }, EXECUTION_TIMEOUT);
  };

  const handleRun = (codeToRun: string) => {
    const supportedLanguages = ['javascript', 'typescript'];
    if (!supportedLanguages.includes(language)) {
      setResult({
        output: [],
        error: `Running ${language} code is not supported. Only JavaScript is supported in the code playground.`,
        executionTime: 0,
      });
      return;
    }

    executeJavaScriptInSandbox(codeToRun);
  };

  const clearOutput = () => {
    setResult(null);
    setHtmlPreview('');
  };

  const handleSaveSnippet = () => {
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
  const handleRunWithTabSwitch = (codeToRun: string) => {
    setMobileTab('output');
    handleRun(codeToRun);
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {/* Mobile Tab Switcher - only show on small screens for JS */}
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

      {/* Output Panel for JS */}
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

// Export wrapped with error boundary
export default function CodePlayground(props: CodePlaygroundProps) {
  return (
    <CodePlaygroundErrorBoundary>
      <CodePlaygroundInner {...props} />
    </CodePlaygroundErrorBoundary>
  );
}
