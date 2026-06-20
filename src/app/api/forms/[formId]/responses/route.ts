import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { message: "Invalid response data" },
        { status: 400 }
      );
    }

    // Check if form exists and is published
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, status")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { message: "Form not found" },
        { status: 404 }
      );
    }

    // Check if form is published (case-insensitive)
    const formStatus = (form.status || "").toUpperCase();
    if (formStatus !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Form is not accepting responses" },
        { status: 403 }
      );
    }

    // Get client info
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create response
    const { data: response, error: responseError } = await supabase
      .from("responses")
      .insert({
        form_id: formId,
        data,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (responseError) throw responseError;

    return NextResponse.json({
      message: "Response submitted successfully",
      responseId: response.id,
    });
  } catch (error: any) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { message: "Failed to submit response" },
      { status: 500 }
    );
  }
}