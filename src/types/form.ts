export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "time"
  | "url"
  | "password"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "toggle"
  | "rating"
  | "slider"
  | "signature"
  | "address"
  | "country"
  | "state"
  | "city"
  | "file"
  | "image"
  | "multiSelect"
  | "yesNo"
  | "hidden"
  | "section"
  | "divider"
  | "heading"
  | "paragraph"
  | "spacer";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  rules: ConditionalRule[];
  action: "show" | "hide" | "enable" | "disable";
}

export interface ConditionalRule {
  fieldId: string;
  operator:
    | "equals"
    | "notEquals"
    | "contains"
    | "notContains"
    | "greaterThan"
    | "lessThan"
    | "isEmpty"
    | "isNotEmpty";
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | string[] | boolean | number;
  options?: FieldOption[];
  validation?: FieldValidation;
  conditionalLogic?: ConditionalLogic;
  width?: "full" | "half";
  order: number;
  sectionId?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
}

export interface FormSettings {
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  notifyEmail?: boolean;
  notificationEmail?: string;
  requireAuth?: boolean;
  allowMultipleSubmissions?: boolean;
  closedMessage?: string;
  closeDate?: string;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  backgroundColor?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  settings?: FormSettings;
  status: "draft" | "published" | "closed";
  createdAt: string;
  updatedAt: string;
  userId: string;
  responsesCount: number;
  isTemplate?: boolean;
  category?: string;
  shareUrl?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AIFormRequest {
  prompt: string;
  category?: string;
}

export interface AIFormResponse {
  title: string;
  description: string;
  sections: {
    title: string;
    description?: string;
    fields: {
      type: FieldType;
      label: string;
      placeholder?: string;
      helpText?: string;
      required?: boolean;
      options?: string[];
    }[];
  }[];
}

export interface DashboardStats {
  totalForms: number;
  totalResponses: number;
  publishedForms: number;
  draftForms: number;
  aiCreditsRemaining: number;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  form: Partial<Form>;
}