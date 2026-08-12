// src/components/layout/CopilotPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGlobalStore } from '../../state/useGlobalStore';
import { CopilotMessage } from '../../types/models';

export const CopilotPanel: React.FC = () => {
  const { 
    copilotOpen, 
    setCopilotOpen, 
    copilotMessages, 
    addCopilotMessage,
    clearCopilotMessages
  } = useGlobalStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    "Why are PCS procedures missing?",
    "Which vehicle has the highest cascade impact?",
    "Which errors should be fixed first?"
  ];

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [copilotMessages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    addCopilotMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Simulate smart AI response based on query keywords
    setTimeout(() => {
      let aiText = "I have analyzed the database schemas and reconciliation tables. ";
      let structuredResponse: CopilotMessage['structuredResponse'] = undefined;

      const lowerText = text.toLowerCase();
      if (lowerText.includes('pcs') || lowerText.includes('procedure')) {
        structuredResponse = {
          rootCause: "Vehicle record 2967 failed regional constraint checks and was excluded during staging DB translation.",
          evidence: "PCS Procedures count shows a difference of 150,610 rows in production compared to staging. The matching ID lookup error ERR-2967 is assigned to Alex Rivera.",
          impact: "150,610 procedures, 5,126 subsystems, 1,298 systems and 73 PCS headers are orphaned and blocked from production publishing.",
          recommendation: "Manually overwrite the invalid regional constraint flag on GMV-2967 within Draft Tables, approve via Audit timeline AUD-002, and trigger a schema sync."
        };
        aiText = "Here is the structured analysis of the missing PCS procedures:";
      } else if (lowerText.includes('vehicle') || lowerText.includes('cascade') || lowerText.includes('highest')) {
        structuredResponse = {
          rootCause: "Vehicle 2967 triggers a 4-level deep hierarchical relationship dependency chain.",
          evidence: "Cascade Amplification score is 2,063× (150,610 downstream procedures affected relative to 73 root headers).",
          impact: "Highest data quality bottleneck currently active in the database.",
          recommendation: "Prioritize ERR-2967 over other missing model/make reference errors, as resolving it clears 98.4% of total outstanding differences."
        };
        aiText = "Here is the cascade analysis mapping vehicle dependencies:";
      } else if (lowerText.includes('first') || lowerText.includes('priority') || lowerText.includes('error')) {
        structuredResponse = {
          rootCause: "Multiple missing foreign key constraints across Makes, Models, and Procedures.",
          evidence: "ERR-2967 (Vehicle 2967) blocks 150,610 procedures. ERR-3091 (Orphan Records) blocks 521,878 draft procedures in MCS.",
          impact: "MCS Procedures discrepancy is larger (521k rows), but is restricted to Draft Tables. PCS Procedures (150k rows) affects Published PROD tables directly.",
          recommendation: "Resolve ERR-2967 first to clean PROD metrics, then apply character sanitization rules for ERR-6019."
        };
        aiText = "Based on error severity and system impact, I recommend the following priority:";
      } else {
        aiText += "No specific keyword matches found. Try asking about 'PCS procedures', 'highest cascade impact', or 'which errors to fix first' for structured diagnostic responses.";
      }

      const aiMsg: CopilotMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: aiText,
        timestamp: new Date().toISOString(),
        structuredResponse
      };

      addCopilotMessage(aiMsg);
      setIsTyping(false);
    }, 1200);
  };

  if (!copilotOpen) return null;

  return (
    <div className="w-80 md:w-96 border-l border-slate-200 bg-surface flex flex-col h-screen sticky top-0 z-30 select-none">
      
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <h2 className="text-xs font-extrabold font-display text-slate-800 tracking-wider uppercase">
            AI Governance Copilot
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearCopilotMessages}
            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-100"
            title="Clear Chat History"
          >
            Clear
          </button>
          <button 
            onClick={() => setCopilotOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {copilotMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-lg px-3 py-2.5 text-xs shadow-sm leading-relaxed
                ${isUser 
                  ? 'bg-brand text-white font-medium rounded-br-none' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200/60 rounded-bl-none'
                }`}>
                <p>{msg.text}</p>
                
                {/* Structured AI Report: Root Cause -> Evidence -> Impact -> Recommendation */}
                {msg.structuredResponse && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/60 space-y-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Root Cause</span>
                      <span className="text-slate-800 font-medium text-[11px] leading-tight flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        {msg.structuredResponse.rootCause}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Evidence</span>
                      <span className="text-slate-600 text-[11px] leading-tight">
                        {msg.structuredResponse.evidence}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Downstream Impact</span>
                      <span className="text-slate-700 font-semibold text-[11px] leading-tight">
                        {msg.structuredResponse.impact}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 bg-brand-50 border border-brand-100 rounded p-2 mt-1">
                      <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-brand" /> Recommendation
                      </span>
                      <span className="text-brand-900 font-semibold text-[11px] leading-tight mt-1 flex items-start gap-1">
                        <ArrowRight className="w-3 h-3 text-brand mt-0.5 flex-shrink-0" />
                        {msg.structuredResponse.recommendation}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 w-fit">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Suggestion list */}
      {copilotMessages.length <= 1 && (
        <div className="px-4 py-2 border-t border-slate-100 space-y-1.5 bg-slate-50/50">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider">SUGGESTED QUERIES</p>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="w-full text-left bg-surface border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded text-[11px] text-slate-600 hover:text-slate-800 transition-all font-medium truncate"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
        <input
          type="text"
          placeholder="Ask a governance question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          className="flex-1 bg-surface border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none hover:border-slate-300 focus:border-brand"
        />
        <button
          onClick={() => handleSend(input)}
          className="bg-brand hover:bg-brand-700 text-white p-2 rounded-lg transition-all flex items-center justify-center shadow-sm active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
