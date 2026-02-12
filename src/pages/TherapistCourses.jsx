import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TherapistCourses() {
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: 0, category: "", lessons: [] });
  const [newLesson, setNewLesson] = useState({ title: "", description: "", duration_minutes: 0 });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ["myCourses", therapist?.id],
    queryFn: () => base44.entities.Course.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create({
      ...data,
      therapist_id: therapist.id,
      therapist_name: therapist.full_name,
      price: Number(data.price),
      total_duration_minutes: data.lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      setShowForm(false);
      setForm({ title: "", description: "", price: 0, category: "", lessons: [] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myCourses"] }),
  });

  const addLesson = () => {
    if (!newLesson.title) return;
    setForm({...form, lessons: [...form.lessons, newLesson]});
    setNewLesson({ title: "", description: "", duration_minutes: 0 });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">הקורסים שלי</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> קורס חדש
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <Video size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400">צור את הקורס הראשון שלך</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-40 bg-gradient-to-bl from-purple-50 to-blue-50 flex items-center justify-center">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.title} className="w-full h-full object-cover"/>
                ) : (
                  <Video size={48} className="text-purple-200"/>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{c.lessons?.length || 0} שיעורים · {c.total_duration_minutes} דק׳</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-700">₪{c.price}</span>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400">{c.enrolled_count || 0} נרשמו</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} className="text-red-500">
                      <Trash2 size={14}/>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>קורס דיגיטלי חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>שם הקורס</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>מחיר</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/></div>
              <div className="space-y-2"><Label>קטגוריה</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})}/></div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">שיעורים ({form.lessons.length})</h3>
              <div className="space-y-3 mb-4">
                {form.lessons.map((lesson, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration_minutes} דק׳</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setForm({...form, lessons: form.lessons.filter((_, idx) => idx !== i)})}>
                      <Trash2 size={14}/>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Input placeholder="שם השיעור" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}/>
                <div className="flex gap-2">
                  <Input placeholder="משך (דקות)" type="number" value={newLesson.duration_minutes} onChange={e => setNewLesson({...newLesson, duration_minutes: Number(e.target.value)})}/>
                  <Button onClick={addLesson} variant="outline">הוסף שיעור</Button>
                </div>
              </div>
            </div>

            <Button onClick={() => createMutation.mutate(form)} disabled={!form.title || form.lessons.length === 0 || createMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700">
              {createMutation.isPending ? "יוצר..." : "צור קורס"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}