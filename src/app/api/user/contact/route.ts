import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/user/contact - Get user's contact messages
export async function GET() {
  try {
    const session = await requireAuth();
    const messages = await db.contactMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/user/contact - Create a new contact message
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be 200 characters or less" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be 5000 characters or less" },
        { status: 400 }
      );
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        userId: session.userId,
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
      },
    });

    return NextResponse.json({ message: contactMessage }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
