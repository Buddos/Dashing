import { useLocation } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CONTENTS: Record<string, { title: string, description: string, sections: { q: string, a: string }[] }> = {
  faq: {
    title: "Frequently Asked Questions",
    description: "Everything you need to know about our products and services.",
    sections: [
      { q: "How long does shipping take?", a: "Shipping typically takes 3-5 business days for domestic orders and 7-14 days for international orders." },
      { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee on all unused products in their original packaging." },
      { q: "Are your products eco-friendly?", a: "Yes, we prioritize sustainable sourcing and environmentally friendly materials across our entire collection." },
      { q: "How can I track my order?", a: "Once your order is shipped, you will receive a tracking number via email." },
    ]
  },
  shipping: {
    title: "Shipping Information",
    description: "Fast and reliable delivery to your doorstep.",
    sections: [
      { q: "Shipping Rates", a: "We offer free shipping on all orders over KES 100. For orders under KES 100, a flat rate of KES 10 applies." },
      { q: "Delivery Times", a: "Orders are processed within 24 hours. Domestic delivery takes 2-4 days, while international takes 7-14 days." },
      { q: "International Shipping", a: "We ship to over 50 countries worldwide. Customs duties and taxes may apply depending on your location." },
    ]
  },
  returns: {
    title: "Returns & Exchanges",
    description: "Hassle-free returns for your peace of mind.",
    sections: [
      { q: "Return Period", a: "You have 30 days from the date of purchase to return your items." },
      { q: "How to Return", a: "Contact our support team to receive a return label. Pack your items securely and drop them off at any authorized location." },
      { q: "Refunds", a: "Refunds are processed within 5-7 business days of receiving your returned items." },
    ]
  },
  help: {
    title: "Help Center",
    description: "Need assistance? We're here to help.",
    sections: [
      { q: "Contacting Support", a: "You can reach us via our Contact Us page, email at support@dashing.com, or call us at +254 (705) 123-736." },
      { q: "Account Issues", a: "If you're having trouble logging in, try resetting your password or contact our technical team." },
    ]
  }
};

const Support = () => {
  const location = useLocation();
  const path = location.pathname.split("/").pop() || "help";
  const content = CONTENTS[path] || CONTENTS.help;

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
            {content.title}
          </h1>
          <p className="font-body text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {content.sections.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="font-body font-semibold text-lg text-left hover:text-primary transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Support;
