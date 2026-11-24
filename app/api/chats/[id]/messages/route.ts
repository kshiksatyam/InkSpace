import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const chatId = params.id;

    // Verify user is participant in this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participantIds: {
          has: userId,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 44 });
    }

    // Mark messages from others as read
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[GET /api/chats/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const chatId = params.id;
    const { text } = await request.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    // Verify user is participant
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participantIds: {
          has: userId,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        text: text.trim(),
      },
    });

    // Update chat updatedAt field
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[POST /api/chats/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
