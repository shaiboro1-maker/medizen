import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EXERCISE_CATS = ["back", "neck", "shoulder", "knee", "heel", "hip", "wrist", "general", "stretching", "strengthening"];
const RECIPE_CATS = ["anti_inflammatory", "energy", "sleep", "weight_loss", "muscle", "skin", "immunity", "general"];

export default function TherapistContent() {
  const [therapist, setTherapist] = useState(null);
  const [showExForm, setShowExForm] = useState(false);
  const [showRecForm, setShowRecForm] = useState(false);
  const [exForm, setExForm] = useState({ title: "", description: "", category: "general", difficulty: "medium" });
  const [recForm, setRecForm] = useState({ title: "", description: "", category: "general", ingredients: "", instructions: "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: exercises = [] } = useQuery({
    queryKey: ["myExercises", therapist?.id],
    queryFn: () => base44.entities.Exercise.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["myRecipes", therapist?.id],
    queryFn: () => base44.entities.Recipe.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const createExMutation = useMutation({
    mutationFn: (data) => base44.entities.Exercise.create({ ...data, therapist_id: therapist.id, therapist_name: therapist.full_name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myExercises"] }); setShowExForm(false); },
  });

  const createRecMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create({ ...data, therapist_id: therapist.id, therapist_name: therapist.full_name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myRecipes"] }); setShowRecForm(false); },
  });

  const deleteExMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myExercises"] }),
  });

  const deleteRecMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myRecipes"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ניהול תוכן</h1>

      <Tabs defaultValue="exercises">
        <TabsList className="bg-gray-100 rounded-xl p-1 mb-6">
          <TabsTrigger value="exercises">תרגילים ({exercises.length})</TabsTrigger>
          <TabsTrigger value="recipes">מתכונים ({recipes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <Button onClick={() => setShowExForm(true)} className="bg-teal-600 hover:bg-teal-700 mb-4">
            <Plus size={16} className="ml-2"/> תרגיל חדש
          </Button>
          <div className="space-y-3">
            {exercises.map(ex => (
              <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{ex.title}</h3>
                  <p className="text-sm text-gray-500">{ex.category}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteExMutation.mutate(ex.id)} className="text-red-500"><Trash2 size={16}/></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recipes">
          <Button onClick={() => setShowRecForm(true)} className="bg-teal-600 hover:bg-teal-700 mb-4">
            <Plus size={16} className="ml-2"/> מתכון חדש
          </Button>
          <div className="space-y-3">
            {recipes.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="text-sm text-gray-500">{r.category}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteRecMutation.mutate(r.id)} className="text-red-500"><Trash2 size={16}/></Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Exercise Form Dialog */}
      <Dialog open={showExForm} onOpenChange={setShowExForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>תרגיל חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>כותרת</Label><Input value={exForm.title} onChange={e => setExForm({...exForm, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={exForm.description} onChange={e => setExForm({...exForm, description: e.target.value})}/></div>
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={exForm.category} onValueChange={v => setExForm({...exForm, category: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{EXERCISE_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={() => createExMutation.mutate(exForm)} className="w-full bg-teal-600 hover:bg-teal-700">צור תרגיל</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Form Dialog */}
      <Dialog open={showRecForm} onOpenChange={setShowRecForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>מתכון חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>כותרת</Label><Input value={recForm.title} onChange={e => setRecForm({...recForm, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={recForm.description} onChange={e => setRecForm({...recForm, description: e.target.value})}/></div>
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={recForm.category} onValueChange={v => setRecForm({...recForm, category: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{RECIPE_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>מרכיבים</Label><Textarea value={recForm.ingredients} onChange={e => setRecForm({...recForm, ingredients: e.target.value})}/></div>
            <div className="space-y-2"><Label>הוראות הכנה</Label><Textarea value={recForm.instructions} onChange={e => setRecForm({...recForm, instructions: e.target.value})}/></div>
            <Button onClick={() => createRecMutation.mutate(recForm)} className="w-full bg-teal-600 hover:bg-teal-700">צור מתכון</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}