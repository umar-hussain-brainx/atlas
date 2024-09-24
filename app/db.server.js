import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

export default prisma;

export async function createCustomForm(data) {
  return prisma.customForm.create({
    data,
  });
}

export async function getCustomForms() {
  return prisma.customForm.findMany();
}

export async function updateCustomForm(id, data) {
  return prisma.customForm.update({
    where: { id: parseInt(id) },
    data,
  });
}

export async function deleteCustomForm(id) {
  console.log("Deleting form with id:", id); // Debugging log
  return prisma.customForm.delete({
    where: { id: parseInt(id) },
  });
}
