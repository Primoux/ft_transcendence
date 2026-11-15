import type { Prisma, UserAchievement } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export type UnlockedAchievement = Prisma.UserAchievementGetPayload<{
  include: { achievement: true };
}>;

export const achievementRepository = {
  async unlockForUser(
    userId: string,
    achievementId: string,
  ): Promise<UserAchievement> {
    return prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });
  },
  async hasUserUnlocked(userId: string, achievementId: string) {
    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    return userAchievement !== null;
  },
  async findById(id: string) {
    return prisma.achievement.findUnique({ where: { id } });
  },
  async findAchievementsByUserId(
    userId: string,
  ): Promise<UnlockedAchievement[]> {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
  },
  async findAll() {
    return prisma.achievement.findMany();
  }
};
