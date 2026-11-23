import { Message, Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

const DEFAULT_CONVERSATION_LIMIT = 20;

export const messageRepository = {
  async create(data: Prisma.MessageCreateInput) {
    return prisma.message.create({ data });
  },
  findById(id: string) {
    return prisma.message.findUnique({ where: { id } });
  },
  findConversation(
    userId1: string,
    userId2: string,
    options?: { limit?: number; cursor?: string },
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? DEFAULT_CONVERSATION_LIMIT,
      ...(options?.cursor && {
        cursor: { id: options.cursor },
        skip: 1,
      }),
    });
  },
  deleteById(id: string) {
    return prisma.message.delete({ where: { id } });
  },
};
