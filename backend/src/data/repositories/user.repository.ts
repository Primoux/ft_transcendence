import { OtpType, type Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const userRepository = {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  // user.email only set once verified : no need to filter
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {email},
      omit: {email: false}
    })
  },

  async findForAuthByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      omit: { passwordHash: false },
    });
  },
  async findForAuthById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: false },
    });
  },
  async findAll() {
    return prisma.user.findMany();
  },
  async updateById(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
  async countAll() {
    return prisma.user.count();
  },
  async countByPrivateStatus(isPrivate: boolean) {
    return prisma.user.count({ where: { privateProfile: isPrivate } });
  },
  async findByOAuthAccount(provider: string, providerAccountId: string) {
    const account = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },  // the @@id([provider, providerAccountId])
      select: { user: true },
    });
    return account?.user ?? null;
  },

  async createWithOAuthAccount(username: string, provider: string, providerAccountId: string) {
    return prisma.user.create({
      data: {
        username,
        oauthAccounts: { create: { provider, providerAccountId } },
      },
    });
  },

  async findMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      omit: { email: false }
    });
  },

  async confirmEmail(userId: string, email: string) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { email, emailVerifiedAt: new Date() }
      }),
      prisma.otpVerification.deleteMany({ where: { userId, type: OtpType.EMAIL_IS_VALID } })
    ])
  },

  async purgeUnverified(olderThan: Date) {
    await prisma.user.deleteMany({
      where: {
        emailVerifiedAt: null,
        createdAt: {
          lt: new Date(olderThan)
        },
        oauthAccounts: {none: {}}
      }
    })
  }
};
