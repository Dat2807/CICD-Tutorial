import { vi, describe, it, expect } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
}));

import { query } from "@/lib/db";

const mockQuery = vi.mocked(query);

describe("GET /api/todos", () => {
  it("returns todos from db", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          title: "First todo",
          completed: false,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
      rowCount: 1,
      command: "SELECT",
      fields: [],
      oid: 0,
    } as Awaited<ReturnType<typeof query>>);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: 1,
      title: "First todo",
      completed: false,
    });
  });

  it("returns empty array when no todos", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
      command: "SELECT",
      fields: [],
      oid: 0,
    } as Awaited<ReturnType<typeof query>>);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });
});

describe("POST /api/todos", () => {
  it("returns 400 when title is missing", async () => {
    mockQuery.mockClear();
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Title is required");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when title is empty string", async () => {
    mockQuery.mockClear();
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ title: "   " }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 201 and created todo when title is valid", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          title: "New task",
          completed: false,
          created_at: "2024-01-02T00:00:00Z",
        },
      ],
      rowCount: 1,
      command: "INSERT",
      fields: [],
      oid: 0,
    } as Awaited<ReturnType<typeof query>>);

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ title: "New task" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toMatchObject({
      id: 2,
      title: "New task",
      completed: false,
    });
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at",
      ["New task"],
    );
  });
});
