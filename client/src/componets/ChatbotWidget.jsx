import React, { useMemo, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
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

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi! I’m your CSPIT-IT Placement Assistant.\n\nYou can ask me anything about:\n• Placement statistics and company trends\n• How to prepare for placements and interviews\n• General queries about the placement process and opportunities.\n\nWhat would you like to know?",
    },
  ]);

  const placementSummary = usePlacementSummary();

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const lastMessages = messages.slice(-6); // keep recent short history
      const historyText = lastMessages
        .map(
          (m) =>
            `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`
        )
        .join("\n");

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

Conversation history (most recent first):
${historyText}

User question:
${question}

Now give a concise, friendly answer. Use bullet points only when needed, and keep the tone supportive and practical.
      `.trim();

      const responseText = await GeminiCareerAdvisor.generateContent(prompt);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: responseText || "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Sorry, I’m having trouble answering right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

   return (
     <>
       {/* Floating button bottom-right */}
       <div className="fixed bottom-6 right-6 z-40">
         {!isOpen && (
           <button
             onClick={() => setIsOpen(true)}
             className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-[0_12px_30px_rgba(15,23,42,0.45)] hover:scale-105 hover:shadow-[0_18px_45px_rgba(15,23,42,0.55)] transition-all duration-150"
           >
             <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10">
               <MessageCircle className="w-5 h-5" />
               <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 border border-slate-900"></span>
             </div>
             <span className="hidden sm:inline text-sm font-semibold">
               AI Assistant
             </span>
           </button>
         )}
       </div>
 
       {/* Chat window bottom-right */}
       {isOpen && (
         <div className="fixed bottom-6 right-6 z-40 w-[320px] sm:w-[380px] max-h-[72vh] flex flex-col rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.55)] border border-slate-200/70 overflow-hidden">
           {/* Header */}
           <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
             <div className="flex items-center gap-2">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 border border-white/20">
                 <MessageCircle className="w-4 h-4" />
               </div>
               <div className="flex flex-col">
                 <span className="font-semibold text-sm">
                   CSPIT-IT Placement Assistant
                 </span>
                 <span className="text-[11px] text-blue-100">
                   Ask anything about placements & companies
                 </span>
               </div>
             </div>
             <button
               onClick={() => setIsOpen(false)}
               className="p-1 rounded-full hover:bg-white/10 transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
           </div>
 
           {/* Messages */}
           <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
             {messages.map((m, idx) => (
               <div
                 key={idx}
                 className={`flex ${
                   m.role === "user" ? "justify-end" : "justify-start"
                 }`}
               >
                 <div
                   className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed ${
                     m.role === "user"
                       ? "bg-blue-600 text-white rounded-br-sm shadow-md"
                       : "bg-white/90 text-slate-900 border border-slate-200 rounded-bl-sm shadow-sm"
                   }`}
                 >
                   {m.content}
                 </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                 <div className="flex items-center gap-2 bg-white/90 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-500 shadow-sm">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   Thinking...
                 </div>
               </div>
             )}
           </div>
 
           {/* Input */}
           <div className="border-t border-slate-200 bg-white/95 px-3 py-2">
             <div className="flex items-end gap-2">
               <textarea
                 rows={1}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Ask about placements, companies, or preparation..."
                 className="flex-1 resize-none text-xs border border-slate-300 rounded-xl px-2 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
               />
               <button
                 onClick={handleSend}
                 disabled={isLoading || !input.trim()}
                 className="p-2 rounded-full bg-blue-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
               >
                 {isLoading ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   <Send className="w-4 h-4" />
                 )}
               </button>
             </div>
             <p className="mt-1 text-[10px] text-slate-400">
               AI-generated answers using CSPIT-IT placement data; verify for
               official use.
             </p>
           </div>
         </div>
       )}
     </>
   );
};

export default ChatbotWidget;


