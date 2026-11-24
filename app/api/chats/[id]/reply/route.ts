import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AUTO_REPLIES: Record<string, string[]> = {
  arisa: [
    "That is so true! I think exploring the details of our environment is what truly connects us to our work.",
    "Interesting point! On my substack, I explore how local Tokyo culture shapes these exact kinds of interactions.",
    "Thanks for reaching out! Let me know if you want to collaborate on a guest post sometime.",
    "Fascinating thoughts. I've been writing a draft along these lines. I'll share it with you once it's ready!",
  ],
  stoic: [
    "Remember the words of Marcus Aurelius: 'You have power over your mind - not outside events. Realize this, and you will find strength.'",
    "We suffer more often in imagination than in reality. Keep practicing clarity in your work and thoughts.",
    "Very well said. Controlling what is within our reach is the first rule of modern living.",
    "Wisdom is the ultimate good. Thank you for starting this thread. Let us continue to learn.",
  ],
  courtney: [
    "Oh wow, I've been thinking about this too! Tech communities thrive when we keep conversations open and honest.",
    "Perfect! I'm planning to release my next article about this on Wednesday. Love to hear your feedback then.",
    "Awesome idea! Let's schedule a chat next week to discuss this further.",
    "Building things in public is challenging but so rewarding. Let me know if you run into any blocks!",
  ],
  inkspace: [
    "Thank you for reaching out to the InkSpace team! We are here to support your creative journey.",
    "Your feedback is highly valued! We are continuously working on adding new features to improve your reading and writing experience.",
    "Great to have you on board! If you have any feature suggestions, feel free to drop them here.",
  ],
};

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

    const chatId = params.id;
    const { triggerText } = await request.json();

    // Fetch the chat to find the other participant
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Find the other participant (the mock sender)
    const otherParticipant = chat.participants.find((p) => p.id !== session.user.id);
    if (!otherParticipant) {
      return NextResponse.json({ error: "No recipient found" }, { status: 400 });
    }

    const username = otherParticipant.username.toLowerCase();
    const replies = AUTO_REPLIES[username] || [
      "Thanks for your message! I will get back to you as soon as I can.",
      "That sounds great! Let's connect soon.",
    ];

    // Select a random reply
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    // Create the reply message in DB
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: otherParticipant.id,
        text: replyText,
      },
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[POST /api/chats/[id]/reply]", error);
    return NextResponse.json({ error: "Failed to create auto response" }, { status: 500 });
  }
}
