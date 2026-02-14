import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Send, Bot, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function AIHealthAdvisor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "שלום! אני יועץ AI בריאותי. אשמח לעזור עם שאלות בנושאי בריאות, תזונה, וכושר.\n\n* הייעוץ אינו תחליף לייעוץ רפואי מקצועי" }
  ]);
  const [input, setInput] = useState("");
  const [askedCity, setAskedCity] = useState(false);
  const [userCity, setUserCity] = useState("");
  const navigate = useNavigate();

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const conversationHistory = messages.map(m => `${m.role === "user" ? "משתמש" : "יועץ"}: ${m.content}`).join("\n");
      
      let prompt = `אתה יועץ בריאות AI ידידותי ומקצועי. ענה בעברית בצורה ברורה ומעשית.

${conversationHistory}
משתמש: ${message}

${!askedCity ? "\n\nבסוף התשובה, שאל את המשתמש באיזו עיר הוא גר כדי שתוכל להמליץ על מטפלים באזור." : ""}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data }]);
      
      if (data.includes("איזו עיר") || data.includes("באיזה אזור")) {
        setAskedCity(true);
      }
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    // Check if user mentioned a city
    const cities = ["תל אביב", "ירושלים", "חיפה", "באר שבע", "פתח תקווה", "ראשון לציון", "אשדוד", "נתניה", "בניברק", "חולון"];
    const mentionedCity = cities.find(city => userMessage.includes(city));
    
    if (mentionedCity) {
      setUserCity(mentionedCity);
      // Get therapists in that city
      const therapists = await base44.entities.Therapist.filter({ city: mentionedCity, status: "approved" });
      
      if (therapists.length > 0) {
        let response = `נהדר! מצאתי ${therapists.length} מטפלים ב${mentionedCity}:\n\n`;
        therapists.slice(0, 5).forEach((t, i) => {
          response += `${i + 1}. ${t.full_name} - ${t.specializations?.join(", ") || "מטפל"}\n`;
        });
        response += `\nלחץ על "צפה במטפלים" למטה כדי לראות את כל המטפלים ולקבוע תור.`;
        
        setMessages(prev => [...prev, { role: "assistant", content: response }]);
        return;
      } else {
        chatMutation.mutate(userMessage);
      }
    } else {
      chatMutation.mutate(userMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white">
        <button onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight size={24}/>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24}/>
          </div>
          <div>
            <h1 className="text-xl font-bold">יועץ AI בריאותי</h1>
            <p className="text-sm text-white/80">שאל אותי כל שאלה בנושאי בריאות</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 text-center">
        * הייעוץ אינו תחליף לייעוץ רפואי מקצועי
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === "user" 
                ? "bg-white border" 
                : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-end">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"/>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}/>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show therapists button if city mentioned */}
      {userCity && (
        <div className="px-4 pb-2">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistSearch") + `?area=${userCity}`)}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            צפה במטפלים ב{userCity}
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל שאלה על בריאות, תזונה, כושר..."
            className="flex-1 resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-gradient-to-br from-purple-500 to-blue-500 h-auto"
          >
            <Send size={20}/>
          </Button>
        </div>
      </div>
    </div>
  );
}