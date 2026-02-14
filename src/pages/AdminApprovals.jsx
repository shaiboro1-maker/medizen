import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function AdminApprovals() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: therapists = [] } = useQuery({
    queryKey: ["pendingTherapists"],
    queryFn: () => base44.entities.Therapist.filter({ status: "pending" }),
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["pendingExercises"],
    queryFn: () => base44.entities.Exercise.filter({ is_approved: false }),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["pendingRecipes"],
    queryFn: () => base44.entities.Recipe.filter({ is_approved: false }),
  });

  const { data: userContent = [] } = useQuery({
    queryKey: ["pendingUserContent"],
    queryFn: () => base44.entities.UserContent.filter({ is_approved: false }),
  });

  const { data: bulletinPosts = [] } = useQuery({
    queryKey: ["pendingBulletin"],
    queryFn: () => base44.entities.BulletinPost.filter({ status: "pending" }),
  });

  const { data: inspirations = [] } = useQuery({
    queryKey: ["pendingInspirations"],
    queryFn: () => base44.entities.Inspiration.filter({ is_approved: false }),
  });

  const approveTherapist = useMutation({
    mutationFn: (id) => base44.entities.Therapist.update(id, { status: "approved" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingTherapists"] }),
  });

  const rejectTherapist = useMutation({
    mutationFn: (id) => base44.entities.Therapist.update(id, { status: "suspended" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingTherapists"] }),
  });

  const approveExercise = useMutation({
    mutationFn: (id) => base44.entities.Exercise.update(id, { is_approved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingExercises"] }),
  });

  const rejectExercise = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingExercises"] }),
  });

  const approveRecipe = useMutation({
    mutationFn: (id) => base44.entities.Recipe.update(id, { is_approved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingRecipes"] }),
  });

  const rejectRecipe = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingRecipes"] }),
  });

  const approveUserContent = useMutation({
    mutationFn: (id) => base44.entities.UserContent.update(id, { is_approved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingUserContent"] }),
  });

  const rejectUserContent = useMutation({
    mutationFn: (id) => base44.entities.UserContent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingUserContent"] }),
  });

  const approveBulletin = useMutation({
    mutationFn: (id) => base44.entities.BulletinPost.update(id, { status: "approved" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingBulletin"] }),
  });

  const rejectBulletin = useMutation({
    mutationFn: (id) => base44.entities.BulletinPost.update(id, { status: "rejected" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingBulletin"] }),
  });

  const approveInspiration = useMutation({
    mutationFn: (id) => base44.entities.Inspiration.update(id, { is_approved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingInspirations"] }),
  });

  const rejectInspiration = useMutation({
    mutationFn: (id) => base44.entities.Inspiration.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingInspirations"] }),
  });

  const totalPending = therapists.length + exercises.length + recipes.length + userContent.length + bulletinPosts.length + inspirations.length;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#7C9885]">🔍 אישור תכנים</h1>
        <p className="text-[#A8947D]">{totalPending} פריטים ממתינים לאישור</p>
      </div>

      <Tabs defaultValue="therapists" className="space-y-4">
        <TabsList className="bg-white rounded-xl p-1 border border-[#E5DDD3]">
          <TabsTrigger value="therapists">מטפלים ({therapists.length})</TabsTrigger>
          <TabsTrigger value="exercises">תרגילים ({exercises.length})</TabsTrigger>
          <TabsTrigger value="recipes">מתכונים ({recipes.length})</TabsTrigger>
          <TabsTrigger value="content">תוכן משתמשים ({userContent.length})</TabsTrigger>
          <TabsTrigger value="bulletin">לוח מודעות ({bulletinPosts.length})</TabsTrigger>
          <TabsTrigger value="inspirations">השראה ({inspirations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="therapists">
          {therapists.length === 0 ? (
            <EmptyState message="אין מטפלים ממתינים לאישור"/>
          ) : (
            <div className="space-y-3">
              {therapists.map(t => (
                <ApprovalCard
                  key={t.id}
                  title={t.full_name}
                  subtitle={`${t.user_email} • ${t.categories?.join(", ")}`}
                  image={t.profile_image}
                  onApprove={() => approveTherapist.mutate(t.id)}
                  onReject={() => rejectTherapist.mutate(t.id)}
                  onView={() => setSelectedItem({ type: 'therapist', data: t })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises">
          {exercises.length === 0 ? (
            <EmptyState message="אין תרגילים ממתינים לאישור"/>
          ) : (
            <div className="space-y-3">
              {exercises.map(e => (
                <ApprovalCard
                  key={e.id}
                  title={e.title}
                  subtitle={`קטגוריה: ${e.category} • ${e.therapist_name || 'משתמש'}`}
                  image={e.thumbnail_url}
                  onApprove={() => approveExercise.mutate(e.id)}
                  onReject={() => rejectExercise.mutate(e.id)}
                  onView={() => setSelectedItem({ type: 'exercise', data: e })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recipes">
          {recipes.length === 0 ? (
            <EmptyState message="אין מתכונים ממתינים לאישור"/>
          ) : (
            <div className="space-y-3">
              {recipes.map(r => (
                <ApprovalCard
                  key={r.id}
                  title={r.title}
                  subtitle={`קטגוריה: ${r.category} • ${r.therapist_name || 'משתמש'}`}
                  image={r.image_url}
                  onApprove={() => approveRecipe.mutate(r.id)}
                  onReject={() => rejectRecipe.mutate(r.id)}
                  onView={() => setSelectedItem({ type: 'recipe', data: r })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content">
          {userContent.length === 0 ? (
            <EmptyState message="אין תוכן משתמשים ממתין לאישור"/>
          ) : (
            <div className="space-y-3">
              {userContent.map(c => (
                <ApprovalCard
                  key={c.id}
                  title={c.title}
                  subtitle={`סוג: ${c.content_type} • ${c.submitted_by}`}
                  onApprove={() => approveUserContent.mutate(c.id)}
                  onReject={() => rejectUserContent.mutate(c.id)}
                  onView={() => setSelectedItem({ type: 'content', data: c })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulletin">
          {bulletinPosts.length === 0 ? (
            <EmptyState message="אין מודעות ממתינות לאישור"/>
          ) : (
            <div className="space-y-3">
              {bulletinPosts.map(b => (
                <ApprovalCard
                  key={b.id}
                  title={b.title}
                  subtitle={`${b.category} • ${b.therapist_name}`}
                  image={b.image_urls?.[0]}
                  onApprove={() => approveBulletin.mutate(b.id)}
                  onReject={() => rejectBulletin.mutate(b.id)}
                  onView={() => setSelectedItem({ type: 'bulletin', data: b })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inspirations">
          {inspirations.length === 0 ? (
            <EmptyState message="אין משפטי השראה ממתינים לאישור"/>
          ) : (
            <div className="space-y-3">
              {inspirations.map(i => (
                <ApprovalCard
                  key={i.id}
                  title={i.text}
                  subtitle={`מאת: ${i.author || i.submitted_by}`}
                  image={i.image_url}
                  onApprove={() => approveInspiration.mutate(i.id)}
                  onReject={() => rejectInspiration.mutate(i.id)}
                  onView={() => setSelectedItem({ type: 'inspiration', data: i })}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>תצוגה מקדימה</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs" dir="ltr">
                {JSON.stringify(selectedItem.data, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApprovalCard({ title, subtitle, image, onApprove, onReject, onView }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5DDD3] p-4 flex items-start gap-4">
      {image && (
        <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover"/>
      )}
      <div className="flex-1">
        <h3 className="font-bold text-[#7C9885]">{title}</h3>
        <p className="text-sm text-[#A8947D]">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye size={14}/>
        </Button>
        <Button size="sm" onClick={onApprove} className="bg-green-600 hover:bg-green-700">
          <Check size={14} className="ml-1"/> אשר
        </Button>
        <Button size="sm" variant="outline" onClick={onReject} className="text-red-600 hover:bg-red-50">
          <X size={14} className="ml-1"/> דחה
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5DDD3] p-12 text-center">
      <p className="text-[#A8947D]">{message}</p>
    </div>
  );
}