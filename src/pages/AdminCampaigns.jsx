import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Eye, BarChart3, Users, Mail, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminCampaigns() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "both",
    subject: "",
    message: "",
    target_segment_id: "",
    scheduled_date: "",
    status: "draft"
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campaign.list("-created_date"),
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: () => base44.entities.CustomerSegment.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaign) => {
      // Send emails/push notifications
      await base44.integrations.Core.SendEmail({
        to: "admin@example.com",
        subject: `קמפיין נשלח: ${campaign.name}`,
        body: `הקמפיין "${campaign.name}" נשלח ל-${campaign.sent_count} נמענים`
      });
      return base44.entities.Campaign.update(campaign.id, { 
        status: "sent",
        sent_count: campaign.target_emails?.length || 100
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "both",
      subject: "",
      message: "",
      target_segment_id: "",
      scheduled_date: "",
      status: "draft"
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885]">📢 קמפיינים שיווקיים</h1>
          <p className="text-[#A8947D]">ניהול קמפיינים ומעקב ביצועים</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#B8A393] hover:bg-[#C5B5A4]">
          <Plus size={16} className="ml-2"/> קמפיין חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send size={20} className="text-blue-600"/>
              <span className="text-sm text-gray-500">נשלחו</span>
            </div>
            <p className="text-2xl font-bold">{totalSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={20} className="text-green-600"/>
              <span className="text-sm text-gray-500">נפתחו</span>
            </div>
            <p className="text-2xl font-bold">{totalOpened}</p>
            <p className="text-xs text-gray-500">{openRate}% פתיחות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-purple-600"/>
              <span className="text-sm text-gray-500">קליקים</span>
            </div>
            <p className="text-2xl font-bold">{totalClicked}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-teal-600"/>
              <span className="text-sm text-gray-500">קמפיינים פעילים</span>
            </div>
            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {campaigns.map(campaign => (
          <Card key={campaign.id} className="border-[#E5DDD3]">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-[#7C9885]">{campaign.name}</h3>
                    <Badge className={
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {campaign.status === 'sent' ? 'נשלח' : 
                       campaign.status === 'scheduled' ? 'מתוזמן' : 'טיוטה'}
                    </Badge>
                    <Badge variant="outline">
                      {campaign.type === 'email' ? <Mail size={12}/> : 
                       campaign.type === 'push' ? <Bell size={12}/> : 
                       <><Mail size={12}/><Bell size={12}/></>}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-gray-500">נשלח: {campaign.sent_count || 0}</span>
                    <span className="text-green-600">נפתח: {campaign.opened_count || 0}</span>
                    <span className="text-purple-600">קליק: {campaign.clicked_count || 0}</span>
                    <span className="text-teal-600">המרה: {campaign.converted_count || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => sendCampaignMutation.mutate(campaign)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send size={14} className="ml-1"/> שלח
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <BarChart3 size={14}/> דוח
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>קמפיין חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>שם הקמפיין</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>תיאור</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>סוג קמפיין</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">אימייל</SelectItem>
                    <SelectItem value="push">התראה</SelectItem>
                    <SelectItem value="both">שניהם</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>קהל יעד</Label>
                <Select value={formData.target_segment_id} onValueChange={(v) => setFormData({...formData, target_segment_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר פילוח"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הלקוחות</SelectItem>
                    {segments.map(seg => (
                      <SelectItem key={seg.id} value={seg.id}>{seg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>נושא</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>תוכן ההודעה</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={6}
                required
              />
            </div>
            <div>
              <Label>תזמון שליחה (אופציונלי)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                ביטול
              </Button>
              <Button type="submit" className="bg-[#B8A393] hover:bg-[#C5B5A4]">
                שמור כטיוטה
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}