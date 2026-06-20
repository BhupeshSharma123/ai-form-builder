"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useScroll, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Layout,
  BarChart3,
  Shield,
  Globe,
  Wand2,
  FileText,
  Users,
  Star,
  ChevronRight,
  Play,
  Check,
  Menu,
  X,
  ChevronDown,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  Save,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Animated gradient background
function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 blur-[120px] animate-blob" />
      <div className="absolute -top-[20%] -right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-cyan-600/20 to-blue-600/20 blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-pink-600/20 to-rose-600/20 blur-[120px] animate-blob animation-delay-4000" />
    </div>
  );
}

// Marquee component
function Marquee({ children, reverse = false, speed = 30 }: { children: React.ReactNode; reverse?: boolean; speed?: number }) {
  return (
    <div className="relative flex overflow-hidden py-4">
      <div className={`flex gap-8 whitespace-nowrap ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`} style={{ animationDuration: `${speed}s` }}>
        {children}
        {children}
      </div>
    </div>
  );
}

// Mouse following gradient
function MouseGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
      style={{
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
      }}
    />
  );
}

// Floating card with tilt effect
function FloatingCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.4 }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group ${className}`}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
      {children}
    </motion.div>
  );
}

// Accordion component
function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="border-b border-white/10 pb-4"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-lg md:text-xl font-medium">{item.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="h-6 w-6 flex-shrink-0" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="pt-4 text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// Gallery grid
function GalleryGrid() {
  const images = [
    { src: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80", alt: "Form Builder 1" },
    { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", alt: "Analytics Dashboard" },
    { src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80", alt: "Team Collaboration" },
    { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80", alt: "Form Preview" },
    { src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80", alt: "Data Analysis" },
    { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", alt: "Team Meeting" },
    { src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80", alt: "Form Creation" },
    { src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80", alt: "Dashboard View" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="relative group overflow-hidden rounded-2xl aspect-square"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-medium text-sm">{image.alt}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Animated counter
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev >= value) {
          clearInterval(timer);
          return value;
        }
        return prev + Math.ceil(value / 50);
      });
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{Math.min(count, value)}{suffix}</span>;
}

// Inline SVG icons for artistic text
function BlinkingEye() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="inline-block mx-1 align-middle">
      <circle cx="24" cy="24" r="20" fill="white"/>
      <circle cx="24" cy="24" r="12" fill="black">
        <animate attributeName="r" values="12;4;12" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

function LightningBolt() {
  return (
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none" className="inline-block mx-1 align-middle">
      <path d="M20 0L0 28H16L12 48L36 18H20L24 0H20Z" fill="yellow"/>
    </svg>
  );
}

function SmileyFace() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="inline-block mx-1 align-middle">
      <circle cx="20" cy="20" r="18" fill="#FFD700"/>
      <circle cx="14" cy="16" r="3" fill="black"/>
      <circle cx="26" cy="16" r="3" fill="black"/>
      <path d="M12 24C12 24 16 30 20 30C24 30 28 24 28 24" stroke="black" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" className="inline-block mx-1 align-middle">
      <rect x="2" y="2" width="44" height="30" rx="4" fill="white" stroke="black" strokeWidth="3"/>
      <rect x="18" y="34" width="12" height="4" fill="black"/>
      <rect x="14" y="38" width="20" height="2" rx="1" fill="black"/>
    </svg>
  );
}

// Manual Form Builder Section
function ManualFormBuilder() {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState([
    { id: "1", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
    { id: "2", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
    { id: "3", type: "textarea", label: "Message", placeholder: "Your message...", required: false },
  ]);
  const [showAddField, setShowAddField] = useState(false);

  const addField = (type: string) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      placeholder: "",
      required: false,
    };
    setFields([...fields, newField]);
    setShowAddField(false);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<typeof fields[0]>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const fieldTypes = [
    { type: "text", label: "Text" },
    { type: "email", label: "Email" },
    { type: "phone", label: "Phone" },
    { type: "number", label: "Number" },
    { type: "textarea", label: "Text Area" },
    { type: "select", label: "Dropdown" },
    { type: "checkbox", label: "Checkbox" },
    { type: "date", label: "Date" },
    { type: "file", label: "File Upload" },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Build Manually
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prefer hands-on? Create your form field by field with full control
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Builder Panel */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6">
              {/* Form Title & Description */}
              <div className="space-y-4">
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 p-0 h-auto"
                  placeholder="Form Title"
                />
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="bg-transparent border-none text-white/70 placeholder:text-white/30 resize-none focus-visible:ring-0 min-h-[60px]"
                  rows={2}
                />
              </div>

              <div className="h-px bg-white/10" />

              {/* Fields */}
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-white/30 cursor-grab" />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="bg-transparent border-none text-white font-medium p-0 h-auto focus-visible:ring-0"
                        placeholder="Field label"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-xs text-pink-500">required</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-white/50 hover:text-red-400" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Add Field */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5"
                  onClick={() => setShowAddField(!showAddField)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>

                <AnimatePresence>
                  {showAddField && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full mb-2 left-0 right-0 p-4 rounded-xl bg-gray-900 border border-white/10 shadow-xl"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {fieldTypes.map((ft) => (
                          <Button
                            key={ft.type}
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => addField(ft.type)}
                          >
                            {ft.label}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href="/dashboard/create/edit" className="flex-1">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl border-white/20 text-white hover:bg-white/10">
                    <Save className="h-4 w-4 mr-2" />
                    Save & Edit
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-3xl border border-white/10 bg-white backdrop-blur-xl p-8 text-black">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold">{formTitle}</h3>
                {formDescription && (
                  <p className="text-gray-500 mt-2">{formDescription}</p>
                )}
              </div>

              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea placeholder={field.placeholder} className="rounded-xl" />
                    ) : field.type === "select" ? (
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="rounded-xl"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button className="w-full mt-8 rounded-xl bg-black text-white hover:bg-gray-800">
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqItems = [
    {
      question: "How do I create a form?",
      answer: "Simply describe the form you want in plain English, and our AI will generate a complete form structure. You can then customize it using our drag-and-drop builder or build it manually field by field."
    },
    {
      question: "What field types are supported?",
      answer: "We support 25+ field types including text, email, phone, number, date, dropdown, checkbox, radio, file upload, signature, rating, slider, and more. Each field can be customized with validation rules and conditional logic."
    },
    {
      question: "Can I customize the form design?",
      answer: "Yes! You can customize colors, fonts, spacing, and layout. We also provide pre-built themes and the ability to add custom CSS for advanced styling."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes, our free plan includes 5 AI form generations, unlimited forms, 100 responses per month, and basic analytics. You can upgrade anytime for more features."
    },
    {
      question: "How do I share my forms?",
      answer: "Each form gets a unique URL you can share. You can also embed forms on your website using our embed code, or share via QR code."
    },
    {
      question: "Can I export form responses?",
      answer: "Yes, you can export responses as CSV, Excel, or JSON. We also integrate with popular tools like Google Sheets, Notion, and Zapier."
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-violet-500" />
              <span className="text-xl font-bold">FormAI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Pricing", "FAQ"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-sm font-medium text-white/60 hover:text-white transition-colors group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-xl text-white/80 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <AnimatedGradient />
        <MouseGradient />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-white/80">Powered by AI</span>
          </motion.div>

          {/* Main heading - Raw House style with inline icons */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.3 }}
            className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight mb-6 leading-[0.95]"
          >
            <span className="block">The ultimate</span>
            <span className="block mt-2">
              form <BlinkingEye /> builder
            </span>
            <span className="block mt-2">
              for content creation <LightningBolt />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Simply describe the form you need in plain English, and our AI will
            generate a beautiful, functional form in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-base px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-xl shadow-violet-500/25 h-14">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="#manual-builder">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-base px-8 rounded-2xl border-white/20 text-white hover:bg-white/10 h-14">
                  <Layout className="mr-2 h-5 w-5" />
                  Build Manually
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Marquee */}
      <section className="py-8 border-y border-white/10 overflow-hidden">
        <Marquee speed={25}>
          {["AI-Powered", "Drag & Drop", "25+ Field Types", "Real-time Preview", "Mobile Responsive", "Analytics", "Templates", "PDF Export"].map((feature) => (
            <div key={feature} className="flex items-center gap-3 px-6 py-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="text-lg font-medium text-white/60">{feature}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Gallery Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Built for <SmileyFace /> creators
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Beautiful forms that your audience will love
            </p>
          </motion.div>

          <GalleryGrid />
        </div>
      </section>

      {/* Manual Form Builder */}
      <div id="manual-builder">
        <ManualFormBuilder />
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Powerful features to create, manage, and analyze your forms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI-Powered Generation", description: "Describe your form in plain English and watch AI build it instantly." },
              { icon: Layout, title: "Drag & Drop Builder", description: "Fine-tune your forms with an intuitive visual editor." },
              { icon: Zap, title: "Lightning Fast", description: "Create professional forms in seconds, not hours." },
              { icon: BarChart3, title: "Analytics Dashboard", description: "Track responses and gain insights with built-in analytics." },
              { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security for your form data." },
              { icon: Globe, title: "Share Anywhere", description: "Embed forms on your site or share via unique links." },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <Accordion items={faqItems} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-pink-600/10" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Let's Talk
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Ready to build amazing forms? Start for free today.
          </p>
          <Link href="/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-base px-10 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/25 h-14">
                Contact us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-violet-500" />
                <span className="text-xl font-bold">FormAI</span>
              </Link>
              <p className="text-sm text-white/60">
                Build beautiful forms in seconds with AI
              </p>
            </div>
            <div className="flex gap-8">
              {["Features", "Pricing", "About", "Contact"].map((link) => (
                <Link key={link} href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              © 2026 FormAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
