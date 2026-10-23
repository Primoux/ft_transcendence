import type { Prisma } from "../../../generated/client.ts";
import { prisma } from "../prisma.ts";

export const userRepository = {
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },
  async findAll() {
    return prisma.user.findMany();
  },
};