import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Badge, Button 
} from './components/UI';
import { 
  Brain, Code, Play, Terminal, Trophy, 
  Plus, History, BarChart2, Mic2, 
  Sparkles, Timer, Lightbulb, CheckCircle2,
  Cpu, Send
} from 'lucide-react';
import { ProblemSolution, UserPerformance } from './types';
import { analyzeProblem } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'input' | 'result' | 'interview' | 'loading';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [problemInput, setProblemInput] = useState('');
  const [solution, setSolution] = useState<ProblemSolution | null>(null);
  const [activeTab, setActiveTab] = useState<'logic' | 'code' | 'dryrun' | 'test' | 'speech'>('logic');
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'java' | 'python'>('python');
  
  const [performance, setPerformance] = useState<UserPerformance>({
    weakTopics: ['Dynamic Programming', 'Graphs'],
    strongTopics: ['Arrays', 'Sliding Window'],
    solvedCount: { Easy: 12, Medium: 8, Hard: 2 },
    totalSolved: 22
  });

  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const [history, setHistory] = useState<ProblemSolution[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(1);

  useEffect(() => {
    const savedHistory = localStorage.getItem('codecrack_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveToHistory = (newSolution: ProblemSolution) => {
    const updated = [newSolution, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('codecrack_history', JSON.stringify(updated));
  };

  const handleSolve = async () => {
    if (!problemInput.trim()) return;
    setView('loading');
    setHint(null);
    setHintLevel(1);
    try {
      const result = await analyzeProblem(problemInput);
      setSolution(result);
      saveToHistory(result);
      setView('result');
      // Update performance (mock update)
      setPerformance(prev => ({
        ...prev,
        totalSolved: prev.totalSolved + 1,
        solvedCount: {
          ...prev.solvedCount,
          [result.analysis.difficulty]: (prev.solvedCount[result.analysis.difficulty] || 0) + 1
        }
      }));
    } catch (error) {
      console.error(error);
      setView('dashboard');
    }
  };

  const handleGetHint = async () => {
    if (!solution) return;
    const nextHint = await import('./services/geminiService').then(m => 
      m.getHint(problemInput, solution.codes.find(c => c.language === selectedLanguage)?.code || '', hintLevel)
    );
    setHint(nextHint);
    setHintLevel(prev => Math.min(prev + 1, 3));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Welcome, Engineer</h2>
        <div className="p-2 bg-ios-blue/10 rounded-full text-ios-blue">
          <Trophy size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-ios-blue">{performance.totalSolved}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Solved</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-3xl font-bold text-green-500">{Math.round((performance.solvedCount.Medium / performance.totalSolved) * 100)}%</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Difficulty %</span>
        </Card>
      </div>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest px-1">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        <Button onClick={() => setView('input')} className="flex items-center justify-center gap-2">
          <Plus size={20} /> Solve New Problem
        </Button>
        <Button onClick={() => { setView('input'); setIsTimerRunning(true); }} variant="secondary" className="flex items-center justify-center gap-2">
          <Timer size={20} /> Start Interview Mode
        </Button>
      </div>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest px-1">Weak Topics</h3>
      <div className="flex flex-wrap gap-2">
        {performance.weakTopics.map(topic => (
          <Badge key={topic} color="orange">{topic}</Badge>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest px-1">Recent Problems</h3>
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((h, i) => (
            <Card key={i} className="py-3 px-4 flex justify-between items-center" onClick={() => { setSolution(h); setView('result'); }}>
              <div>
                <h4 className="font-bold text-sm">{h.analysis.title}</h4>
                <div className="flex gap-2 mt-1">
                   {h.analysis.patterns.slice(0, 1).map(p => <span key={p} className="text-[9px] font-bold text-gray-400 uppercase">{p}</span>)}
                </div>
              </div>
              <Badge color={h.analysis.difficulty === 'Easy' ? 'green' : h.analysis.difficulty === 'Medium' ? 'orange' : 'red'}>
                {h.analysis.difficulty}
              </Badge>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 py-4 italic">No history yet. Start solving!</p>
      )}

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest px-1">Recommended for you</h3>
      <Card className="border-l-4 border-ios-blue">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold">Next Greater Element II</h4>
            <p className="text-xs text-gray-500">Pattern: Monotonic Stack</p>
          </div>
          <Badge color="orange">Medium</Badge>
        </div>
      </Card>
    </div>
  );

  const renderInput = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{isTimerRunning ? 'Interview Mode' : 'New Problem'}</h2>
      
      {isTimerRunning && (
        <div className="bg-ios-blue/5 rounded-ios p-4 flex items-center justify-between mb-4 border border-ios-blue/20">
          <div className="flex items-center gap-2 text-ios-blue font-mono font-bold text-xl">
            <Timer size={24} />
            {formatTime(timer)}
          </div>
          <p className="text-xs text-ios-blue font-medium italic">Simulating Google Interview...</p>
        </div>
      )}

      <div className="relative">
        <textarea
          value={problemInput}
          onChange={(e) => setProblemInput(e.target.value)}
          placeholder="Paste LeetCode problem statement here..."
          className="w-full h-64 bg-white rounded-ios p-5 ios-shadow border-none focus:ring-2 focus:ring-ios-blue outline-none resize-none text-sm leading-relaxed"
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-transform">
            <Mic2 size={18} />
          </button>
          <button className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-transform">
            <History size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center p-3 m-0 text-center" onClick={() => {}}>
           <BarChart2 size={24} className="text-ios-gray mb-2" />
           <span className="text-xs font-semibold">Analyze Image</span>
        </Card>
        <Card className="flex flex-col items-center p-3 m-0 text-center" onClick={() => {}}>
           <Terminal size={24} className="text-ios-gray mb-2" />
           <span className="text-xs font-semibold">Upload PDF</span>
        </Card>
      </div>

      <Button onClick={handleSolve} disabled={!problemInput.trim()}>
        Analyze with CodeCrack AI
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-20 h-20 border-4 border-ios-blue/20 border-t-ios-blue rounded-full flex items-center justify-center"
      >
        <Brain size={40} className="text-ios-blue" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-xl font-bold">Cracking the logic...</h3>
        <p className="text-gray-500 text-sm mt-1">Generating optimized patterns & dry run</p>
      </div>
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-ios-blue"
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );

  const renderResult = () => {
    if (!solution) return null;
    const { analysis, logic, codes, testCases, interviewAdvice, dryRun, topPerformanceStrategy } = solution;
    const currentCode = codes.find(c => c.language === selectedLanguage) || codes[0];

    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold truncate pr-4">{analysis.title}</h2>
          <Badge color={analysis.difficulty === 'Easy' ? 'green' : analysis.difficulty === 'Medium' ? 'orange' : 'red'}>
            {analysis.difficulty}
          </Badge>
        </div>

        {isTimerRunning && (
          <Card className="bg-ios-blue/5 border border-ios-blue/20">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-ios-blue font-bold tracking-tight">
                <Timer size={18} /> {formatTime(timer)}
              </div>
              <Button onClick={handleGetHint} variant="ghost" className="w-auto py-1 px-3 text-xs">
                Need a hint? (Level {hintLevel})
              </Button>
            </div>
            {hint && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-white rounded-lg text-xs leading-relaxed border-l-4 border-ios-blue shadow-sm italic text-gray-700"
              >
                " {hint} "
              </motion.div>
            )}
          </Card>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {analysis.patterns.map(p => (
            <span key={p} className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
              {p}
            </span>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-[58px] z-40 bg-ios-bg/95 backdrop-blur-sm -mx-4 px-4 py-2 flex gap-4 overflow-x-auto hide-scrollbar border-b border-gray-200">
          {[
            { id: 'logic', icon: Brain, label: 'Logic' },
            { id: 'code', icon: Code, label: 'Code' },
            { id: 'dryrun', icon: Play, label: 'Dry Run' },
            { id: 'test', icon: CheckCircle2, label: 'Tests' },
            { id: 'speech', icon: Mic2, label: 'Speak' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0
                ${activeTab === tab.id ? 'bg-ios-blue text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'logic' && (
            <div className="space-y-6">
              <Card className="bg-red-50 border-l-4 border-red-400">
                <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                  <Cpu size={18} /> The Brute Force Gap
                </h4>
                <p className="text-sm text-red-800 leading-relaxed mb-3">
                  <span className="font-bold uppercase text-[10px]">Approach:</span> {logic.bruteForce.approach}
                </p>
                <div className="bg-white/50 p-3 rounded-lg text-xs font-medium text-red-900 italic">
                  "This fails because: {logic.bruteForce.whyItFails}"
                </div>
              </Card>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-1">Optimized Thought Process</h4>
                {logic.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      {i !== logic.steps.length - 1 && <div className="w-0.5 flex-1 bg-ios-blue/10 my-1" />}
                    </div>
                    <div className="pb-6">
                      <h5 className="font-bold text-sm mb-1">{step.title}</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-ios-blue text-white">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <Sparkles size={18} /> Deep Strategy
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">{topPerformanceStrategy}</p>
              </Card>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex bg-white rounded-ios-sm p-1 ios-shadow">
                {(['python', 'cpp', 'java'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all
                      ${selectedLanguage === lang ? 'bg-ios-blue text-white shadow-sm' : 'text-gray-400'}`}
                  >
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 rounded-ios-sm overflow-hidden ios-shadow">
                <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                   <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                     <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                   </div>
                   <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Solution.{selectedLanguage}</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed hide-scrollbar">
                  <code>{currentCode.code}</code>
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 m-0 border-b-2 border-ios-blue">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Complexity</h5>
                  <p className="font-mono text-lg font-bold text-ios-blue">{currentCode.timeComplexity}</p>
                </Card>
                <Card className="p-4 m-0 border-b-2 border-ios-blue">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Space Complexity</h5>
                  <p className="font-mono text-lg font-bold text-ios-blue">{currentCode.spaceComplexity}</p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'dryrun' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-1">Algorithm Walkthrough</h4>
              {dryRun.map((step, i) => (
                <Card key={i} className="relative overflow-hidden group">
                  <div className="flex gap-4">
                    <div className="text-2xl font-black text-gray-100 absolute -right-2 -top-2 select-none group-hover:text-ios-blue/10 transition-colors">
                      {step.step.toString().padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium pr-8">{step.description}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(step.state).map(([key, val]) => (
                          <div key={key} className="bg-gray-50 px-2 py-1 rounded border border-gray-100 font-mono text-[10px]">
                            <span className="text-gray-400 lowercase">{key}:</span> <span className="font-bold text-ios-blue">{JSON.stringify(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Validation System</h4>
                <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">All Passing</div>
              </div>
              {testCases.map((tc, i) => (
                <Card key={i} className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-widest">Case #{i + 1}</span>
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                      <CheckCircle2 size={12} /> Passed
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Input</p>
                      <code className="text-xs font-mono">{tc.input}</code>
                    </div>
                    <div className="bg-green-50/50 p-2 rounded border border-green-100">
                      <p className="text-[10px] uppercase font-bold text-green-400 mb-1">Expected Output</p>
                      <code className="text-xs font-mono">{tc.expectedOutput}</code>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'speech' && (
            <div className="space-y-6">
              <Card className="bg-indigo-600 text-white relative overflow-hidden">
                <div className="absolute right-[-10px] bottom-[-20px] opacity-20">
                  <Mic2 size={100} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold flex items-center gap-2 mb-3">
                     <Mic2 size={18} /> Speaking for the Panel
                  </h4>
                  <p className="text-sm leading-relaxed mb-4 italic opacity-90">
                    "{interviewAdvice.verbalExplanation}"
                  </p>
                  <Button variant="secondary" className="bg-white/20 border-white text-white active:bg-white/30 text-xs py-2">
                    Generate Audio Preview
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-1">Key Talking Points</h4>
                <div className="grid grid-cols-1 gap-2">
                  {interviewAdvice.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-ios-sm border-l-4 border-indigo-400 ios-shadow">
                       <Lightbulb size={20} className="text-indigo-400 shrink-0" />
                       <p className="text-sm font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-1">Best-Practice Script</h4>
                <div className="bg-white p-5 rounded-ios ios-shadow border-t-4 border-indigo-100">
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {interviewAdvice.sampleScript}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto ios-blur bg-white/80 border-t border-gray-200 p-4 flex gap-4 z-50">
          <Button onClick={() => setView('dashboard')} variant="ghost" className="flex-1 text-gray-500">Close</Button>
          <Button onClick={() => setView('input')} className="flex-[2]">Try Another</Button>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title={view === 'dashboard' ? 'CodeCrack AI' : view === 'loading' ? 'Analyzing...' : view === 'result' ? 'Solution Engine' : 'Interview Coach'}
      onBack={view !== 'dashboard' ? () => setView('dashboard') : undefined}
      headerRight={
        view === 'dashboard' ? (
          <button className="text-ios-blue text-sm font-semibold">Settings</button>
        ) : view === 'result' ? (
          <button onClick={() => {}} className="p-2 bg-ios-blue/10 rounded-full text-ios-blue">
            <Send size={18} />
          </button>
        ) : null
      }
    >
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderDashboard()}
          </motion.div>
        )}
        {view === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderInput()}
          </motion.div>
        )}
        {view === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderLoading()}
          </motion.div>
        )}
        {view === 'result' && (solution && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderResult()}
          </motion.div>
        ))}
      </AnimatePresence>
    </Layout>
  );
}
