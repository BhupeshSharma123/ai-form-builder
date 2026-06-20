import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { title, description, sections, settings, status } = body;

    // Ensure user exists in users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      await supabase.from("users").insert({
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        avatar: user.user_metadata?.avatar_url || null,
        ai_credits: 50,
        plan: "FREE",
      });
    }

    // Create form using Supabase
    const { data: form, error } = await supabase
      .from("forms")
      .insert({
        id: crypto.randomUUID(),
        title: title || "Untitled Form",
        description,
        sections: sections || [],
        settings: settings || {},
        status: status?.toUpperCase() || "DRAFT",
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { message: "Failed to create form" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { data: forms, error } = await supabase
      .from("forms")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ forms });
  } catch (error: any) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { message: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}