import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string | null;
  read_time: string | null;
  created_at: string;
}

const defaultPost: BlogPost = {
  id: "1",
  title: "10 Web Design Trends to Watch in 2025",
  slug: "web-design-trends-2025",
  excerpt: "Discover the latest design trends that are shaping the future of web development and user experience.",
  content: `
## The Future of Web Design

Web design is constantly evolving, and 2025 promises to bring some exciting new trends that will shape how we build and interact with websites.

### 1. AI-Powered Personalization
Websites will increasingly use AI to personalize user experiences in real-time, adapting content, layout, and recommendations based on user behavior.

### 2. Immersive 3D Elements
With WebGL and Three.js becoming more accessible, expect to see more websites incorporating stunning 3D graphics and interactive elements.

### 3. Dark Mode by Default
More websites are adopting dark mode as the default, reducing eye strain and battery consumption while creating a modern aesthetic.

### 4. Micro-Interactions
Subtle animations and feedback mechanisms will continue to enhance user experience, making interfaces feel more responsive and alive.

### 5. Sustainable Web Design
As environmental consciousness grows, designers are focusing on creating lighter, faster websites that consume less energy.

## Conclusion

Staying ahead of these trends will help you create websites that not only look great but also provide exceptional user experiences.
  `,
  category: "Design",
  image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop&q=80",
  read_time: "5 min read",
  created_at: "2024-12-10",
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!error && data) {
        setPost(data);
      } else {
        // Use default post for demo
        setPost(defaultPost);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post?.title || "")}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/#blog">
            <Button>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img
            src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80"}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            {/* Back Link */}
            <Link 
              to="/#blog" 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Link>

            {/* Category Badge */}
            <span className="inline-block px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-full mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.created_at)}
              </span>
              {post.read_time && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time}
                </span>
              )}
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />').replace(/## /g, '<h2 class="text-2xl font-bold mt-8 mb-4">').replace(/### /g, '<h3 class="text-xl font-semibold mt-6 mb-3">') }}
            />

            {/* Share Section */}
            <div className="flex items-center gap-4 pt-8 border-t border-border">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Share2 className="w-4 h-4" />
                Share this article:
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={shareOnTwitter}>
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareOnLinkedIn}>
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareOnFacebook}>
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostPage;