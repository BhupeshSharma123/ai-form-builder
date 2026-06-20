import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const supabase = await createClient();

    const { data: form, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (error || !form) {
      return NextResponse.json(
        { message: "Form not found" },
        { status: 404 }
      );
    }

    // Check if form is published
    if (form.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Form is not available" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        sections: form.sections,
        settings: form.settings,
        status: form.status.toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { message: "Failed to fetch form" },
      { status: 500 }
    );
  }
}