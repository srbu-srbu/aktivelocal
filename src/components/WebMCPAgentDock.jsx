import React, { useState, useEffect } from 'react';
import { WEBMCP_TOOLS, subscribeToWebMCPLogs, executeWebMCPTool } from '../lib/webmcp';

export default function WebMCPAgentDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToWebMCPLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    });
    return unsubscribe;
  }, []);

  const handleRunScenario = async (scenarioKey) => {
    setIsExecuting(true);
    setActiveScenario(scenarioKey);

    try {
      if (scenarioKey === 'recurring') {
        // Scenario 1: Autonomous Recurring Series
        await executeWebMCPTool('create_recurring_series', {
          title: 'Sunset 5K Trail Run & Social',
          day_offset_start: 1, // starting tomorrow
          hour: 18,
          minute: 30,
          weeks_count: 4,
          location: 'Olympic Sculpture Park, 2901 Western Ave, Seattle, WA',
          description: 'Weekly 5K sunset run around the waterfront followed by casual refreshments.',
          category: 'Fitness & Outdoors'
        });
      } else if (scenarioKey === 'weekend') {
        // Scenario 2: Weekend Itinerary Planner
        await executeWebMCPTool('plan_weekend_itinerary', {
          target_weekend_day_offset: 2, // Saturday
          vibes: ['fitness', 'social', 'food'],
          auto_rsvp: true
        });
      } else if (scenarioKey === 'search_mcp') {
        // Scenario 3: Search Events
        await executeWebMCPTool('search_events', {
          query: 'social',
          date: new Date().toISOString(),
          radius_miles: 50
        });
      }
    } catch (err) {
      console.error('Scenario execution error:', err);
    } finally {
      setIsExecuting(false);
      setActiveScenario(null);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold px-4 py-3 rounded-2xl shadow-xl shadow-cyan-500/25 border border-cyan-300 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
      >
        <span className="text-lg">🤖</span>
        <span className="text-xs uppercase tracking-wider">WebMCP Agent Dock</span>
        {logs.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        )}
      </button>

      {/* Slide-Up / Expandable Inspector Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-full max-w-lg bg-[#0d1117] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-b border-cyan-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>WebMCP Protocol Inspector</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Registered standard: <code className="text-cyan-300 font-mono">navigator.modelContext</code> ({WEBMCP_TOOLS.length} tools)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800"
                title="Clear Logs"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 1-Click Judge Demo Scenarios */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                1-Click Judge Scenarios:
              </span>
              {isExecuting && (
                <span className="text-[10px] text-orange-400 animate-pulse font-mono">
                  Agent Executing Tools...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Scenario 1: Recurring Series */}
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => handleRunScenario('recurring')}
                className="text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 transition-all text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                    <span>🔁</span> Schedule Weekly 5K Run (4-Week Series)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">Run ➔</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Proves agent synthesis of recurring events without bloated native UI.
                </p>
              </button>

              {/* Scenario 2: Weekend Itinerary */}
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => handleRunScenario('weekend')}
                className="text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/60 hover:bg-slate-900/80 transition-all text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-orange-300 flex items-center gap-1.5">
                    <span>🗓️</span> Plan Saturday Itinerary & Auto-RSVP
                  </span>
                  <span className="text-[10px] text-orange-400 font-mono font-semibold">Run ➔</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Discovers day events, balances morning/evening times, and auto-RSVPs.
                </p>
              </button>
            </div>
          </div>

          {/* Real-time Tool Call Stream & JSON Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[340px] bg-[#090d16] font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-900 pb-1.5 font-sans">
              <span>PROTOCOL EXECUTION STREAM</span>
              <span>{logs.length} Events</span>
            </div>

            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all ${
                    log.type === 'CALL'
                      ? 'bg-blue-950/40 border-blue-800/50 text-blue-200'
                      : log.type === 'RESULT'
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                      : 'bg-red-950/40 border-red-800/50 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.type === 'CALL' ? 'bg-blue-400' : log.type === 'RESULT' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      <span>{log.type}: <strong className="text-white font-mono">{log.toolName}</strong></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {log.durationMs ? `${log.durationMs}ms • ` : ''}{log.timestamp}
                    </span>
                  </div>

                  {/* Arguments or Result JSON */}
                  <pre className="mt-1 bg-black/60 p-2 rounded-lg text-[10px] overflow-x-auto text-slate-300 max-h-28">
                    {JSON.stringify(log.args || log.result || log.error, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-600 space-y-1 font-sans">
                <div>⚡ Ready for WebMCP Agent Invocations</div>
                <div className="text-[11px] text-slate-700">
                  Click any scenario above or let ChatGPT Desktop invoke tools.
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-400 flex items-center justify-between font-sans">
            <span>Standard: JSON-RPC over WebMCP</span>
            <span className="text-cyan-400 font-semibold">Devpost WebMCP Challenge</span>
          </div>

        </div>
      )}
    </>
  );
}
