"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SignaturePad } from "@/components/ui/signature-pad";
import { toast } from "sonner";
import { Form, FormField, FormSection } from "@/types/form";

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`);
      if (!response.ok) {
        throw new Error("Form not found");
      }
      const data = await response.json();
      setForm(data.form);

      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      data.form.sections?.forEach((section: FormSection) => {
        section.fields?.forEach((field: FormField) => {
          if (field.defaultValue !== undefined) {
            initialData[field.id] = field.defaultValue;
          } else if (field.type === "checkbox" || field.type === "multiSelect") {
            initialData[field.id] = [];
          } else if (field.type === "toggle" || field.type === "yesNo") {
            initialData[field.id] = false;
          } else if (field.type === "rating") {
            initialData[field.id] = 0;
          } else if (field.type === "slider") {
            initialData[field.id] = 50;
          } else {
            initialData[field.id] = "";
          }
        });
      });
      setFormData(initialData);
    } catch (error) {
      toast.error("Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form?.sections?.forEach((section) => {
      section.fields?.forEach((field) => {
        if (field.validation?.required) {
          const value = formData[field.id];
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            newErrors[field.id] = `${field.label} is required`;
          }
        }

        // Email validation
        if (field.type === "email" && formData[field.id]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData[field.id])) {
            newErrors[field.id] = "Please enter a valid email address";
          }
        }

        // Min length validation
        if (
          field.validation?.minLength &&
          formData[field.id] &&
          formData[field.id].length < field.validation.minLength
        ) {
          newErrors[
            field.id
          ] = `Minimum ${field.validation.minLength} characters required`;
        }

        // Max length validation
        if (
          field.validation?.maxLength &&
          formData[field.id] &&
          formData[field.id].length > field.validation.maxLength
        ) {
          newErrors[
            field.id
          ] = `Maximum ${field.validation.maxLength} characters allowed`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/forms/${formId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSubmitted(true);
      toast.success("Form submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];

    const fieldWrapper = (children: React.ReactNode) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id}>
          {field.label}
          {field.validation?.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        {field.helpText && (
          <p className="text-sm text-muted-foreground">{field.helpText}</p>
        )}
        {children}
        {error && (
          <p className="text-sm text-destructive flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    );

    switch (field.type) {
      case "text":
      case "password":
        return fieldWrapper(
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "email":
        return fieldWrapper(
          <Input
            id={field.id}
            type="email"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "phone":
        return fieldWrapper(
          <Input
            id={field.id}
            type="tel"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "url":
        return fieldWrapper(
          <Input
            id={field.id}
            type="url"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "number":
        return fieldWrapper(
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) =>
              handleInputChange(field.id, parseFloat(e.target.value) || "")
            }
          />
        );

      case "date":
        return fieldWrapper(
          <Input
            id={field.id}
            type="date"
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "time":
        return fieldWrapper(
          <Input
            id={field.id}
            type="time"
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case "textarea":
        return fieldWrapper(
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            rows={4}
          />
        );

      case "dropdown":
        return fieldWrapper(
          <Select
            value={value || ""}
            onValueChange={(val) => handleInputChange(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return fieldWrapper(
          <RadioGroup
            value={value || ""}
            onValueChange={(val) => handleInputChange(field.id, val)}
          >
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.id}`} />
                <Label htmlFor={`${field.id}-${option.id}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return fieldWrapper(
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.id}`}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      handleInputChange(field.id, [...currentValues, option.value]);
                    } else {
                      handleInputChange(
                        field.id,
                        currentValues.filter((v: string) => v !== option.value)
                      );
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option.id}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case "toggle":
      case "yesNo":
        return fieldWrapper(
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleInputChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>{value ? "Yes" : "No"}</Label>
          </div>
        );

      case "rating":
        return fieldWrapper(
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange(field.id, star)}
                className={`text-2xl ${
                  star <= (value || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        );

      case "slider":
        return fieldWrapper(
          <div className="space-y-2">
            <Slider
              value={[value || 50]}
              onValueChange={([val]) => handleInputChange(field.id, val)}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0</span>
              <span>{value || 50}</span>
              <span>100</span>
            </div>
          </div>
        );

      case "file":
      case "image":
        return fieldWrapper(
          <Input
            id={field.id}
            type="file"
            accept={field.type === "image" ? "image/*" : undefined}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleInputChange(field.id, file.name);
              }
            }}
          />
        );

      case "signature":
        return fieldWrapper(
          <SignaturePad
            width={400}
            height={150}
            value={value || null}
            onChange={(sig) => handleInputChange(field.id, sig)}
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-muted-foreground">
              This form doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                {form.settings?.successMessage ||
                  "Your response has been submitted successfully."}
              </p>
              <Button onClick={() => window.location.reload()}>
                Submit Another Response
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Form Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Powered by FormAI
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {form.sections?.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.fields?.map((field) => renderField(field))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  {form.settings?.submitButtonText || "Submit"}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}