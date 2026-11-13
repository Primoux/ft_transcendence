import type { Prisma } from "../../../generated/client.ts";
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
};
