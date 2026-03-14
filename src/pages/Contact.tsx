import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/.netlify/functions/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      console.error("Contact error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="font-body text-lg text-primary-foreground/90 max-w-2xl">
            Have questions or feedback? We'd love to hear from you. Reach out to
            our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            <Card className="p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground">dustindashing2@gmail.com</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-lg mb-2">Phone</h3>
                  <p className="text-muted-foreground">+254 (705) 123-736</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Mon-Fri, 9AM-6PM EST
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-lg mb-2">
                    Address
                  </h3>
                  <p className="text-muted-foreground">
                    123 Fashion
                  </p>
                  <p className="text-muted-foreground">Nakuru, Kenya</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="max-w-2xl mx-auto p-8 md:p-12">
            <h2 className="font-display text-3xl font-bold mb-2">Send us a Message</h2>
            <p className="text-muted-foreground mb-8">
              Fill out the form below and we'll get back to you shortly.
            </p>

            {submitted && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
                <p className="font-semibold">Thank you for reaching out!</p>
                <p className="text-sm">We'll be in touch soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block font-body text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="font-body"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-body text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="font-body"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block font-body text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                  className="font-body"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-body text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  className="font-body resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-body font-semibold"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
