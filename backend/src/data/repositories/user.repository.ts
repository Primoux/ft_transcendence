import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

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
