"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  FileText,
  ArrowRight,
  Wand2,
  Upload,
  File,
  X,
  Check,
  Users,
  MessageSquare,
  Mail,
  Calendar,
  GraduationCap,
  Hotel,
  Download,
  Eye,
  Plus,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const templates = [
  { id: "employee-onboarding", title: "Employee Onboarding", description: "New hire paperwork and setup", icon: Users, prompt: "Create an employee onboarding form with personal information, emergency contacts, tax details, laptop request, and NDA agreement.", fields: 12, category: "HR" },
  { id: "customer-feedback", title: "Customer Feedback", description: "Collect customer insights", icon: MessageSquare, prompt: "Create a customer feedback survey with satisfaction ratings, product quality assessment, service experience, and improvement suggestions.", fields: 10, category: "Survey" },
  { id: "hotel-booking", title: "Hotel Booking", description: "Reservation management", icon: Hotel, prompt: "Build a hotel booking form with guest details, check-in/check-out dates, room preferences, special requests, and payment information.", fields: 15, category: "Booking" },
  { id: "event-registration", title: "Event Registration", description: "Attendee sign-ups", icon: Calendar, prompt: "Create an event registration form with attendee information, session selection, dietary preferences, and accessibility requirements.", fields: 11, category: "Events" },
  { id: "job-application", title: "Job Application", description: "Candidate applications", icon: GraduationCap, prompt: "Build a job application form with personal details, education history, work experience, skills, resume upload, and cover letter.", fields: 18, category: "HR" },
  { id: "contact-us", title: "Contact Form", description: "General inquiries", icon: Mail, prompt: "Create a contact us form with name, email, phone, subject dropdown, message textarea, and preferred contact method.", fields: 6, category: "General" },
];

export default function CreateFormPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ai" | "template" | "pdf" | "manual">("ai");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please describe the form you want to create"); return; }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/forms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!response.ok) { const error = await response.json(); throw new Error(error.message || "Failed to generate form"); }
      const data = await response.json();
      sessionStorage.setItem("generatedForm", JSON.stringify(data.form));
      toast.success("Form generated successfully!");
      router.push("/dashboard/create/edit");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate form");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate(template.id);
    setPrompt(template.prompt);
    setActiveTab("ai");
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
      toast.error("Please upload a PDF, TXT, or DOC file");
      return;
    }
    setUploadedFile(file);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/forms/extract-pdf", { method: "POST", body: formData });
      if (!response.ok) { const error = await response.json(); throw new Error(error.message || "Failed to extract form from file"); }
      const data = await response.json();
      sessionStorage.setItem("generatedForm", JSON.stringify(data.form));
      toast.success("Form extracted from PDF successfully!");
      router.push("/dashboard/create/edit");
    } catch (error: any) {
      toast.error(error.message || "Failed to process file");
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Form</h1>
        <p className="text-white/60 mt-1">Choose how you want to create your form</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
        {[
          { id: "ai" as const, label: "AI Generator", icon: Sparkles, description: "Describe in words" },
          { id: "template" as const, label: "Templates", icon: FileText, description: "Pre-built forms" },
          { id: "pdf" as const, label: "Upload PDF", icon: Upload, description: "Extract from file" },
          { id: "manual" as const, label: "Build Manually", icon: Plus, description: "Add fields yourself" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* AI Generator Tab */}
        {activeTab === "ai" && (
          <motion.div key="ai" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-violet-600/20">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="font-semibold">AI Form Generator</h2>
                  <p className="text-sm text-white/40">Describe your form in plain English</p>
                </div>
              </div>
              <Textarea
                placeholder="Describe the form you want to create...

Example: Create an employee onboarding form with personal information, emergency contacts, tax details, laptop request, and NDA agreement."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="resize-none rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/40">Be specific about fields, sections, and types</p>
                <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8">
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="mr-2 h-5 w-5" /> Generate Form</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === "template" && (
          <motion.div key="template" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`group rounded-2xl border p-5 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-xl bg-violet-600/20">
                        <template.icon className="h-5 w-5 text-violet-500" />
                      </div>
                      <Badge variant="outline" className="border-white/10 text-white/60">{template.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{template.title}</h3>
                    <p className="text-sm text-white/40 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">{template.fields} fields</span>
                      <Button variant="ghost" size="sm" className="h-8 text-white/60 hover:text-white">
                        Use Template <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Manual Builder Tab */}
        {activeTab === "manual" && (
          <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-violet-600/20">
                  <Plus className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="font-semibold">Build Manually</h2>
                  <p className="text-sm text-white/40">Create your form field by field with full control</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Form Title */}
                <div className="space-y-2">
                  <Label className="text-white/80">Form Title</Label>
                  <Input
                    placeholder="Enter form title"
                    className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Form Description */}
                <div className="space-y-2">
                  <Label className="text-white/80">Description</Label>
                  <Textarea
                    placeholder="Add a description for your form..."
                    rows={3}
                    className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Field Types */}
                <div className="space-y-2">
                  <Label className="text-white/80">Add Fields</Label>
                  <p className="text-sm text-white/40 mb-3">Choose the fields you want to include</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {[
                      { type: "text", label: "Text Input", icon: "📝" },
                      { type: "email", label: "Email", icon: "📧" },
                      { type: "phone", label: "Phone", icon: "📱" },
                      { type: "number", label: "Number", icon: "🔢" },
                      { type: "textarea", label: "Text Area", icon: "📄" },
                      { type: "dropdown", label: "Dropdown", icon: "📋" },
                      { type: "checkbox", label: "Checkbox", icon: "☑️" },
                      { type: "radio", label: "Radio", icon: "🔘" },
                      { type: "date", label: "Date", icon: "📅" },
                      { type: "time", label: "Time", icon: "⏰" },
                      { type: "file", label: "File Upload", icon: "📎" },
                      { type: "rating", label: "Rating", icon: "⭐" },
                    ].map((field) => (
                      <Button
                        key={field.type}
                        variant="outline"
                        className="h-auto py-3 flex-col gap-1 border-white/10 text-white hover:bg-white/10"
                        onClick={() => {
                          toast.success(`Added ${field.label} field`);
                        }}
                      >
                        <span className="text-lg">{field.icon}</span>
                        <span className="text-xs">{field.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Start Building Button */}
                <div className="flex gap-3 pt-4">
                  <Link href="/dashboard/create/edit" className="flex-1">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Form Builder
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-white/40 text-center">
                  Open the full form builder to add, edit, and arrange fields visually
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* PDF Upload Tab */}
        {activeTab === "pdf" && (
          <motion.div key="pdf" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-violet-600/20">
                  <Upload className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="font-semibold">Upload PDF to Extract Form</h2>
                  <p className="text-sm text-white/40">Upload a document and AI will extract form fields</p>
                </div>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isDragging ? "border-violet-500 bg-violet-500/5" : "border-white/20 hover:border-white/40"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-violet-600/20">
                      <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium">Processing your file...</p>
                      <p className="text-sm text-white/40 mt-1">AI is extracting form fields</p>
                    </div>
                    {uploadedFile && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
                        <File className="h-4 w-4 text-white/40" />
                        <span className="text-sm">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-white/5 mx-auto w-fit mb-4">
                      <Upload className="h-8 w-8 text-white/40" />
                    </div>
                    <p className="font-medium mb-1">Drag and drop your file here</p>
                    <p className="text-sm text-white/40 mb-4">or click to browse files</p>
                    <Input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer rounded-xl border-white/10 text-white hover:bg-white/10" asChild>
                        <span><Download className="h-4 w-4 mr-2" /> Choose File</span>
                      </Button>
                    </label>
                    <p className="text-xs text-white/30 mt-4">Supported: PDF, TXT, DOC, DOCX (Max 10MB)</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Sparkles, title: "AI-Powered", desc: "Automatically detects fields" },
                  { icon: Eye, title: "Smart Detection", desc: "Recognizes labels & inputs" },
                  { icon: FileText, title: "Editable Result", desc: "Fine-tune in builder" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <div className="p-2 rounded-lg bg-violet-600/20">
                      <feature.icon className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-white/40">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h3 className="font-semibold mb-3">💡 Tips for better results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Be specific about fields you need (e.g., 'email with validation')",
            "Mention dropdowns, checkboxes, or specific input types",
            "Describe logical sections to group related fields",
            "Include special requirements like file uploads or signatures",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-violet-500 flex-shrink-0" />
              <p className="text-sm text-white/60">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
