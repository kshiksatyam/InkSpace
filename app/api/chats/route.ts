import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's chats
    let chats = await prisma.chat.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // If user has no chats, let's seed some mock chats to make the app look alive immediately
    if (chats.length === 0) {
      // 1. Ensure mock users exist in the DB
      const mockUserData = [
        {
          name: "Arisa",
          username: "arisa",
          email: "arisa@example.com",
          bio: "Writing about art, culture, and life in Tokyo.",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          initialMessage: "Dr. Arisa here. People like me don't just have hobbies; we are driven by curiosity...",
        },
        {
          name: "The Stoic Manual",
          username: "stoic",
          email: "stoic@example.com",
          bio: "Daily wisdom from Seneca, Epictetus, and Marcus Aurelius.",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          initialMessage: "Stoic rule: The only explainer you'll ever need. Read, reflect, and practice.",
        },
        {
          name: "Courtney's Substack",
          username: "courtney",
          email: "courtney@example.com",
          bio: "Thoughts on tech, writing, and building communities.",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          initialMessage: "Beyond: Dear InkSpace readers, connect with me and let's share ideas on coding!",
        },
        {
          name: "InkSpace Team",
          username: "inkspace",
          email: "team@inkspace.co",
          bio: "Official updates and announcements from the InkSpace team.",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80",
          initialMessage: "Welcome to InkSpace! This is your space. Click here to start your subscriber chat.",
        },
      ];

      for (const m of mockUserData) {
        let mockUser = await prisma.user.findUnique({
          where: { username: m.username },
        });

        if (!mockUser) {
          mockUser = await prisma.user.create({
            data: {
              name: m.name,
              username: m.username,
              email: m.email,
              image: m.image,
              bio: m.bio,
            },
          });
        }

        // Create chat
        const newChat = await prisma.chat.create({
          data: {
            participantIds: [userId, mockUser.id],
          },
        });

        // Link users to chat (implicit many-to-many update if prisma didn't do it)
        await prisma.user.update({
          where: { id: userId },
          data: { chatIds: { push: newChat.id } },
        });
        await prisma.user.update({
          where: { id: mockUser.id },
          data: { chatIds: { push: newChat.id } },
        });

        // Add initial message
        await prisma.message.create({
          data: {
            chatId: newChat.id,
            senderId: mockUser.id,
            text: m.initialMessage,
          },
        });
      }

      // Re-fetch chats
      chats = await prisma.chat.findMany({
        where: {
          participantIds: {
            has: userId,
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    // Format for client consumption
    const formattedChats = chats.map((chat) => {
      // Find other participant
      const otherParticipant = chat.participants.find((p) => p.id !== userId) || {
        id: "deleted",
        name: "Deleted User",
        username: "deleted",
        image: null,
      };

      const lastMessage = chat.messages[0];

      return {
        id: chat.id,
        participant: otherParticipant,
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              createdAt: lastMessage.createdAt.toISOString(),
              senderId: lastMessage.senderId,
              read: lastMessage.read,
            }
          : null,
        unread: lastMessage ? !lastMessage.read && lastMessage.senderId !== userId : false,
      };
    });

    return NextResponse.json(formattedChats);
  } catch (error) {
    console.error("[GET /api/chats]", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
