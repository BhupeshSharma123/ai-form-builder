import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Form, FormField, FormSection, FieldType } from "@/types/form";

interface FormState {
  form: Form | null;
  selectedFieldId: string | null;
  selectedSectionId: string | null;
  isDirty: boolean;
  isPreview: boolean;

  // Actions
  setForm: (form: Form) => void;
  updateFormTitle: (title: string) => void;
  updateFormDescription: (description: string) => void;
  addSection: (title?: string) => void;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  removeSection: (sectionId: string) => void;
  addField: (sectionId: string, type: FieldType) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  moveField: (
    fieldId: string,
    fromSectionId: string,
    toSectionId: string,
    newIndex: number
  ) => void;
  selectField: (fieldId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  setDirty: (dirty: boolean) => void;
  setPreview: (preview: boolean) => void;
  resetForm: () => void;
}

const createDefaultField = (type: FieldType): FormField => {
  const id = uuidv4();
  const baseField: FormField = {
    id,
    type,
    label: getDefaultLabel(type),
    placeholder: getDefaultPlaceholder(type),
    order: 0,
    validation: {
      required: false,
    },
  };

  if (type === "dropdown" || type === "radio" || type === "checkbox" || type === "multiSelect") {
    baseField.options = [
      { id: uuidv4(), label: "Option 1", value: "option-1" },
      { id: uuidv4(), label: "Option 2", value: "option-2" },
      { id: uuidv4(), label: "Option 3", value: "option-3" },
    ];
  }

  if (type === "rating") {
    baseField.defaultValue = 0;
  }

  if (type === "slider") {
    baseField.defaultValue = 50;
  }

  if (type === "toggle" || type === "yesNo") {
    baseField.defaultValue = false;
  }

  return baseField;
};

function getDefaultLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: "Text Field",
    textarea: "Text Area",
    email: "Email Address",
    phone: "Phone Number",
    number: "Number",
    date: "Date",
    time: "Time",
    url: "URL",
    password: "Password",
    dropdown: "Dropdown",
    checkbox: "Checkbox",
    radio: "Radio Group",
    toggle: "Toggle",
    rating: "Rating",
    slider: "Slider",
    signature: "Signature",
    address: "Address",
    country: "Country",
    state: "State",
    city: "City",
    file: "File Upload",
    image: "Image Upload",
    multiSelect: "Multi Select",
    yesNo: "Yes/No",
    hidden: "Hidden Field",
    section: "Section",
    divider: "Divider",
    heading: "Heading",
    paragraph: "Paragraph",
    spacer: "Spacer",
  };
  return labels[type] || "Field";
}

function getDefaultPlaceholder(type: FieldType): string {
  const placeholders: Partial<Record<FieldType, string>> = {
    text: "Enter text...",
    textarea: "Enter your text here...",
    email: "name@example.com",
    phone: "+1 (555) 000-0000",
    number: "0",
    url: "https://example.com",
    password: "••••••••",
  };
  return placeholders[type] || "";
}

export const useFormStore = create<FormState>((set, get) => ({
  form: null,
  selectedFieldId: null,
  selectedSectionId: null,
  isDirty: false,
  isPreview: false,

  setForm: (form) => set({ form, isDirty: false }),

  updateFormTitle: (title) =>
    set((state) => ({
      form: state.form ? { ...state.form, title } : null,
      isDirty: true,
    })),

  updateFormDescription: (description) =>
    set((state) => ({
      form: state.form ? { ...state.form, description } : null,
      isDirty: true,
    })),

  addSection: (title = "New Section") =>
    set((state) => {
      if (!state.form) return state;
      const newSection: FormSection = {
        id: uuidv4(),
        title,
        fields: [],
        order: state.form.sections.length,
      };
      return {
        form: {
          ...state.form,
          sections: [...state.form.sections, newSection],
        },
        isDirty: true,
      };
    }),

  updateSection: (sectionId, updates) =>
    set((state) => {
      if (!state.form) return state;
      return {
        form: {
          ...state.form,
          sections: state.form.sections.map((s) =>
            s.id === sectionId ? { ...s, ...updates } : s
          ),
        },
        isDirty: true,
      };
    }),

  removeSection: (sectionId) =>
    set((state) => {
      if (!state.form) return state;
      return {
        form: {
          ...state.form,
          sections: state.form.sections.filter((s) => s.id !== sectionId),
        },
        selectedSectionId:
          state.selectedSectionId === sectionId
            ? null
            : state.selectedSectionId,
        isDirty: true,
      };
    }),

  addField: (sectionId, type) =>
    set((state) => {
      if (!state.form) return state;
      const section = state.form.sections.find((s) => s.id === sectionId);
      if (!section) return state;

      const newField = createDefaultField(type);
      newField.order = section.fields.length;
      newField.sectionId = sectionId;

      return {
        form: {
          ...state.form,
          sections: state.form.sections.map((s) =>
            s.id === sectionId
              ? { ...s, fields: [...s.fields, newField] }
              : s
          ),
        },
        selectedFieldId: newField.id,
        isDirty: true,
      };
    }),

  updateField: (fieldId, updates) =>
    set((state) => {
      if (!state.form) return state;
      return {
        form: {
          ...state.form,
          sections: state.form.sections.map((s) => ({
            ...s,
            fields: s.fields.map((f) =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          })),
        },
        isDirty: true,
      };
    }),

  removeField: (fieldId) =>
    set((state) => {
      if (!state.form) return state;
      return {
        form: {
          ...state.form,
          sections: state.form.sections.map((s) => ({
            ...s,
            fields: s.fields.filter((f) => f.id !== fieldId),
          })),
        },
        selectedFieldId:
          state.selectedFieldId === fieldId ? null : state.selectedFieldId,
        isDirty: true,
      };
    }),

  moveField: (fieldId, fromSectionId, toSectionId, newIndex) =>
    set((state) => {
      if (!state.form) return state;

      const fromSection = state.form.sections.find(
        (s) => s.id === fromSectionId
      );
      if (!fromSection) return state;

      const field = fromSection.fields.find((f) => f.id === fieldId);
      if (!field) return state;

      return {
        form: {
          ...state.form,
          sections: state.form.sections.map((s) => {
            if (s.id === fromSectionId && fromSectionId === toSectionId) {
              const fields = s.fields.filter((f) => f.id !== fieldId);
              fields.splice(newIndex, 0, field);
              return { ...s, fields };
            }
            if (s.id === fromSectionId) {
              return {
                ...s,
                fields: s.fields.filter((f) => f.id !== fieldId),
              };
            }
            if (s.id === toSectionId) {
              const fields = [...s.fields];
              fields.splice(newIndex, 0, field);
              return { ...s, fields };
            }
            return s;
          }),
        },
        isDirty: true,
      };
    }),

  selectField: (fieldId) => set({ selectedFieldId: fieldId }),
  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setPreview: (preview) => set({ isPreview: preview }),
  resetForm: () =>
    set({
      form: null,
      selectedFieldId: null,
      selectedSectionId: null,
      isDirty: false,
      isPreview: false,
    }),
}));