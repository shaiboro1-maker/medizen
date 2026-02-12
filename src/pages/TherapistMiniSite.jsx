import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Link as LinkIcon, Save, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPageUrl } from "../utils";

export default function TherapistMiniSite() {
  const [therapist, setTherapist] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    logo_url: "",
    cover_image: "",
    gallery: [],
    video_intro_url: "",
    bio: "",
    unique_slug: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const therapists = await base44.entities.Therapist.filter({ user_email: currentUser.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        setForm({
          logo_url: therapists[0].logo_url || "",
          cover_image: therapists[0].cover_image || "",
          gallery: therapists[0].gallery || [],
          video_intro_url: therapists[0].video_intro_url || "",
          bio: therapists[0].bio || "",
          unique_slug: therapists[0].unique_slug || "",
        });
      }
    };
    init();
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      let updates = { ...data };
      
      if (logoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: logoFile });
        updates.logo_url = file_url;
      }
      
      if (coverFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        updates.cover_image = file_url;
      }
      
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => base44.integrations.Core.UploadFile({ file }));
        const results = await Promise.all(uploadPromises);
        updates.gallery = [...(form.gallery || []), ...results.map(r => r.file_url)];
      }

      return base44.entities.Therapist.update(therapist.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist"] });
      setLogoFile(null);
      setCoverFile(null);
      setGalleryFiles([]);
      alert("המיני-סייט עודכן בהצלחה!");
    },
  });

  const miniSiteUrl = `${window.location.origin}${createPageUrl(`MiniSite?slug=${form.unique_slug}`)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(miniSiteUrl);
    alert("הקישור הועתק ללוח!");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">המיני-סייט שלי</h1>
      <p className="text-gray-500 mb-8">עצב את הדף האישי שלך ושלח אותו למטופלים</p>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="space-y-2">
            <Label>קישור ייחודי למיני-סייט שלך</Label>
            <div className="flex gap-2">
              <Input
                value={form.unique_slug}
                onChange={e => setForm({...form, unique_slug: e.target.value.toLowerCase().replace(/\s/g, "-")})}
                placeholder="therapist-name"
              />
              <Button onClick={copyLink} variant="outline" disabled={!form.unique_slug}>
                <Copy size={16} className="ml-2"/> העתק
              </Button>
            </div>
            {form.unique_slug && (
              <p className="text-xs text-gray-400 break-all">{miniSiteUrl}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>לוגו</Label>
            <div className="flex items-center gap-4">
              {form.logo_url && <img src={form.logo_url} alt="logo" className="w-16 h-16 object-cover rounded-xl"/>}
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label>תמונת כיסוי</Label>
            <div className="flex items-center gap-4">
              {form.cover_image && <img src={form.cover_image} alt="cover" className="w-32 h-20 object-cover rounded-xl"/>}
              <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label>גלריית תמונות</Label>
            <input type="file" accept="image/*" multiple onChange={e => setGalleryFiles(Array.from(e.target.files))}/>
            {form.gallery?.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {form.gallery.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-xl"/>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>סרטון היכרות (URL)</Label>
            <Input value={form.video_intro_url} onChange={e => setForm({...form, video_intro_url: e.target.value})} placeholder="https://youtube.com/..."/>
          </div>

          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="h-32"/>
          </div>

          <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700">
            <Save size={16} className="ml-2"/> {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
          </Button>

          {form.unique_slug && (
            <Button onClick={() => window.open(miniSiteUrl, "_blank")} variant="outline" className="w-full">
              <Eye size={16} className="ml-2"/> תצוגה מקדימה
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}