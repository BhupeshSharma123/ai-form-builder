import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "placeholder-key",
});

export interface GenerateFormParams {
  prompt: string;
  category?: string;
}

export interface GeneratedForm {
  title: string;
  description: string;
  sections: {
    title: string;
    description?: string;
    fields: {
      type: string;
      label: string;
      placeholder?: string;
      helpText?: string;
      required?: boolean;
      options?: string[];
    }[];
  }[];
}

const SYSTEM_PROMPT = `You are an AI form builder assistant. When a user describes a form they want to create, generate a complete form structure in valid JSON format.

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no explanations, no code blocks
2. The JSON must match this exact structure:
{
  "title": "Form Title",
  "description": "Form description",
  "sections": [
    {
      "title": "Section Title",
      "description": "Optional section description",
      "fields": [
        {
          "type": "fieldType",
          "label": "Field Label",
          "placeholder": "Placeholder text",
          "helpText": "Help text for the field",
          "required": true/false,
          "options": ["Option 1", "Option 2"] // only for dropdown, radio, checkbox, multiSelect
        }
      ]
    }
  ]
}

3. Supported field types:
   - text, textarea, email, phone, number, date, time, url, password
   - dropdown, checkbox, radio, toggle, rating, slider
   - signature, address, country, state, city
   - file, image, multiSelect, yesNo
   - hidden, section, divider, heading, paragraph, spacer

4. Create logical sections to group related fields
5. Use appropriate field types for the data being collected
6. Add helpful placeholder text and help text
7. Mark essential fields as required
8. For dropdown/radio/checkbox fields, provide relevant options
9. Make the form professional and user-friendly
10. Include a mix of field types to make the form engaging`;

export async function generateForm(
  params: GenerateFormParams
): Promise<GeneratedForm> {
  const { prompt, category } = params;

  const userMessage = category
    ? `Create a ${category} form: ${prompt}`
    : prompt;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    // Validate the structure
    if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error("Invalid form structure returned by AI");
    }

    return parsed as GeneratedForm;
  } catch (error) {
    console.error("Error generating form:", error);
    throw error;
  }
}

export async function generateFormFromDescription(
  description: string
): Promise<GeneratedForm> {
  return generateForm({ prompt: description });
}

// Templates for common form types
export const FORM_TEMPLATES: Record<string, string> = {
  "employee-onboarding":
    "Create an employee onboarding form with personal information, emergency contacts, tax details, laptop request, and NDA agreement.",
  "customer-feedback":
    "Create a customer feedback survey with satisfaction ratings, product quality assessment, service experience, and improvement suggestions.",
  "hotel-booking":
    "Build a hotel booking form with guest details, check-in/check-out dates, room preferences, special requests, and payment information.",
  "event-registration":
    "Create an event registration form with attendee information, session selection, dietary preferences, and accessibility requirements.",
  "job-application":
    "Build a job application form with personal details, education history, work experience, skills, resume upload, and cover letter.",
  "contact-us":
    "Create a contact us form with name, email, phone, subject dropdown, message textarea, and preferred contact method.",
  "newsletter-signup":
    "Build a newsletter signup form with email, name, interest categories, frequency preference, and consent checkbox.",
  "patient-intake":
    "Create a patient intake form with personal information, medical history, current medications, allergies, insurance details, and consent forms.",
};