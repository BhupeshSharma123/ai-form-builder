"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Eye, EyeOff, ArrowLeft, Plus, GripVertical, Trash2,
  Smartphone, Monitor, Tablet, Undo, Redo, Share2,
  Type, AlignLeft, Mail, Phone, Hash, Calendar, Clock, Link, Lock,
  List, CheckSquare, Circle, ToggleLeft, Star, Sliders,
  FileSignature, MapPin, Upload, Image as ImageIcon, ToggleRight,
  Heading, Minus, FileText, Sparkles, X, Check, MoreHorizontal,
  ChevronDown, LayoutGrid, Space,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SignaturePad } from "@/components/ui/signature-pad";
import { useFormStore } from "@/store/form-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Form, FormField, FormSection, FieldType } from "@/types/form";
import { cn } from "@/lib/utils";

const fieldTypeCategories = [
  {
    name: "Text Inputs", icon: Type,
    types: [
      { type: "text" as FieldType, label: "Text", icon: Type },
      { type: "textarea" as FieldType, label: "Text Area", icon: AlignLeft },
      { type: "email" as FieldType, label: "Email", icon: Mail },
      { type: "phone" as FieldType, label: "Phone", icon: Phone },
      { type: "password" as FieldType, label: "Password", icon: Lock },
      { type: "url" as FieldType, label: "URL", icon: Link },
    ],
  },
  {
    name: "Numbers & Dates", icon: Hash,
    types: [
      { type: "number" as FieldType, label: "Number", icon: Hash },
      { type: "date" as FieldType, label: "Date", icon: Calendar },
      { type: "time" as FieldType, label: "Time", icon: Clock },
      { type: "slider" as FieldType, label: "Slider", icon: Sliders },
    ],
  },
  {
    name: "Choices", icon: List,
    types: [
      { type: "dropdown" as FieldType, label: "Dropdown", icon: List },
      { type: "radio" as FieldType, label: "Radio", icon: Circle },
      { type: "checkbox" as FieldType, label: "Checkbox", icon: CheckSquare },
      { type: "multiSelect" as FieldType, label: "Multi Select", icon: CheckSquare },
      { type: "yesNo" as FieldType, label: "Yes / No", icon: ToggleRight },
      { type: "toggle" as FieldType, label: "Toggle", icon: ToggleLeft },
    ],
  },
  {
    name: "Rich Inputs", icon: Star,
    types: [
      { type: "rating" as FieldType, label: "Rating", icon: Star },
      { type: "signature" as FieldType, label: "Signature", icon: FileSignature },
      { type: "file" as FieldType, label: "File Upload", icon: Upload },
      { type: "image" as FieldType, label: "Image", icon: ImageIcon },
    ],
  },
  {
    name: "Layout", icon: LayoutGrid,
    types: [
      { type: "heading" as FieldType, label: "Heading", icon: Heading },
      { type: "paragraph" as FieldType, label: "Paragraph", icon: FileText },
      { type: "divider" as FieldType, label: "Divider", icon: Minus },
      { type: "spacer" as FieldType, label: "Spacer", icon: Space },
    ],
  },
];

type DeviceView = "desktop" | "tablet" | "mobile";

export default function AdvancedFormBuilder() {
  const router = useRouter();
  const {
    form, setForm, updateFormTitle, updateFormDescription,
    addSection, updateSection, removeSection,
    addField, updateField, removeField,
    selectedFieldId, selectField,
  } = useFormStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [showPreview, setShowPreview] = useState(true);
  const [previewFormData, setPreviewFormData] = useState<Record<string, any>>({});
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const storedForm = sessionStorage.getItem("generatedForm");
    if (storedForm) {
      setForm(JSON.parse(storedForm) as Form);
      sessionStorage.removeItem("generatedForm");
    } else if (!form) {
      setForm({
        id: crypto.randomUUID(),
        title: "Untitled Form",
        description: "Add a description",
        sections: [{ id: crypto.randomUUID(), title: "Section 1", description: "", fields: [], order: 0 }],
        settings: { submitButtonText: "Submit", successMessage: "Thank you!" },
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "",
        responsesCount: 0,
      });
    }
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { error } = await supabase.from("forms").upsert({
        id: form.id, title: form.title, description: form.description,
        sections: form.sections, settings: form.settings,
        status: form.status.toUpperCase(), user_id: user.id,
      });
      if (error) throw error;
      toast.success("Form saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      
      // First save the form, then publish
      const { error: saveError } = await supabase.from("forms").upsert({
        id: form.id, title: form.title, description: form.description,
        sections: form.sections, settings: form.settings,
        status: "PUBLISHED", user_id: user.id,
      });
      if (saveError) throw saveError;
      
      setForm({ ...form, status: "published" });
      toast.success("Published! Link copied.");
      navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to publish");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fieldId);
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (fieldId !== draggedField) {
      setDragOverField(fieldId);
    }
  };

  const handleDragLeave = () => {
    setDragOverField(null);
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string, sectionId: string) => {
    e.preventDefault();
    setDragOverField(null);
    
    if (!draggedField || !form || draggedField === targetFieldId) return;
    
    const section = form.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const fields = [...section.fields];
    const draggedIndex = fields.findIndex(f => f.id === draggedField);
    const targetIndex = fields.findIndex(f => f.id === targetFieldId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Reorder fields
    const [removed] = fields.splice(draggedIndex, 1);
    fields.splice(targetIndex, 0, removed);
    
    // Update order
    const updatedFields = fields.map((f, i) => ({ ...f, order: i }));
    
    const updatedSections = form.sections.map(s =>
      s.id === sectionId ? { ...s, fields: updatedFields } : s
    );
    
    setForm({ ...form, sections: updatedSections });
    setDraggedField(null);
    toast.success("Field reordered!");
  };

  const handleDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case "mobile": return "max-w-[375px]";
      case "tablet": return "max-w-[768px]";
      default: return "max-w-full";
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Top Toolbar */}
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-8 w-8 text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <Sparkles className="h-4 w-4 text-violet-500" />
            <Input
              value={form.title}
              onChange={(e) => updateFormTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto w-64 focus-visible:ring-0 text-white"
              placeholder="Form title"
            />
            <Badge variant="outline" className="border-white/10 text-white/60">
              {form.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-white/10 rounded-lg">
              <TooltipProvider>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none text-white/60 hover:text-white"><Undo className="h-4 w-4" /></Button>
                </TooltipTrigger><TooltipContent>Undo</TooltipContent></Tooltip>
              </TooltipProvider>
              <div className="w-px h-4 bg-white/10" />
              <TooltipProvider>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none text-white/60 hover:text-white"><Redo className="h-4 w-4" /></Button>
                </TooltipTrigger><TooltipContent>Redo</TooltipContent></Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <Button
              variant={showPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className={showPreview ? "bg-violet-600" : "border-white/10 text-white/60 hover:text-white"}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Preview
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="border-white/10 text-white/60 hover:text-white">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" onClick={handlePublish} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <Share2 className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Field Picker */}
        <aside className="w-72 border-r border-white/10 bg-white/5 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-white/40 mb-3">ADD FIELDS</h3>
            <div className="space-y-1">
              {fieldTypeCategories.map((category) => (
                <CollapsibleFieldCategory
                  key={category.name}
                  category={category}
                  onAddField={(type) => {
                    const sectionId = activeSection || form.sections[0]?.id;
                    if (sectionId) { addField(sectionId, type); toast.success(`Added ${type} field`); }
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Form Builder */}
        <main className="flex-1 overflow-y-auto bg-white/[0.02]">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Form Header */}
            <div className="border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-2xl p-6 transition-colors">
              <Input
                value={form.title}
                onChange={(e) => updateFormTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white mb-2"
                placeholder="Untitled Form"
              />
              <Textarea
                value={form.description || ""}
                onChange={(e) => updateFormDescription(e.target.value)}
                placeholder="Add a description..."
                className="bg-transparent border-none p-0 resize-none focus-visible:ring-0 min-h-[40px] text-white/60"
                rows={2}
              />
            </div>

            {/* Sections */}
            {form.sections.map((section) => (
              <div key={section.id} className={cn(
                "rounded-2xl border overflow-hidden transition-all",
                activeSection === section.id ? "border-violet-500/50" : "border-white/10"
              )}>
                <div className="bg-white/5 p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-white/30" />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          className="font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white"
                          placeholder="Section title"
                        />
                        <Input
                          value={section.description || ""}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          className="text-sm text-white/40 bg-transparent border-none p-0 h-auto focus-visible:ring-0 mt-1"
                          placeholder="Add description (optional)"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs border-white/10 text-white/40">
                        {section.fields.length} fields
                      </Badge>
                      {form.sections.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-red-400" onClick={() => removeSection(section.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {section.fields.map((field) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field.id)}
                      onDragOver={(e) => handleDragOver(e, field.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, field.id, section.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "transition-all",
                        draggedField === field.id && "opacity-50",
                        dragOverField === field.id && "border-t-2 border-t-violet-500"
                      )}
                    >
                      <FormFieldCard
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => selectField(field.id)}
                        onUpdate={(updates) => updateField(field.id, updates)}
                        onRemove={() => removeField(field.id)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full border-2 border-dashed border-white/10 hover:border-violet-500/30 text-white/40 hover:text-white rounded-xl h-12"
                    onClick={() => { setActiveSection(section.id); setShowFieldPicker(true); }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Section */}
            <Button
              variant="outline"
              className="w-full h-16 border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-2xl text-white/40 hover:text-white"
              onClick={() => addSection()}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Section
            </Button>
          </div>
        </main>

        {/* Right Panel - Preview */}
        {showPreview && (
          <aside className="w-[480px] border-l border-white/10 bg-white/5 overflow-hidden flex flex-col">
            <div className="border-b border-white/10 p-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Preview</h3>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                {(["mobile", "tablet", "desktop"] as DeviceView[]).map((device) => {
                  const Icon = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : Monitor;
                  return (
                    <TooltipProvider key={device}>
                      <Tooltip><TooltipTrigger asChild>
                        <Button
                          variant={deviceView === device ? "default" : "ghost"}
                          size="icon"
                          className={cn("h-7 w-7", deviceView === device ? "bg-violet-600" : "text-white/40 hover:text-white")}
                          onClick={() => setDeviceView(device)}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{device.charAt(0).toUpperCase() + device.slice(1)}</TooltipContent></Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white/[0.02]">
              <div className={cn("mx-auto transition-all duration-300", getDeviceWidth())}>
                <div className={cn(
                  "bg-white rounded-2xl shadow-xl overflow-hidden",
                  deviceView === "mobile" && "border-8 border-gray-800 rounded-[2rem]"
                )}>
                  {deviceView === "mobile" && (
                    <div className="h-6 bg-gray-800 flex items-center justify-center">
                      <div className="w-16 h-4 bg-gray-700 rounded-full" />
                    </div>
                  )}
                  <div className="p-6 text-black">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <Sparkles className="h-3 w-3" />
                        Powered by FormAI
                      </div>
                      <h2 className="text-xl font-bold">{form.title || "Untitled Form"}</h2>
                      {form.description && <p className="text-sm text-gray-500 mt-1">{form.description}</p>}
                    </div>
                    <div className="space-y-6">
                      {form.sections.map((section) => (
                        <div key={section.id} className="space-y-4">
                          <div className="border-b pb-2">
                            <h3 className="font-semibold">{section.title}</h3>
                            {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
                          </div>
                          {section.fields.map((field) => (
                            <PreviewField
                              key={field.id}
                              field={field}
                              value={previewFormData[field.id]}
                              onChange={(value) => setPreviewFormData(prev => ({ ...prev, [field.id]: value }))}
                            />
                          ))}
                          {section.fields.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">No fields added yet</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Button className="w-full rounded-xl bg-black text-white hover:bg-gray-800">
                        {form.settings?.submitButtonText || "Submit"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedFieldId && (
              <div className="border-t border-white/10 h-64 overflow-y-auto">
                <FieldSettingsPanel
                  field={form.sections.flatMap(s => s.fields).find(f => f.id === selectedFieldId)!}
                  onUpdate={(updates) => updateField(selectedFieldId, updates)}
                  onClose={() => selectField(null)}
                />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Mobile Field Picker Dialog */}
      <Dialog open={showFieldPicker} onOpenChange={setShowFieldPicker}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fieldTypeCategories.map((category) => (
              <div key={category.name}>
                <h4 className="text-sm font-medium text-white/40 mb-2">{category.name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {category.types.map((ft) => (
                    <Button
                      key={ft.type}
                      variant="outline"
                      className="justify-start h-auto py-3 border-white/10 text-white/80 hover:text-white hover:bg-white/10"
                      onClick={() => {
                        const sectionId = activeSection || form.sections[0]?.id;
                        if (sectionId) { addField(sectionId, ft.type); setShowFieldPicker(false); toast.success(`Added ${ft.label}`); }
                      }}
                    >
                      <ft.icon className="h-4 w-4 mr-2" />
                      {ft.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollapsibleFieldCategory({ category, onAddField }: { category: typeof fieldTypeCategories[0]; onAddField: (type: FieldType) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <category.icon className="h-4 w-4 text-white/40" />
          <span className="text-sm font-medium">{category.name}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform text-white/40", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-2 pt-0 space-y-1">
              {category.types.map((ft) => (
                <button
                  key={ft.type}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                  onClick={() => onAddField(ft.type)}
                >
                  <div className="p-1.5 rounded bg-white/5 group-hover:bg-violet-600/20 transition-colors">
                    <ft.icon className="h-3.5 w-3.5 text-white/40 group-hover:text-violet-500" />
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white">{ft.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormFieldCard({ field, isSelected, onSelect, onUpdate, onRemove }: {
  field: FormField; isSelected: boolean; onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void; onRemove: () => void;
}) {
  const fieldType = fieldTypeCategories.flatMap(c => c.types).find(t => t.type === field.type);
  const Icon = fieldType?.icon || Type;

  return (
    <div
      className={cn(
        "group border rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer",
        isSelected && "border-violet-500/50 bg-violet-500/10"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="h-4 w-4 text-white/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{field.label}</span>
            {field.validation?.required && <span className="text-red-400 text-xs">*</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs py-0 border-white/10 text-white/40">
              {fieldType?.label || field.type}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdate({ validation: { ...field.validation, required: !field.validation?.required } }); }}>
                <Check className="h-4 w-4 mr-2" />
                {field.validation?.required ? "Make Optional" : "Make Required"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-red-400 focus:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function PreviewField({ field, value, onChange }: { field: FormField; value: any; onChange: (value: any) => void }) {
  if (field.type === "heading") return <h3 className="text-lg font-semibold">{field.label}</h3>;
  if (field.type === "paragraph") return <p className="text-sm text-gray-500">{field.helpText || field.label}</p>;
  if (field.type === "divider") return <hr className="my-2" />;
  if (field.type === "spacer") return <div className="h-8" />;

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.helpText && <p className="text-xs text-gray-400">{field.helpText}</p>}
      {renderFieldInput(field, value, onChange)}
    </div>
  );
}

function renderFieldInput(field: FormField, value: any, onChange: (value: any) => void) {
  const baseClass = "rounded-xl";
  switch (field.type) {
    case "text": case "password": case "email": case "phone": case "url":
      return <Input type={field.type === "phone" ? "tel" : field.type} placeholder={field.placeholder} value={value || ""} onChange={(e) => onChange(e.target.value)} className={baseClass} />;
    case "number":
      return <Input type="number" placeholder={field.placeholder} value={value || ""} onChange={(e) => onChange(e.target.value)} className={baseClass} />;
    case "date": return <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className={baseClass} />;
    case "time": return <Input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} className={baseClass} />;
    case "textarea":
      return <Textarea placeholder={field.placeholder} value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className={baseClass} />;
    case "dropdown": case "country": case "state": case "city":
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className={baseClass}><SelectValue placeholder={field.placeholder || "Select"} /></SelectTrigger>
          <SelectContent>{field.options?.map((o) => <SelectItem key={o.id} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      );
    case "radio":
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => (
            <label key={o.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => (
            <label key={o.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={(value || []).includes(o.value)} onChange={(e) => {
                const c = value || [];
                onChange(e.target.checked ? [...c, o.value] : c.filter((v: string) => v !== o.value));
              }} />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      );
    case "toggle": case "yesNo":
      return <div className="flex items-center gap-2"><Switch checked={value || false} onCheckedChange={onChange} /><span className="text-sm">{value ? "Yes" : "No"}</span></div>;
    case "rating":
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => onChange(s)} className={cn("text-2xl", s <= (value || 0) ? "text-yellow-400" : "text-gray-300")}>★</button>
          ))}
        </div>
      );
    case "slider":
      return (
        <div className="space-y-2">
          <input type="range" min="0" max="100" value={value || 50} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full accent-violet-600" />
          <div className="flex justify-between text-xs text-gray-400"><span>0</span><span className="font-medium">{value || 50}</span><span>100</span></div>
        </div>
      );
    case "file": case "image":
      return (
        <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-gray-400 cursor-pointer">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-400">Click to upload</p>
        </div>
      );
    case "signature":
      return (
        <SignaturePad
          width={400}
          height={150}
          value={value || null}
          onChange={(sig) => onChange(sig)}
        />
      );
    default:
      return <Input placeholder={field.placeholder} className={baseClass} />;
  }
}

function FieldSettingsPanel({ field, onUpdate, onClose }: {
  field: FormField; onUpdate: (updates: Partial<FormField>) => void; onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h4 className="font-semibold text-sm">Field Settings</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-white/60">Label</Label>
          <Input value={field.label} onChange={(e) => onUpdate({ label: e.target.value })} className="rounded-xl bg-white/5 border-white/10 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60">Placeholder</Label>
          <Input value={field.placeholder || ""} onChange={(e) => onUpdate({ placeholder: e.target.value })} className="rounded-xl bg-white/5 border-white/10 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60">Help Text</Label>
          <Input value={field.helpText || ""} onChange={(e) => onUpdate({ helpText: e.target.value })} className="rounded-xl bg-white/5 border-white/10 text-white" />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-white/60">Required</Label>
          <Switch checked={field.validation?.required || false} onCheckedChange={(checked) => onUpdate({ validation: { ...field.validation, required: checked } })} />
        </div>
        {(field.type === "dropdown" || field.type === "radio" || field.type === "checkbox" || field.type === "multiSelect") && (
          <div className="space-y-2">
            <Label className="text-white/60">Options</Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "-") };
                      onUpdate({ options: newOptions });
                    }}
                    className="flex-1 rounded-xl bg-white/5 border-white/10 text-white"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-red-400"
                    onClick={() => onUpdate({ options: field.options?.filter((_, i) => i !== index) })}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10 text-white/60 hover:text-white"
                onClick={() => onUpdate({ options: [...(field.options || []), { id: crypto.randomUUID(), label: `Option ${(field.options?.length || 0) + 1}`, value: `option-${(field.options?.length || 0) + 1}` }] })}>
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
