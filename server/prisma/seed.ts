import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// ─── Database Seed ──────────────────────────────────────
// Creates initial admin user and sample exam data

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ── Create Admin User ─────────────────────────────────
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      fullName: "Administrator",
      role: "ADMIN",
      email: "admin@examinator.local",
    },
  });
  console.log(`  ✅ Admin created: ${admin.username} (password: admin123)`);

  // ── Create Operator User ──────────────────────────────
  const operatorPassword = await hash("operator123", 12);
  const operator = await prisma.user.upsert({
    where: { username: "operator" },
    update: {},
    create: {
      username: "operator",
      password: operatorPassword,
      fullName: "Operator Proctor",
      role: "OPERATOR",
      email: "operator@examinator.local",
    },
  });
  console.log(`  ✅ Operator created: ${operator.username} (password: operator123)`);

  // ── Create Sample Students ────────────────────────────
  const studentPassword = await hash("siswa123", 12);
  const students = [];

  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { username: `siswa${i}` },
      update: {},
      create: {
        username: `siswa${i}`,
        password: studentPassword,
        fullName: `Siswa ${i}`,
        role: "STUDENT",
        nisn: `00${i}234567${i}`,
        kelas: "XII RPL 1",
      },
    });
    students.push(student);
  }
  console.log(`  ✅ ${students.length} students created (password: siswa123)`);

  // ── Create Sample Exam ────────────────────────────────
  const exam = await prisma.exam.upsert({
    where: { id: "sample-exam-1" },
    update: {},
    create: {
      id: "sample-exam-1",
      title: "Ujian Pemrograman Dasar",
      description: "Ujian tengah semester mata pelajaran Pemrograman Dasar kelas XII RPL",
      subject: "Pemrograman Dasar",
      duration: 60,
      active: true,
      passingScore: 70,
      shuffle: true,
    },
  });
  console.log(`  ✅ Sample exam created: ${exam.title}`);

  // ── Create Sample Questions ───────────────────────────
  const questions = [
    {
      text: "Apa kepanjangan dari HTML?",
      options: [
        { text: "Hyper Text Markup Language", isCorrect: true },
        { text: "High Tech Modern Language", isCorrect: false },
        { text: "Home Tool Markup Language", isCorrect: false },
        { text: "Hyperlinks and Text Markup Language", isCorrect: false },
      ],
    },
    {
      text: "Manakah yang merupakan bahasa pemrograman?",
      options: [
        { text: "HTML", isCorrect: false },
        { text: "CSS", isCorrect: false },
        { text: "JavaScript", isCorrect: true },
        { text: "SQL", isCorrect: false },
      ],
    },
    {
      text: "Apa output dari console.log(typeof null) di JavaScript?",
      options: [
        { text: '"null"', isCorrect: false },
        { text: '"undefined"', isCorrect: false },
        { text: '"object"', isCorrect: true },
        { text: '"boolean"', isCorrect: false },
      ],
    },
    {
      text: "CSS digunakan untuk...",
      options: [
        { text: "Membuat struktur halaman web", isCorrect: false },
        { text: "Mengatur tampilan dan layout halaman web", isCorrect: true },
        { text: "Membuat logika program", isCorrect: false },
        { text: "Mengakses database", isCorrect: false },
      ],
    },
    {
      text: "Tag HTML yang digunakan untuk membuat link adalah...",
      options: [
        { text: "<link>", isCorrect: false },
        { text: "<a>", isCorrect: true },
        { text: "<href>", isCorrect: false },
        { text: "<url>", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    await prisma.question.create({
      data: {
        examId: exam.id,
        text: questions[i].text,
        type: "MULTIPLE_CHOICE",
        points: 20,
        order: i + 1,
        options: {
          create: questions[i].options.map((opt, idx) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: idx,
          })),
        },
      },
    });
  }
  console.log(`  ✅ ${questions.length} questions created\n`);

  console.log("🎉 Seed completed successfully!");
  console.log("\n  Login credentials:");
  console.log("  ┌──────────────┬──────────────┬─────────────┐");
  console.log("  │ Role         │ Username     │ Password    │");
  console.log("  ├──────────────┼──────────────┼─────────────┤");
  console.log("  │ Admin        │ admin        │ admin123    │");
  console.log("  │ Operator     │ operator     │ operator123 │");
  console.log("  │ Student      │ siswa1-5     │ siswa123    │");
  console.log("  └──────────────┴──────────────┴─────────────┘\n");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
