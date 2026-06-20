import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      return NextResponse.json(
        { message: "Only PDF and TXT files are supported" },
        { status: 400 }
      );
    }

    // Read file content
    let fileContent = "";
    
    if (file.name.endsWith(".txt")) {
      fileContent = await file.text();
    } else {
      // For PDF, we'll extract text content
      // In production, use a proper PDF parser like pdf-parse
      // For now, we'll ask the user to provide the form description
      fileContent = await file.text();
    }

    // Use AI to extract form structure from content
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI form builder assistant. Extract a form structure from the provided content.
          
Return ONLY valid JSON with this structure:
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
          "helpText": "Help text",
          "required": true/false,
          "options": ["Option 1", "Option 2"]
        }
      ]
    }
  ]
}

Supported field types: text, textarea, email, phone, number, date, time, url, password, dropdown, checkbox, radio, toggle, rating, slider, signature, address, country, state, city, file, image, multiSelect, yesNo, heading, paragraph, divider

Extract all form fields, labels, and structure from the content. If the content describes a form, create it. If it's general text, create a relevant form based on the content.`,
        },
        {
          role: "user",
          content: `Extract a form structure from this content:\n\n${fileContent.substring(0, 4000)}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("Failed to extract form from file");
    }

    const parsed = JSON.parse(result);

    // Add IDs to the form structure
    const sections = (parsed.sections || []).map((section: any, sectionIndex: number) => ({
      id: uuidv4(),
      title: section.title || `Section ${sectionIndex + 1}`,
      description: section.description,
      order: sectionIndex,
      fields: (section.fields || []).map((field: any, fieldIndex: number) => ({
        id: uuidv4(),
        type: field.type || "text",
        label: field.label || "Untitled Field",
        placeholder: field.placeholder || "",
        helpText: field.helpText || "",
        required: field.required || false,
        order: fieldIndex,
        options: field.options
          ? field.options.map((opt: string, optIndex: number) => ({
              id: uuidv4(),
              label: opt,
              value: opt.toLowerCase().replace(/\s+/g, "-"),
            }))
          : undefined,
        validation: {
          required: field.required || false,
        },
      })),
    }));

    const form = {
      id: uuidv4(),
      title: parsed.title || file.name.replace(/\.[^/.]+$/, ""),
      description: parsed.description || `Form extracted from ${file.name}`,
      sections,
      settings: {
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
      },
      status: "draft",
    };

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error("Error extracting PDF:", error);
    return NextResponse.json(
      { message: error.message || "Failed to extract form from file" },
      { status: 500 }
    );
  }
}
