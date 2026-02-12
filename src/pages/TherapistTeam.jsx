import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = [
  { id: "secretary", label: "מזכירה", icon: "📋", color: "bg-blue-100 text-blue-700" },
  { id: "marketing", label: "שיווק", icon: "📢", color: "bg-purple-100 text-purple-700" },
  { id: "sales", label: "מכירות", icon: "💰", color: "bg-green-100 text-green-700" },
  { id: "retention", label: "שימור לקוח", icon: "❤️", color: "bg-pink-100 text-pink-700" }
];

export default function TherapistTeam() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ email: "", full_name: "", role: "" });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: therapist } = useQuery({
    queryKey: ["therapist", user?.email],
    queryFn: () => base44.entities.Therapist.filter({ user_email: user.email }).then(r => r[0]),
    enabled: !!user
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers", therapist?.id],
    queryFn: () => base44.entities.TeamMember?.list() || [],
    enabled: !!therapist
  });

  const addMemberMutation = useMutation({
    mutationFn: async (memberData) => {
      await base44.users.inviteUser(memberData.email, "user");
      return base44.entities.TeamMember.create({
        therapist_id: therapist.id,
        ...memberData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teamMembers"]);
      setIsDialogOpen(false);
      setNewMember({ email: "", full_name: "", role: "" });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["teamMembers"])
  });

  const handleAddMember = () => {
    if (newMember.email && newMember.full_name && newMember.role) {
      addMemberMutation.mutate(newMember);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users size={32} className="text-teal-600"/>
            ניהול צוות
          </h1>
          <p className="text-gray-500 mt-2">נהל את הנציגויות שמנהלות את המרפאה שלך</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <UserPlus size={18} className="ml-2"/>
              הוסף חבר צוות
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוסף חבר צוות חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">שם מלא</label>
                <Input
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                  placeholder="שם מלא"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">אימייל</label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">תפקיד</label>
                <Select value={newMember.role} onValueChange={(v) => setNewMember({...newMember, role: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תפקיד"/>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.icon} {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddMember}
                disabled={addMemberMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {addMemberMutation.isPending ? "מוסיף..." : "הוסף חבר צוות"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {ROLES.map(role => {
          const count = teamMembers.filter(m => m.role === role.id).length;
          return (
            <Card key={role.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{role.label}</p>
                    <p className="text-3xl font-bold mt-1">{count}</p>
                  </div>
                  <div className="text-4xl">{role.icon}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>חברי הצוות</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-50"/>
              <p>עדיין לא הוספת חברי צוות</p>
              <p className="text-sm mt-2">לחץ על "הוסף חבר צוות" כדי להתחיל</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map(member => {
                const role = ROLES.find(r => r.id === member.role);
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                        {member.full_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={14} className="text-gray-400"/>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={role?.color}>
                        {role?.icon} {role?.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMemberMutation.mutate(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16}/>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}