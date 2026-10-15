import { prisma } from "../prisma";

export const userRepository = {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
  },
};
