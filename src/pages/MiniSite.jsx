import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, MapPin, Phone, Globe, Calendar, MessageCircle, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import AppDownload from "../components/AppDownload";

export default function MiniSite() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const { data: therapist, isLoading } = useQuery({
    queryKey: ["miniSiteTherapist", slug],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ unique_slug: slug });
      return therapists[0];
    },
    enabled: !!slug,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["miniSiteServices", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["miniSiteCourses", therapist?.id],
    queryFn: () => base44.entities.Course.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["miniSiteReviews", therapist?.id],
    queryFn: () => base44.entities.Review.filter({ therapist_id: therapist.id }, "-created_date", 10),
    enabled: !!therapist,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["miniSiteBlog", therapist?.id],
    queryFn: () => base44.entities.BlogPost.filter({ therapist_id: therapist.id, is_published: true }, "-created_date", 10),
    enabled: !!therapist,
  });

  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "", custom_fields: {} });

  const openWhatsApp = () => {
    const phone = therapist.phone?.replace(/\D/g, "");
    const message = encodeURIComponent(`שלום ${therapist.full_name}, אני מעוניין לקבוע תור`);
    window.open(`https://wa.me/972${phone}?text=${message}`, "_blank");
  };

  const submitContactForm = useMutation({
    mutationFn: () => base44.entities.ContactFormSubmission.create({
      therapist_id: therapist.id,
      ...contactForm,
    }),
    onSuccess: () => {
      setContactForm({ name: "", email: "", phone: "", message: "", custom_fields: {} });
      alert("ההודעה נשלחה בהצלחה!");
    },
  });

  if (isLoading) return <div className="text-center py-20">טוען...</div>;
  if (!therapist) return <div className="text-center py-20">מטפל לא נמצא</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover */}
      <div className="relative h-80 bg-gradient-to-bl from-teal-600 to-emerald-500 overflow-hidden">
        {therapist.cover_image && (
          <img src={therapist.cover_image} alt="" className="w-full h-full object-cover opacity-40"/>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {therapist.logo_url && (
              <img src={therapist.logo_url} alt="logo" className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/90 p-2"/>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{therapist.full_name}</h1>
            <p className="text-xl text-teal-50">{therapist.specializations?.join(" · ")}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Star size={20} className="text-amber-300 fill-amber-300"/>
              <span className="text-lg font-semibold">{therapist.rating?.toFixed(1) || "חדש"}</span>
              <span className="text-teal-100">({therapist.review_count || 0} ביקורות)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        {/* Video Intro */}
        {therapist.video_intro_url && (
          <div className="mb-8">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe src={therapist.video_intro_url} className="w-full h-full" allowFullScreen/>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <Link to={createPageUrl(`BookAppointment?therapist=${therapist.id}`)}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 py-6 text-lg">
                <Calendar size={20} className="ml-2"/> קבע תור עכשיו
              </Button>
            </Link>
            {therapist.phone && (
              <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                <MessageCircle size={20} className="ml-2"/> שוחח בוואטסאפ
              </Button>
            )}
          </div>
        </div>

        {/* Bio */}
        {therapist.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">אודות</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{therapist.bio}</p>
            <div className="flex gap-4 mt-6 text-gray-500">
              {therapist.city && <span className="flex items-center gap-1"><MapPin size={16}/> {therapist.city}</span>}
              {therapist.phone && <a href={`tel:${therapist.phone}`} className="flex items-center gap-1 text-teal-600"><Phone size={16}/> {therapist.phone}</a>}
              {therapist.website && <a href={therapist.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600"><Globe size={16}/> אתר</a>}
            </div>
          </div>
        )}

        {/* Gallery */}
        {therapist.gallery?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">גלריה</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {therapist.gallery.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full h-48 object-cover rounded-xl"/>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">השירותים שלי</h2>
          <div className="space-y-4">
            {services.map(s => (
              <div key={s.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-gray-50 rounded-xl gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.description}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.duration_minutes} דקות</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-teal-700">₪{s.price}</p>
                  <Link to={createPageUrl(`BookAppointment?therapist=${therapist.id}&service=${s.id}`)}>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap">
                      <Calendar size={14} className="ml-1"/> קבע תור
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses */}
        {courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">קורסים דיגיטליים</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map(c => (
                <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="h-40 bg-gradient-to-bl from-purple-50 to-blue-50">
                    {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover"/>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-2">{c.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{c.lessons?.length} שיעורים · {c.total_duration_minutes} דק׳</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-teal-700">₪{c.price}</span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">רכישה</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts */}
        {blogPosts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              <FileText size={24} className="inline ml-2"/>
              המאמרים שלי
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {blogPosts.map(post => (
                <div key={post.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  {post.image_url && (
                    <div className="h-40 bg-gradient-to-bl from-teal-50 to-blue-50">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover"/>
                    </div>
                  )}
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2 bg-teal-50 text-teal-700">{post.category || "כללי"}</Badge>
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.excerpt}</p>
                    <Button size="sm" variant="outline">קרא עוד</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">ביקורות ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                      {r.client_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{r.client_name || "אנונימי"}</p>
                      <div className="flex gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}/>
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.text && <p className="text-gray-600 text-sm">{r.text}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            <Mail size={24} className="inline ml-2"/>
            צור קשר
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">שם מלא</label>
              <Input value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} placeholder="שמך המלא"/>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">אימייל</label>
              <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="email@example.com"/>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">טלפון (אופציונלי)</label>
              <Input value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} placeholder="05X-XXXXXXX"/>
            </div>
            {therapist.contact_form_fields?.map((field) => (
              <div key={field.id}>
                <label className="text-sm font-medium mb-1 block">
                  {field.label} {field.required && <span className="text-red-600">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={contactForm.custom_fields[field.id] || ""}
                    onChange={(e) => setContactForm({...contactForm, custom_fields: {...contactForm.custom_fields, [field.id]: e.target.value}})}
                    className="h-24"
                  />
                ) : (
                  <Input
                    type={field.type}
                    value={contactForm.custom_fields[field.id] || ""}
                    onChange={(e) => setContactForm({...contactForm, custom_fields: {...contactForm.custom_fields, [field.id]: e.target.value}})}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="text-sm font-medium mb-1 block">הודעה</label>
              <Textarea value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} placeholder="איך אוכל לעזור לך?" className="h-32"/>
            </div>
            <Button onClick={() => submitContactForm.mutate()} disabled={submitContactForm.isPending || !contactForm.name || !contactForm.email || !contactForm.message} className="w-full bg-teal-600 hover:bg-teal-700">
              <Mail size={16} className="ml-2"/> {submitContactForm.isPending ? "שולח..." : "שלח הודעה"}
            </Button>
          </div>
        </div>

        {/* App Download CTA */}
        <div className="mb-8">
          <AppDownload variant="compact"/>
        </div>
      </div>
    </div>
  );
}