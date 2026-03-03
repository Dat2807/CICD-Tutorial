import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query<
      {
        id: number;
        title: string;
        completed: boolean;
        created_at: string;
      }
    >(
      "SELECT id, title, completed, created_at FROM todos ORDER BY created_at DESC",
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    const result = await query<
      {
        id: number;
        title: string;
        completed: boolean;
        created_at: string;
      }
    >(
      "INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at",
      [title],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating todo", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 },
    );
  }
}

