import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const result = await query<
      {
        id: number;
        title: string;
        completed: boolean;
        created_at: string;
      }
    >(
      "UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING id, title, completed, created_at",
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error toggling todo", error);
    return NextResponse.json(
      { error: "Failed to toggle todo" },
      { status: 500 },
    );
  }
}

