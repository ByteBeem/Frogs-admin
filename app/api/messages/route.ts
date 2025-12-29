import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json([], { status: 200 });
  }

  const result = await pool.query(
    `SELECT id, conversation_id AS "conversationId",
            sender, text, created_at AS "createdAt"
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return NextResponse.json(result.rows);
}
