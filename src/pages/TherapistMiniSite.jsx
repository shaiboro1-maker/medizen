import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Link as LinkIcon, Save, Eye, Copy, Plus, Trash2, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "../utils";
import ReactQuill from "react-quill";

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
    contact_form_fields: [],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", excerpt: "", category: "", image_url: "" });
  const [newField, setNewField] = useState({ label: "", type: "text", required: false, options: [] });
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
          contact_form_fields: therapists[0].contact_form_fields || [],
        });
        const posts = await base44.entities.BlogPost.filter({ therapist_id: therapists[0].id }, "-created_date");
        setBlogPosts(posts);
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

  const createOrUpdatePost = useMutation({
    mutationFn: async (postData) => {
      if (editingPost) {
        return base44.entities.BlogPost.update(editingPost.id, postData);
      }
      return base44.entities.BlogPost.create({ ...postData, therapist_id: therapist.id });
    },
    onSuccess: async () => {
      const posts = await base44.entities.BlogPost.filter({ therapist_id: therapist.id }, "-created_date");
      setBlogPosts(posts);
      setNewPost({ title: "", content: "", excerpt: "", category: "", image_url: "" });
      setEditingPost(null);
      alert("הפוסט נשמר בהצלחה!");
    },
  });

  const deletePost = useMutation({
    mutationFn: (postId) => base44.entities.BlogPost.delete(postId),
    onSuccess: async () => {
      const posts = await base44.entities.BlogPost.filter({ therapist_id: therapist.id }, "-created_date");
      setBlogPosts(posts);
      alert("הפוסט נמחק!");
    },
  });

  const addCustomField = () => {
    if (!newField.label) return;
    setForm({
      ...form,
      contact_form_fields: [...(form.contact_form_fields || []), { ...newField, id: Date.now().toString() }]
    });
    setNewField({ label: "", type: "text", required: false, options: [] });
  };

  const removeCustomField = (fieldId) => {
    setForm({
      ...form,
      contact_form_fields: form.contact_form_fields.filter(f => f.id !== fieldId)
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">המיני-סייט שלי</h1>
      <p className="text-gray-500 mb-8">עצב את הדף האישי שלך ושלח אותו למטופלים</p>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="design">עיצוב ותוכן</TabsTrigger>
          <TabsTrigger value="blog">בלוג ומאמרים</TabsTrigger>
          <TabsTrigger value="contact">טופס יצירת קשר</TabsTrigger>
        </TabsList>

        <TabsContent value="design">
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
        </TabsContent>

        <TabsContent value="blog">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">{editingPost ? "ערוך פוסט" : "פוסט חדש"}</h3>
              <div className="space-y-4">
                <Input
                  value={editingPost ? editingPost.title : newPost.title}
                  onChange={(e) => editingPost ? setEditingPost({...editingPost, title: e.target.value}) : setNewPost({...newPost, title: e.target.value})}
                  placeholder="כותרת הפוסט"
                />
                <Textarea
                  value={editingPost ? editingPost.excerpt : newPost.excerpt}
                  onChange={(e) => editingPost ? setEditingPost({...editingPost, excerpt: e.target.value}) : setNewPost({...newPost, excerpt: e.target.value})}
                  placeholder="תקציר קצר (יוצג בתצוגת רשימה)"
                  className="h-20"
                />
                <div className="border rounded-lg">
                  <ReactQuill
                    value={editingPost ? editingPost.content : newPost.content}
                    onChange={(val) => editingPost ? setEditingPost({...editingPost, content: val}) : setNewPost({...newPost, content: val})}
                    placeholder="תוכן המאמר..."
                    className="min-h-[200px]"
                  />
                </div>
                <Input
                  value={editingPost ? editingPost.image_url : newPost.image_url}
                  onChange={(e) => editingPost ? setEditingPost({...editingPost, image_url: e.target.value}) : setNewPost({...newPost, image_url: e.target.value})}
                  placeholder="קישור לתמונת נושא"
                />
                <Input
                  value={editingPost ? editingPost.category : newPost.category}
                  onChange={(e) => editingPost ? setEditingPost({...editingPost, category: e.target.value}) : setNewPost({...newPost, category: e.target.value})}
                  placeholder="קטגוריה (למשל: תזונה, פיזיותרפיה, רפואה משלימה)"
                />
                <div className="flex gap-2">
                  <Button onClick={() => createOrUpdatePost.mutate(editingPost || newPost)} disabled={createOrUpdatePost.isPending} className="bg-teal-600 hover:bg-teal-700">
                    <Save size={16} className="ml-2"/> {createOrUpdatePost.isPending ? "שומר..." : editingPost ? "עדכן פוסט" : "פרסם פוסט"}
                  </Button>
                  {editingPost && (
                    <Button onClick={() => { setEditingPost(null); setNewPost({ title: "", content: "", excerpt: "", category: "", image_url: "" }); }} variant="outline">
                      ביטול
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">הפוסטים שלי</h3>
              <div className="mb-4 flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={!newPost.category ? "default" : "outline"}
                  onClick={() => setNewPost({...newPost, category: ""})}
                >
                  הכל ({blogPosts.length})
                </Button>
                {[...new Set(blogPosts.map(p => p.category).filter(Boolean))].map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={newPost.category === cat ? "default" : "outline"}
                    onClick={() => setNewPost({...newPost, category: cat})}
                  >
                    {cat} ({blogPosts.filter(p => p.category === cat).length})
                  </Button>
                ))}
              </div>
              <div className="space-y-3">
                {blogPosts
                  .filter(post => !newPost.category || post.category === newPost.category)
                  .map(post => (
                  <div key={post.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-bold">{post.title}</h4>
                      <p className="text-sm text-gray-500">{post.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingPost(post)}>
                        <Edit size={14}/>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePost.mutate(post.id)}>
                        <Trash2 size={14}/>
                      </Button>
                    </div>
                  </div>
                ))}
                {blogPosts.length === 0 && (
                  <p className="text-center text-gray-400 py-8">עדיין לא כתבת פוסטים</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">הוסף שדה חדש לטופס</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={newField.label}
                  onChange={(e) => setNewField({...newField, label: e.target.value})}
                  placeholder="כותרת השדה (למשל: 'תיאור הבעיה')"
                />
                <Select value={newField.type} onValueChange={(val) => setNewField({...newField, type: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="סוג השדה"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">טקסט קצר</SelectItem>
                    <SelectItem value="textarea">טקסט ארוך</SelectItem>
                    <SelectItem value="email">אימייל</SelectItem>
                    <SelectItem value="phone">טלפון</SelectItem>
                    <SelectItem value="select">בחירה מרשימה</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" checked={newField.required} onChange={(e) => setNewField({...newField, required: e.target.checked})}/>
                  <span className="text-sm">שדה חובה</span>
                </label>
                <Button onClick={addCustomField} className="col-span-2 bg-teal-600 hover:bg-teal-700">
                  <Plus size={16} className="ml-2"/> הוסף שדה
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">שדות הטופס הנוכחיים</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium">שם מלא (ברירת מחדל)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium">אימייל (ברירת מחדל)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium">הודעה (ברירת מחדל)</span>
                </div>
                {form.contact_form_fields?.map((field) => (
                  <div key={field.id} className="p-3 bg-teal-50 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-medium">{field.label}</span>
                      <span className="text-xs text-gray-500 mr-2">({field.type})</span>
                      {field.required && <span className="text-xs text-red-600 mr-2">*חובה</span>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeCustomField(field.id)}>
                      <Trash2 size={14}/>
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
                <Save size={16} className="ml-2"/> שמור שינויים
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}