// app/lib/prisma.js
import { PrismaClient } from '@prisma/client';


let prisma;

// Evitar crear muchos clientes en dev (hot reload)
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
