import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Send, Users, TrendingUp, Heart, Brain, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function TherapistContentRecommendations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedContent, setSelectedContent] = useState([]);
  const [personalMessage, setPersonalMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ["therapistClients", therapist?.id],
    queryFn: async () => {
      const appointments = await base44.entities.Appointment.filter({ 
        therapist_id: therapist.id 
      });
      const uniqueClients = [...new Map(
        appointments.map(a => [a.client_email, { email: a.client_email, name: a.client_name }])
      ).values()];
      return uniqueClients;
    },
    enabled: !!therapist,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.filter({ is_approved: true }),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => base44.entities.Recipe.filter({ is_approved: true }),
  });

  const { data: music = [] } = useQuery({
    queryKey: ["music"],
    queryFn: () => base44.entities.Music.list(),
  });

  const sendRecommendationMutation = useMutation({
    mutationFn: async (data) => {
      // Create recommendations
      await Promise.all(data.recommendations.map(rec => 
        base44.entities.AIRecommendation.create(rec)
      ));
      // Send notification
      await base44.entities.Notification.create({
        user_email: data.clientEmail,
        recipient_email: data.clientEmail,
        title: `המלצות תוכן מ-${therapist.full_name}`,
        message: data.message,
        type: "content"
      });
    },
    onSuccess: () => {
      alert("ההמלצות נשלחו בהצלחה!");
      setSelectedClient(null);
      setSelectedContent([]);
      setPersonalMessage("");
    },
  });

  const getClientRecommendations = (clientEmail) => {
    const clientAppointments = appointments.filter(a => a.client_email === clientEmail);
    if (clientAppointments.length === 0) return { exercises: [], recipes: [], music: [] };

    // Analyze services
    const services = clientAppointments.map(a => a.service_name?.toLowerCase() || "");
    const categories = [...new Set(clientAppointments.map(a => a.service_name))];

    // Smart matching
    const recommendedExercises = exercises.filter(ex => {
      const category = ex.category?.toLowerCase();
      return services.some(s => 
        s.includes(category) || 
        s.includes("גב") && (category === "back" || category === "גב") ||
        s.includes("צוואר") && (category === "neck" || category === "צוואר") ||
        s.includes("כתף") && (category === "shoulder" || category === "כתף") ||
        s.includes("ברך") && (category === "knee" || category === "ברך")
      );
    }).slice(0, 5);

    const recommendedRecipes = recipes.filter(r => {
      const category = r.category?.toLowerCase();
      return services.some(s => 
        s.includes("תזונ") || s.includes("דיאטה") || 
        category === "healthy" || category === "בריאות"
      );
    }).slice(0, 5);

    const recommendedMusic = music.filter(m => 
      m.category?.toLowerCase().includes("relax") || 
      m.category?.toLowerCase().includes("מדיטציה") ||
      m.category?.toLowerCase().includes("הרפיה")
    ).slice(0, 5);

    return {
      exercises: recommendedExercises,
      recipes: recommendedRecipes,
      music: recommendedMusic,
      totalAppointments: clientAppointments.length,
      categories
    };
  };

  const handleSendRecommendations = () => {
    if (!selectedClient || selectedContent.length === 0) return;
    
    const recommendations = selectedContent.map(content => ({
      user_email: selectedClient.email,
      recommendation_type: content.type,
      item_id: content.id,
      item_title: content.title,
      reason: `המלצה מהמטפל שלך - ${therapist.full_name}`,
      confidence_score: 95,
      based_on: ["therapist_recommendation"]
    }));

    sendRecommendationMutation.mutate({
      clientEmail: selectedClient.email,
      recommendations,
      message: personalMessage || `שלום ${selectedClient.name}, המלצתי עבורך ${selectedContent.length} תכנים שיכולים לעזור לך. בהצלחה!`
    });
  };

  const toggleContent = (content, type) => {
    const exists = selectedContent.find(c => c.id === content.id);
    if (exists) {
      setSelectedContent(selectedContent.filter(c => c.id !== content.id));
    } else {
      setSelectedContent([...selectedContent, { ...content, type }]);
    }
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885] flex items-center gap-2">
            <Sparkles size={24}/> המלצות תוכן חכמות
          </h1>
          <p className="text-[#A8947D]">שלח המלצות מותאמות אישית למטופלים</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <Users className="text-purple-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-sm text-gray-500">מטופלים</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
              <Brain className="text-teal-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{exercises.length + recipes.length}</p>
            <p className="text-sm text-gray-500">תכנים זמינים</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-3">
              <Heart className="text-pink-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{selectedContent.length}</p>
            <p className="text-sm text-gray-500">נבחרו</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>בחר מטופל לשליחת המלצות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map(client => {
              const recs = getClientRecommendations(client.email);
              return (
                <div
                  key={client.email}
                  onClick={() => setSelectedClient(client)}
                  className="bg-white border-2 border-[#E5DDD3] rounded-xl p-4 cursor-pointer hover:border-[#B8A393] transition-all"
                >
                  <h3 className="font-bold text-[#7C9885] mb-1">{client.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{client.email}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{recs.totalAppointments} טיפולים</Badge>
                    {recs.exercises.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {recs.exercises.length} תרגילים
                      </Badge>
                    )}
                    {recs.recipes.length > 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        {recs.recipes.length} מתכונים
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={20}/> המלצות עבור {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">ניתוח מטופל</h3>
                <div className="text-sm">
                  {(() => {
                    const recs = getClientRecommendations(selectedClient.email);
                    return (
                      <>
                        <p>• {recs.totalAppointments} טיפולים בסך הכל</p>
                        <p>• תחומים: {recs.categories.slice(0, 3).join(", ")}</p>
                        <p>• נמצאו {recs.exercises.length + recs.recipes.length + recs.music.length} המלצות רלוונטיות</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Content Selection */}
              <Tabs defaultValue="exercises">
                <TabsList>
                  <TabsTrigger value="exercises">תרגילים</TabsTrigger>
                  <TabsTrigger value="recipes">מתכונים</TabsTrigger>
                  <TabsTrigger value="music">מוזיקה</TabsTrigger>
                </TabsList>

                <TabsContent value="exercises" className="space-y-2">
                  {getClientRecommendations(selectedClient.email).exercises.map(ex => (
                    <div
                      key={ex.id}
                      onClick={() => toggleContent(ex, "exercise")}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedContent.find(c => c.id === ex.id)
                          ? "border-[#B8A393] bg-amber-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {ex.thumbnail_url && (
                          <img src={ex.thumbnail_url} className="w-12 h-12 rounded-lg object-cover"/>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold">{ex.title}</h4>
                          <p className="text-sm text-gray-500">{ex.category}</p>
                        </div>
                        {selectedContent.find(c => c.id === ex.id) && (
                          <Badge className="bg-green-500">נבחר</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {getClientRecommendations(selectedClient.email).exercises.length === 0 && (
                    <p className="text-center py-8 text-gray-400">אין תרגילים רלוונטיים</p>
                  )}
                </TabsContent>

                <TabsContent value="recipes" className="space-y-2">
                  {getClientRecommendations(selectedClient.email).recipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => toggleContent(recipe, "recipe")}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedContent.find(c => c.id === recipe.id)
                          ? "border-[#B8A393] bg-amber-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {recipe.image_url && (
                          <img src={recipe.image_url} className="w-12 h-12 rounded-lg object-cover"/>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold">{recipe.title}</h4>
                          <p className="text-sm text-gray-500">{recipe.category}</p>
                        </div>
                        {selectedContent.find(c => c.id === recipe.id) && (
                          <Badge className="bg-green-500">נבחר</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {getClientRecommendations(selectedClient.email).recipes.length === 0 && (
                    <p className="text-center py-8 text-gray-400">אין מתכונים רלוונטיים</p>
                  )}
                </TabsContent>

                <TabsContent value="music" className="space-y-2">
                  {getClientRecommendations(selectedClient.email).music.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleContent(m, "music")}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedContent.find(c => c.id === m.id)
                          ? "border-[#B8A393] bg-amber-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {m.image_url && (
                          <img src={m.image_url} className="w-12 h-12 rounded-lg object-cover"/>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold">{m.title}</h4>
                          <p className="text-sm text-gray-500">{m.category}</p>
                        </div>
                        {selectedContent.find(c => c.id === m.id) && (
                          <Badge className="bg-green-500">נבחר</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {getClientRecommendations(selectedClient.email).music.length === 0 && (
                    <p className="text-center py-8 text-gray-400">אין מוזיקה רלוונטית</p>
                  )}
                </TabsContent>
              </Tabs>

              {/* Personal Message */}
              <div>
                <Label>הודעה אישית (אופציונלי)</Label>
                <Textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="הוסף הודעה אישית למטופל..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Selected Count */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-medium">נבחרו {selectedContent.length} תכנים לשליחה</p>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendRecommendations}
                disabled={selectedContent.length === 0}
                className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]"
              >
                <Send size={16} className="ml-2"/> שלח המלצות למטופל
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}