import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Terminal, 
  Play, 
  X, 
  Repeat, 
  Compass, 
  Search, 
  Check, 
  Copy, 
  Activity,
  Code2
} from 'lucide-react';
import { WEBMCP_TOOLS, subscribeToWebMCPLogs, executeWebMCPTool } from '../lib/webmcp';

export default function WebMCPAgentDock() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToWebMCPLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  const handleRunScenario = async (scenarioKey) => {
    setIsExecuting(true);
    setActiveScenario(scenarioKey);

    try {
      if (scenarioKey === 'recurring') {
        await executeWebMCPTool('create_recurring_series', {
          title: 'Sunset 5K Trail Run & Social',
          day_offset_start: 1,
          hour: 18,
          minute: 30,
          weeks_count: 4,
          location: 'Olympic Sculpture Park, 2901 Western Ave, Seattle, WA',
          description: 'Weekly 5K sunset run around the waterfront followed by casual refreshments.'
        });
      } else if (scenarioKey === 'weekend') {
        await executeWebMCPTool('plan_weekend_itinerary', {
          target_weekend_day_offset: 2,
          vibes: ['fitness', 'social', 'food'],
          auto_rsvp: true
        });
      } else if (scenarioKey === 'search_mcp') {
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

  const copyLogContent = (id, obj) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-cyan-600 via-cyan-500 to-orange-500 hover:from-cyan-500 hover:to-orange-400 text-white font-extrabold px-4 py-3 rounded-2xl shadow-xl shadow-cyan-600/25 border border-white/40 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white stroke-[2.5]" />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          )}
        </div>
        <span className="text-xs uppercase tracking-wider font-extrabold">WebMCP Dock</span>
        <span className="text-[10px] bg-black/20 text-white px-2 py-0.5 rounded-full font-mono">
          {WEBMCP_TOOLS.length} Tools
        </span>
      </button>

      {/* Slide-Up Inspector Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-fade-in">
          
          {/* Header */}
          <div className="p-4 px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>WebMCP Protocol Inspector</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full border border-emerald-200 font-mono font-semibold">
                    Ready
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  navigator.modelContext • JSON-RPC
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-200/70 transition-colors"
                title="Clear Logs"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1-Click Judge Demo Scenarios */}
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>1-Click Agent Scenarios</span>
              </span>
              {isExecuting && (
                <span className="text-[10px] text-orange-600 animate-pulse font-mono flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" />
                  <span>Agent Executing...</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Scenario 1: Recurring Series */}
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => handleRunScenario('recurring')}
                className="text-left p-3 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:bg-slate-50 transition-all text-xs group disabled:opacity-50 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-cyan-700 flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-cyan-600" />
                    <span>Schedule Weekly 5K Run (4-Week Series)</span>
                  </span>
                  <span className="text-[11px] text-cyan-600 font-mono font-semibold flex items-center gap-0.5">
                    <Play className="w-3 h-3 fill-cyan-600" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Synthesizes 4-week atomic event series without bloated native recurring UI code.
                </p>
              </button>

              {/* Scenario 2: Weekend Itinerary */}
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => handleRunScenario('weekend')}
                className="text-left p-3 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:bg-slate-50 transition-all text-xs group disabled:opacity-50 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-orange-700 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-orange-500" />
                    <span>Plan Saturday Itinerary & Auto-RSVP</span>
                  </span>
                  <span className="text-[11px] text-orange-600 font-mono font-semibold flex items-center gap-0.5">
                    <Play className="w-3 h-3 fill-orange-500" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Queries 50-mi radius, optimizes morning/evening slots, and executes autonomous RSVPs.
                </p>
              </button>
            </div>
          </div>

          {/* Real-time Tool Call Stream & JSON Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[320px] bg-[#0f172a] font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 font-sans font-medium">
              <span>PROTOCOL EXECUTION STREAM</span>
              <span>{logs.length} Tool Events</span>
            </div>

            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-2xl border text-[11px] leading-relaxed transition-all ${
                    log.type === 'CALL'
                      ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                      : log.type === 'RESULT'
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-red-950/40 border-red-800/60 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        log.type === 'CALL' ? 'bg-blue-400' : log.type === 'RESULT' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      <span className="font-semibold">{log.type}: <strong className="text-white font-mono">{log.toolName}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-normal">
                        {log.durationMs ? `${log.durationMs}ms • ` : ''}{log.timestamp}
                      </span>
                      <button
                        onClick={() => copyLogContent(log.id, log.args || log.result || log.error)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Copy JSON payload"
                      >
                        {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Arguments or Result JSON */}
                  <pre className="mt-1 bg-black/60 p-2.5 rounded-xl text-[10px] overflow-x-auto text-slate-300 max-h-28 border border-slate-800 font-mono">
                    {JSON.stringify(log.args || log.result || log.error, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 space-y-1 font-sans">
                <Code2 className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
                <div className="text-xs text-slate-300 font-semibold">WebMCP Agent Ready</div>
                <div className="text-[11px] text-slate-500">
                  Run a scenario above or let external AI agents invoke web tools.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 px-5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
              <span>Standard: JSON-RPC over WebMCP</span>
            </span>
            <span className="text-cyan-700 font-semibold">Devpost WebMCP Challenge</span>
          </div>

        </div>
      )}
    </>
  );
}

