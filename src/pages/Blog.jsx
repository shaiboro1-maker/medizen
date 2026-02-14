import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Upload, Eye, Heart, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, "-created_date"),
  });

  const filtered = posts.filter(p => 
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.origin + "/blog/" + post.id
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <h1 className="text-xl font-bold">בלוג לחיים בריאים</h1>
        </div>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש מאמרים..."
            className="pr-10"
          />
        </div>
      </div>

      <div className="p-4">
        <Button 
          onClick={() => navigate("/submit-content?type=blog")}
          className="w-full mb-4 bg-teal-600 hover:bg-teal-700"
        >
          <Upload size={16} className="ml-2"/> שתף מאמר משלך
        </Button>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">טוען...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">אין מאמרים</div>
          ) : (
            filtered.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover"/>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye size={14} className="ml-1"/> קרא עוד
                    </Button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Heart size={14}/>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleShare(post)}>
                        <Share2 size={14}/>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost.title}</DialogTitle>
            </DialogHeader>
            {selectedPost.image_url && (
              <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full rounded-lg"/>
            )}
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost.content }}/>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}