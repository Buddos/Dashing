import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  slug: string;
}

const Blog = () => {
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "Spring Fashion Trends 2026",
      excerpt:
        "Discover the hottest fashion trends for spring 2026. From bold colors to sustainable materials, we break down what's in and what's out.",
      content: "This is the full content of the blog post...",
      author: "Sarah Johnson",
      date: "March 10, 2026",
      category: "Fashion",
      image: "/api/placeholder/400/250",
      slug: "spring-fashion-trends-2026",
    },
    {
      id: "2",
      title: "How to Style Accessories Like a Pro",
      excerpt:
        "Learn the art of accessorizing. We share expert tips on how to elevate any outfit with the right accessories.",
      content: "This is the full content of the blog post...",
      author: "Emma Davis",
      date: "March 8, 2026",
      category: "Style Guide",
      image: "/api/placeholder/400/250",
      slug: "style-accessories-like-pro",
    },
    {
      id: "3",
      title: "Sustainable Fashion: Looking Good Responsibly",
      excerpt:
        "Explore how to shop sustainably without compromising on style. Learn about eco-friendly brands and practices.",
      content: "This is the full content of the blog post...",
      author: "Michael Chen",
      date: "March 5, 2026",
      category: "Sustainability",
      image: "/api/placeholder/400/250",
      slug: "sustainable-fashion-guide",
    },
    {
      id: "4",
      title: "Building Your Capsule Wardrobe",
      excerpt:
        "Create a versatile, timeless wardrobe with our guide to building the perfect capsule collection.",
      content: "This is the full content of the blog post...",
      author: "Jessica Martinez",
      date: "March 1, 2026",
      category: "Fashion",
      image: "/api/placeholder/400/250",
      slug: "capsule-wardrobe-guide",
    },
    {
      id: "5",
      title: "Color Psychology in Fashion",
      excerpt:
        "Understanding color psychology can help you express yourself better through fashion. Learn which colors suit your personality.",
      content: "This is the full content of the blog post...",
      author: "David Wilson",
      date: "February 26, 2026",
      category: "Style Guide",
      image: "/api/placeholder/400/250",
      slug: "color-psychology-fashion",
    },
    {
      id: "6",
      title: "Interview: 5 Questions with Designer Anna Lee",
      excerpt:
        "We sat down with renowned designer Anna Lee to discuss inspiration, design philosophy, and upcoming collections.",
      content: "This is the full content of the blog post...",
      author: "Tom Brown",
      date: "February 22, 2026",
      category: "Interview",
      image: "/api/placeholder/400/250",
      slug: "interview-designer-anna-lee",
    },
  ];

  const categories = ["All", "Fashion", "Style Guide", "Sustainability", "Interview"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Blog
          </h1>
          <p className="font-body text-lg text-primary-foreground/90 max-w-2xl">
            Fashion tips, style guides, and industry insights to inspire your
            personal style journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`font-body text-sm font-medium px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground font-body text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display text-xl font-bold mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="space-y-3 mb-4 border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <User size={14} />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <Calendar size={14} />
                      {post.date}
                    </div>
                  </div>

                  {/* Read More Button */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-body text-sm font-medium transition-colors"
                  >
                    Read More
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body text-lg">
                No posts found in this category.
              </p>
            </div>
          )}

          {/* Newsletter CTA */}
          <Card className="bg-primary text-primary-foreground p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-primary-foreground/90 font-body mb-6 max-w-2xl mx-auto">
              Get the latest fashion tips, style guides, and exclusive content
              delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-accent font-body"
              />
              <Button className="bg-accent text-accent-foreground hover:opacity-90 font-body font-semibold">
                Subscribe
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Blog;
