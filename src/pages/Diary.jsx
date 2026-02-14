import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar as CalendarIcon, TrendingUp, Smile, Meh, Frown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const MOODS = [
  { id: "excellent", label: "מצוין", emoji: "😄", color: "text-green-600 bg-green-100" },
  { id: "good", label: "טוב", emoji: "🙂", color: "text-blue-600 bg-blue-100" },
  { id: "okay", label: "בסדר", emoji: "😐", color: "text-yellow-600 bg-yellow-100" },
  { id: "bad", label: "לא טוב", emoji: "😕", color: "text-orange-600 bg-orange-100" },
  { id: "terrible", label: "גרוע", emoji: "😢", color: "text-red-600 bg-red-100" },
];

export default function Diary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({
    mood: "okay",
    content: "",
    pain_level: 0,
    energy_level: 5,
    tags: []
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["diary", user?.email],
    queryFn: () => base44.entities.DiaryEntry.filter({ user_email: user.email }, "-date"),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DiaryEntry.create({
      ...data,
      user_email: user.email,
      date: format(selectedDate, "yyyy-MM-dd")
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      setShowDialog(false);
      setForm({ mood: "okay", content: "", pain_level: 0, energy_level: 5, tags: [] });
    }
  });

  return (
    <div className="min-h-screen pb-24" style={{backgroundColor: '#F5F1E8'}}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <h1 className="text-xl font-bold">יומן אישי</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-right">
            <h2 className="text-lg font-bold mb-1 text-[#7C9885]">עקוב אחר מצב הרוח שלך</h2>
            <p className="text-sm text-[#A8947D]">שמור רשומות יומיות</p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-[#B8A393] hover:bg-[#C5B5A4] text-white rounded-full text-sm px-4 py-2"
          >
            <Plus size={16} className="ml-2"/> רשומה חדשה
          </Button>
        </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl"/>)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">עדיין אין רשומות ביומן</p>
          <Button onClick={() => setShowDialog(true)} variant="outline">
            צור רשומה ראשונה
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const mood = MOODS.find(m => m.id === entry.mood);
            return (
              <div key={entry.id} className="bg-white rounded-xl border border-[#E5DDD3] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${mood?.color} flex items-center justify-center text-xl`}>
                      {mood?.emoji}
                    </div>
                    <div className="text-right">
                      <h3 className="font-semibold text-sm">{format(new Date(entry.date), "d MMMM yyyy", { locale: he })}</h3>
                      <p className="text-xs text-gray-500">{mood?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {entry.pain_level > 0 && (
                      <Badge variant="outline" className="text-red-600 text-xs">
                        כאב: {entry.pain_level}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-blue-600 text-xs">
                      אנרגיה: {entry.energy_level}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line line-clamp-2">{entry.content}</p>
                {entry.tags?.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {entry.tags.map((tag, i) => (
                      <Badge key={i} className="bg-teal-50 text-teal-700">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">רשומה חדשה ביומן</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">תאריך</Label>
              <Input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="mt-1 h-9"
              />
            </div>

            <div>
              <Label className="text-sm">איך אתה מרגיש?</Label>
              <div className="grid grid-cols-5 gap-1 mt-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setForm({...form, mood: mood.id})}
                    className={`p-2 rounded-lg border transition-all ${
                      form.mood === mood.id 
                        ? `${mood.color} border-current` 
                        : "border-gray-200"
                    }`}
                  >
                    <div className="text-xl">{mood.emoji}</div>
                    <div className="text-[9px]">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">מה קרה היום?</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
                className="h-24 mt-1 text-sm"
                placeholder="רשום את מחשבותיך..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">כאב (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={form.pain_level}
                  onChange={(e) => setForm({...form, pain_level: Number(e.target.value)})}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-sm">אנרגיה (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={form.energy_level}
                  onChange={(e) => setForm({...form, energy_level: Number(e.target.value)})}
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">תגיות (מופרד בפסיקים)</Label>
              <Input
                value={form.tags.join(", ")}
                onChange={(e) => setForm({...form, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                placeholder="כאב, שינה..."
                className="mt-1 h-9"
              />
            </div>

            <Button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.content || createMutation.isPending}
            className="w-full bg-[#B8A393] hover:bg-[#C5B5A4] h-10"
            >
            {createMutation.isPending ? "שומר..." : "שמור רשומה"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}