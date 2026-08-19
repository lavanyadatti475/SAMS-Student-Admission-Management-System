const bcrypt = require("bcrypt");
const prisma = require("./src/prismaClient");

async function createAdmin() {
  const password = "Admin@123";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      fullName: "Super Admin",
      email: "admin@sams.edu",
      passwordHash: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin created successfully!");
  console.log(admin);

  process.exit();
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});