import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles, FileText, Save, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

export default function TherapistAIWriter() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const { data: therapist } = useQuery({
    queryKey: ["current-therapist"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      return therapists[0];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const lengthMap = {
        short: "300-500 מילים",
        medium: "700-1000 מילים",
        long: "1500-2000 מילים"
      };

      const prompt = `כתוב מאמר מקצועי בעברית על הנושא: "${topic}"

סגנון הכתיבה: ${tone === "professional" ? "מקצועי ורציני" : tone === "friendly" ? "ידידותי וקליל" : "מעורר השראה ומעודד"}
אורך: ${lengthMap[length]}

${additionalInfo ? `מידע נוסף: ${additionalInfo}` : ""}

המאמר צריך להיות:
- מבוסס מחקר ומקצועי
- עם כותרות משנה ברורות
- כולל טיפים מעשיים
- עם סיכום בסוף
- בעברית תקנית וקריאה

${therapist?.specializations ? `רקע מקצועי: ${therapist.specializations.join(", ")}` : ""}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast.success("המאמר נוצר בהצלחה!");
    },
    onError: () => {
      toast.error("שגיאה ביצירת המאמר");
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.BlogPost.create({
      therapist_id: therapist.id,
      title: topic,
      content: generatedContent,
      excerpt: generatedContent.substring(0, 200) + "...",
      is_published: false
    }),
    onSuccess: () => {
      toast.success("המאמר נשמר כטיוטה!");
      setTopic("");
      setAdditionalInfo("");
      setGeneratedContent("");
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("הועתק ללוח!");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={32} className="text-purple-600"/>
          AI - כתיבת מאמרים
        </h1>
        <p className="text-gray-500">צור מאמרים מקצועיים בעזרת בינה מלאכותית</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-white"/>
              </div>
              <div>
                <h3 className="font-bold text-lg">כתיבה חכמה</h3>
                <p className="text-sm text-gray-600">AI מתקדם לכתיבת תוכן</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <div className="space-y-2">
              <Label>נושא המאמר *</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='דוגמה: "כאבי גב - גורמים וטיפול"'
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>טון כתיבה</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">מקצועי</SelectItem>
                    <SelectItem value="friendly">ידידותי</SelectItem>
                    <SelectItem value="inspirational">מעורר השראה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>אורך</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">קצר (300-500)</SelectItem>
                    <SelectItem value="medium">בינוני (700-1000)</SelectItem>
                    <SelectItem value="long">ארוך (1500-2000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>מידע נוסף (אופציונלי)</Label>
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="הוסף פרטים, מחקרים, נקודות שחשוב לך לכלול..."
                className="h-24"
              />
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!topic || generateMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw size={16} className="ml-2 animate-spin"/>
                  יוצר מאמר...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="ml-2"/>
                  צור מאמר
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">המאמר שנוצר</h3>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy size={14} className="ml-1"/> העתק
                  </Button>
                  <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-teal-600 hover:bg-teal-700">
                    <Save size={14} className="ml-1"/> שמור
                  </Button>
                </div>
              )}
            </div>

            <div className="min-h-[500px] max-h-[600px] overflow-y-auto">
              {!generatedContent ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                  <FileText size={64} className="mb-4"/>
                  <p>המאמר יופיע כאן</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}