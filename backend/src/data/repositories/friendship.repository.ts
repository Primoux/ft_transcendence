import {
  User,
  Friendship,
  FriendshipStatus,
  Prisma,
} from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export interface FriendSummary {
  friendshipId: string;
  friend: Omit<User, "passwordHash">;
  connectedAt: Date;
}

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
  async findFriends(userId: string) : Promise<FriendSummary[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
    return friendships.map((friendship): FriendSummary  => {
      const friendProfile =
        friendship.receiverId === userId
          ? friendship.sender
          : friendship.receiver;
      return {
        friendshipId: friendship.id,
        friend: friendProfile,
        connectedAt: friendship.updatedAt,
      };
    });
  },
  async findPendingRequests(receiverId: string): Promise<Friendship[]> {
    return prisma.friendship.findMany({
      where: {
        receiverId,
        status: FriendshipStatus.ACCEPTED,
      },
    });
  },
  async delete(id: string) {
    return prisma.friendship.delete({
      where: { id },
    });
  },
};
