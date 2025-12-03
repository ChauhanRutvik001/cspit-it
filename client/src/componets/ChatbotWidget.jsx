import React, { useMemo, useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, Sparkles, Zap, Users, TrendingUp, Brain } from "lucide-react";
import GeminiCareerAdvisor from "../services/geminiAI";
import placement_2019 from "../data/placement_2019.json";
import placement_2020 from "../data/placement_2020.json";
import placement_2021 from "../data/placement_2021.json";
import placement_2022 from "../data/placement_2022.json";
import placement_2023 from "../data/placement_2023.json";
import placement_2024 from "../data/placement_2024.json";
import placement_2025 from "../data/placement_2025.json";

const allPlacementData = [
  placement_2019,
  placement_2020,
  placement_2021,
  placement_2022,
  placement_2023,
  placement_2024,
  placement_2025,
];

// Very small RAG-style helper: build a compact text summary from JSON placement data
const usePlacementSummary = () => {
  return useMemo(() => {
    try {
      const yearSummaries = allPlacementData.map((yearData) => {
        if (!yearData || !yearData.companies) return null;

        const totalOffers = yearData.companies.reduce(
          (sum, c) => sum + (c.offers || 0),
          0
        );

        // Top 5 companies by offers
        const topCompanies = [...yearData.companies]
          .sort((a, b) => (b.offers || 0) - (a.offers || 0))
          .slice(0, 5)
          .map(
            (c) =>
              `${c.company}: ${c.offers || 0} offers${
                c.remarks ? ` (${c.remarks})` : ""
              }`
          )
          .join("; ");

        return `Year ${yearData.year}: total offers ${totalOffers}. Top companies: ${topCompanies}.`;
      });

      const companyAggregate = {};
      allPlacementData.forEach((yearData) => {
        if (!yearData || !yearData.companies) return;
        yearData.companies.forEach((c) => {
          if (!c || !c.company) return;
          const key = c.company.trim();
          if (!companyAggregate[key]) {
            companyAggregate[key] = {
              name: key,
              totalOffers: 0,
              years: [],
            };
          }
          companyAggregate[key].totalOffers += c.offers || 0;
          if (!companyAggregate[key].years.includes(yearData.year)) {
            companyAggregate[key].years.push(yearData.year);
          }
        });
      });

      const topOverallCompanies = Object.values(companyAggregate)
        .sort((a, b) => b.totalOffers - a.totalOffers)
        .slice(0, 15)
        .map(
          (c) =>
            `${c.name}: ${c.totalOffers} total offers across years ${c.years.join(
              ", "
            )}`
        )
        .join("; ");

      return `
You have access to CSPIT-IT historical placement data (approximate, based on local JSON files):

Overall top recruiting companies:
${topOverallCompanies || "Not available"}.

Year-wise placement highlights:
${yearSummaries.filter(Boolean).join("\n")}

Use these facts when answering questions about past placements, company trends, or year-wise statistics. 
If a user asks about a specific company or year, first reason using this data and then clearly explain the answer in simple language.
      `.trim();
    } catch (err) {
      console.error("Error building placement summary for chatbot:", err);
      return "";
    }
  }, []);
};

// AI Response function
const getAIResponse = async (userMessage, placementSummary) => {
  try {
    const prompt = `
You are an AI chatbot embedded in the CSPIT-IT Placement Management System website.
You are talking to students, alumni, counsellors, and admins of the CSPIT IT Department in India.

Your goals:
- Answer placement-related questions clearly and honestly.
- Use the CSPIT-IT historical placement context provided below whenever it is relevant.
- If the question is not about placements, still give a helpful general answer, but keep it short and student-friendly.
- If you don't know something specific about CSPIT-IT, say that you don't have exact data and answer in a generic but useful way.

Context (RAG knowledge, do NOT repeat verbatim unless needed):
${placementSummary}

User question:
${userMessage}

Now give a concise, friendly answer. Use bullet points only when needed, and keep the tone supportive and practical.
    `.trim();

    const response = await GeminiCareerAdvisor.generateContent(prompt);
    return response || "Sorry, I could not generate a response at the moment.";
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    throw error;
  }
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Show subtle decorative animations only on startup for a few seconds
  const [showStartupAnimation, setShowStartupAnimation] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "👋 Welcome to your AI-powered Placement Assistant!\n\n✨ I'm here to help you with:\n🏢 Placement statistics & company insights\n📈 Interview preparation strategies\n🎯 Career guidance & opportunities\n📊 Historical placement trends\n\nWhat would you like to explore today?",
    },
  ]);

  const placementSummary = usePlacementSummary();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // disable startup animations after a short delay
  useEffect(() => {
    const t = setTimeout(() => setShowStartupAnimation(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Typing indicator simulation
  const simulateTyping = async (text) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, Math.min(text.length * 20, 2000)));
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message with enhanced styling
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const response = await getAIResponse(userMessage, placementSummary);
      
      // Simulate typing before showing response
      await simulateTyping(response);
      
      const botMessage = {
        role: "bot",
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        role: "bot",
        content: "⚠️ I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or contact your placement cell for immediate assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };






  // Quick action buttons for common queries
  const quickActions = [
    { icon: Users, text: "Top Companies", query: "What are the top recruiting companies at CSPIT-IT?" },
    { icon: TrendingUp, text: "Placement Stats", query: "Show me the latest placement statistics and trends." },
    { icon: Brain, text: "Interview Tips", query: "Give me some interview preparation tips and strategies." },
    { icon: Zap, text: "Career Guide", query: "Help me with career guidance and opportunities in tech." }
  ];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (query) => {
    setInput(query);
  };

  return (
    <>
      {/* Next-level Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative group">
            {/* Floating rings animation (only on startup) */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 ${showStartupAnimation ? 'animate-pulse' : ''}`}></div>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${showStartupAnimation ? 'animate-ping opacity-30' : 'opacity-30'}`}></div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 border border-white/10 backdrop-blur-xl group-hover:border-white/20"
            >
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                  <Sparkles className={`absolute -top-1 -right-1 w-4 h-4 text-yellow-300 ${showStartupAnimation ? 'animate-bounce' : ''}`} />
                </div>
                {/* Pulsing dot */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ${showStartupAnimation ? 'animate-pulse' : ''} border-2 border-slate-900`}></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                  AI Assistant
                </div>
                <div className="text-xs text-slate-300">
                  Powered by AI ✨
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Next-level Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[420px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.4)] border border-white/20 backdrop-blur-2xl">
          
          {/* Premium Header */}
          <div className="relative bg-gray-900 text-white p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 shadow-xl border border-white/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900">
                    <Sparkles className="w-2.5 h-2.5 text-slate-900" />
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                    CSPIT-IT AI Assistant
                  </div>
                  <div className="text-sm text-slate-300 flex items-center gap-2">
                    <div className={`w-2 h-2 bg-emerald-400 rounded-full ${showStartupAnimation ? 'animate-pulse' : ''}`}></div>
                    Online & Ready
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 group border border-white/10 hover:border-white/20"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 p-3 border-b border-white/20">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200 hover:border-blue-300 transition-all duration-200 whitespace-nowrap text-xs font-medium text-slate-700 hover:text-blue-700 shadow-sm hover:shadow-md group"
                >
                  <action.icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Messages Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-blue-50/50 max-h-96">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {m.role === "bot" && (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                      {m.timestamp && (
                        <div className="text-xs text-slate-400 mt-2">
                          {m.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {m.role === "user" && (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
                      <div className="text-sm leading-relaxed">
                        {m.content}
                      </div>
                      {m.timestamp && (
                        <div className="text-xs text-blue-100 mt-2 opacity-75">
                          {m.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2 text-xs text-slate-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && !isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                    <div className="text-sm text-slate-600">Processing your request...</div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Premium Input Area */}
          <div className="bg-gradient-to-r from-white via-slate-50 to-blue-50 border-t border-slate-200/50 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div className="relative rounded-2xl bg-white/90 border border-slate-300 shadow-sm hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 overflow-hidden">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about placements, companies, or career guidance..."
                    className="w-full resize-none text-sm px-4 py-3.5 bg-transparent border-none focus:outline-none placeholder:text-slate-400 min-h-[52px] max-h-32"
                    style={{ 
                      minHeight: '52px',
                      lineHeight: '1.5',
                      scrollbarWidth: 'thin'
                    }}
                  />
                  {/* Input decorations */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
                  
                  {/* Character count and clear button */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {input && (
                      <>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          {input.length}
                        </span>
                        <button
                          onClick={() => setInput("")}
                          className="p-1 hover:bg-slate-200 rounded-full transition-all duration-200 group"
                          title="Clear message"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Microphone button (visual only) */}
                  {!input && (
                    <div className="absolute bottom-3 right-3 p-1.5 rounded-full bg-slate-100 opacity-50">
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="relative p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:scale-100 group min-h-[52px] flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-active:opacity-30 transition-opacity duration-100"></div>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                )}
              </button>
            </div>
            
            {/* Enhanced footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span>AI-powered by Gemini</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-mono">Enter</kbd>
                <span>to send</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;


