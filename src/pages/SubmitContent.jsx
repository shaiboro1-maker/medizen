import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, Clock } from "lucide-react";

const CONTENT_TYPES = [
  { id: "exercise", label: "תרגיל", emoji: "💪" },
  { id: "recipe", label: "מתכון", emoji: "🥗" },
  { id: "inspiration", label: "משפט השראה", emoji: "✨" },
  { id: "story", label: "סיפור", emoji: "📖" },
  { id: "joke", label: "בדיחה", emoji: "😂" },
  { id: "suggestion", label: "הצעה", emoji: "💡" },
  { id: "tip", label: "טיפ בריאותי", emoji: "⭐" }
];

export default function SubmitContent() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    content_type: "",
    title: "",
    description: "",
    content: "",
    image_url: "",
    video_url: ""
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ["mySubmissions", user?.email],
    queryFn: () => base44.entities.UserContent?.filter({ user_email: user.email }) || [],
    enabled: !!user
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.UserContent.create({
      ...data,
      user_email: user.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["mySubmissions"]);
      setFormData({
        content_type: "",
        title: "",
        description: "",
        content: "",
        image_url: "",
        video_url: ""
      });
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({...formData, image_url: file_url});
    }
  };

  const handleSubmit = () => {
    if (formData.content_type && formData.title && formData.content) {
      submitMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">שתף תוכן עם הקהילה</h1>
        <p className="text-gray-500">המתכונים, התרגילים והטיפים שלך יעברו אישור אדמין לפני הפרסום</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>תוכן חדש</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">סוג התוכן</label>
            <Select value={formData.content_type} onValueChange={(v) => setFormData({...formData, content_type: v})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג תוכן"/>
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">כותרת</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="כותרת מושכת"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">תיאור קצר</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תיאור בקצרה"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">תוכן מלא</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="כתוב את התוכן המלא כאן..."
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">תמונה (אופציונלי)</label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded"/>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">קישור לסרטון (אופציונלי)</label>
            <Input
              value={formData.video_url}
              onChange={(e) => setFormData({...formData, video_url: e.target.value})}
              placeholder="https://youtube.com/..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !formData.content_type || !formData.title || !formData.content}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <Upload size={18} className="ml-2"/>
            {submitMutation.isPending ? "שולח..." : "שלח לאישור"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ההגשות שלי</CardTitle>
        </CardHeader>
        <CardContent>
          {mySubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50"/>
              <p>עדיין לא שלחת תוכן</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map(submission => (
                <div key={submission.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{submission.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === "approved" && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16}/>
                          <span className="text-xs">אושר</span>
                        </div>
                      )}
                      {submission.status === "pending" && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock size={16}/>
                          <span className="text-xs">ממתין</span>
                        </div>
                      )}
                      {submission.status === "rejected" && (
                        <span className="text-xs text-red-600">נדחה</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}