import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const userRepository = {
  async createUser(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data });
  },

  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  },
  async findByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username } });
  },
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },
  async findAll() {
    return await prisma.user.findMany();
  },
};
