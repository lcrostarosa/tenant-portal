import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { hash } from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "seed-admin-user-001",
      email: "admin@example.com",
      name: "Admin",
      passwordHash,
      role: "LANDLORD",
    },
  })

  console.log("Seeded admin user:", admin.email, "(id:", admin.id, ")")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
