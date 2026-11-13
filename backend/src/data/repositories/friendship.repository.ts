import { FriendshipStatus, Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const friendshipRepository = {
  async create(senderId: string, receiverId: string) {
    return prisma.friendship.create({
      data: {
        senderId,
        receiverId,
      },
    });
  },
  async updateById(id: string, data: Prisma.FriendshipUpdateInput) {
    return prisma.friendship.update({
      where: { id },
      data,
    });
  },
  async findById(id: string) {
    return prisma.friendship.findUnique({ where: { id } });
  },
  async findByUsers(userId1: string, userId2: string) {
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
    });
  },
  async findFriends(userId: string) {
    return prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: FriendshipStatus.ACCEPTED,
      },
    });
  },
  async findPendingRequests(senderId: string) {
    return prisma.friendship.findMany({
      where: {
        senderId,
        status: FriendshipStatus.ACCEPTED,
      },
    });
  },
};
