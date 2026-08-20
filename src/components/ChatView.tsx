import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Lightbulb,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, MultiAgentTraceStep } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  loading: boolean;
  activePlan: string[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  loading,
  activePlan
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedTrace, setExpandedTrace] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const toggleTrace = (msgId: string) => {
    setExpandedTrace((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const samplePrompts = [
    'Which region has the highest revenue?',
    'Show total sales by product category.',
    'Find anomalies in profit margins.',
    'Forecast revenue for the next 4 months.',
    'Profile the overall health of the dataset.',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Active Agent Workflow Indicator */}
      {loading && activePlan.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              DAG
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">Multi-Agent Workflow In Progress</p>
              <div className="flex items-center gap-2 mt-1">
                {activePlan.map((agent, i) => (
                  <React.Fragment key={i}>
                    <span className="text-[11px] font-semibold bg-white border border-blue-300 text-blue-800 px-2 py-0.5 rounded-md">
                      {agent}
                    </span>
                    {i < activePlan.length - 1 && <ArrowRight className="w-3 h-3 text-blue-400" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4 animate-spin" /> Orchestrating...
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-[500px] max-h-[680px]">
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Multi-Agent AI Data Chat Session</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Powered by LangGraph &bull; Gemini 1.5/2.0
          </span>
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isTraceOpen = expandedTrace[msg.id] ?? false;

            return (
              <div key={msg.id} className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-3 max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  </div>

                  {/* Multi-Agent Execution Trace Box */}
                  {!isUser && msg.steps && msg.steps.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs shadow-xs">
                      <button
                        onClick={() => toggleTrace(msg.id)}
                        className="w-full px-4 py-2.5 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between text-slate-700 font-semibold transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>Multi-Agent Execution Trace ({msg.steps.length} steps)</span>
                        </div>
                        {isTraceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isTraceOpen && (
                        <div className="p-3.5 space-y-2 bg-slate-50/50 border-t border-slate-200">
                          {msg.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200/80">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                                {idx + 1}
                              </span>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900">{step.agent}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                                    {step.status}
                                  </span>
                                </div>
                                <p className="text-slate-600">{step.action}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visual Chart Result if present */}
                  {!isUser && msg.chart && msg.chart.data && msg.chart.data.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{msg.chart.title}</span>
                        <BarChart2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-1.5">{msg.chart.xAxis || 'Category'}</th>
                              <th className="px-3 py-1.5 text-right">{msg.chart.yAxis || 'Metric'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {msg.chart.data.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-3 py-1.5 font-medium text-slate-800">
                                  {row[msg.chart!.xAxis || Object.keys(row)[0]]}
                                </td>
                                <td className="px-3 py-1.5 text-right font-mono font-bold text-blue-600">
                                  {typeof row[msg.chart!.yAxis || Object.keys(row)[1]] === 'number'
                                    ? row[msg.chart!.yAxis || Object.keys(row)[1]].toLocaleString()
                                    : row[msg.chart!.yAxis || Object.keys(row)[1]]}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Strategic Insights & Recommendations */}
                  {!isUser && msg.insights && msg.insights.length > 0 && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Key Strategic Insights
                      </div>
                      <ul className="space-y-1 pl-4 list-disc text-slate-700 text-[11px]">
                        {msg.insights.map((ins, i) => (
                          <li key={i}>{ins}</li>
                        ))}
                      </ul>
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strategic Recommendations
                          </div>
                          <ul className="space-y-1 pl-4 list-disc text-slate-700 text-[11px]">
                            {msg.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(p)}
              disabled={loading}
              className="text-[11px] bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 px-3 py-1 rounded-full whitespace-nowrap text-slate-700 font-medium transition-all shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything about your data (e.g. 'Top 5 products by revenue', 'Anomalies in profit')..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
