import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Fetch all carousel images
export async function GET() {
  try {
    const db = getDb();
    const images = db.prepare(`
      SELECT id, imageUrl, sortOrder, createdAt
      FROM carousel_images
      ORDER BY sortOrder ASC, createdAt ASC
    `).all();
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Add new carousel image
export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const db = getDb();
    // Get max sortOrder
    const maxSort = db.prepare(`SELECT COALESCE(MAX(sortOrder), -1) as max FROM carousel_images`).get() as { max: number };
    const newSortOrder = maxSort.max + 1;

    const result = db.prepare(`
      INSERT INTO carousel_images (imageUrl, sortOrder)
      VALUES (?, ?)
    `).run(imageUrl, newSortOrder);

    const newImage = db.prepare(`
      SELECT id, imageUrl, sortOrder, createdAt
      FROM carousel_images
      WHERE id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ image: newImage }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove carousel image
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(`DELETE FROM carousel_images WHERE id = ?`).run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
