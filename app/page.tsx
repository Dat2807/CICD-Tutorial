import { query } from "@/lib/db";
import { TodoPage } from "@/components/TodoPage";

export default async function Home() {
  const result = await query<{
    id: number;
    title: string;
    completed: boolean;
    created_at: string;
  }>("SELECT id, title, completed, created_at FROM todos ORDER BY created_at DESC");

  return <TodoPage initialTodos={result.rows} />;
}
