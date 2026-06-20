import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateForm } from "@/lib/groq";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check AI credits from Supabase
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("ai_credits")
      .eq("id", user.id)
      .single();

    const aiCredits = userData?.ai_credits ?? 50;

    if (aiCredits <= 0) {
      return NextResponse.json(
        { message: "No AI credits remaining. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Generate form with AI
    const generatedForm = await generateForm({ prompt });

    // Convert generated form to our format with IDs
    const sections = generatedForm.sections.map((section, sectionIndex) => ({
      id: uuidv4(),
      title: section.title,
      description: section.description,
      order: sectionIndex,
      fields: section.fields.map((field, fieldIndex) => ({
        id: uuidv4(),
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || "",
        helpText: field.helpText || "",
        required: field.required || false,
        order: fieldIndex,
        options: field.options
          ? field.options.map((opt, optIndex) => ({
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
      title: generatedForm.title,
      description: generatedForm.description,
      sections,
      settings: {
        submitButtonText: "Submit",
        successMessage:
          "Thank you for your submission! We'll get back to you soon.",
      },
      status: "draft",
    };

    // Deduct AI credit
    await supabase
      .from("users")
      .update({ ai_credits: aiCredits - 1 })
      .eq("id", user.id);

    return NextResponse.json({
      form,
      creditsRemaining: aiCredits - 1,
    });
  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate form" },
      { status: 500 }
    );
  }
}