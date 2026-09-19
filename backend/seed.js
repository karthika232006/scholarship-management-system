// Run with: npm run seed
// Creates default staff accounts and a couple of sample scholarships so you
// can log in and test the full workflow immediately.
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Scholarship = require("./models/Scholarship");

const run = async () => {
  await connectDB();

  const staff = [
    { name: "System Admin", email: "admin@scholarship.edu", password: "Admin@123", role: "admin" },
    { name: "Dept Verifier", email: "verifier@scholarship.edu", password: "Verify@123", role: "verifier", department: "Computer Science" },
    { name: "Finance Approver", email: "approver@scholarship.edu", password: "Approve@123", role: "approver", department: "Finance" },
    { name: "Test Student", email: "student@scholarship.edu", password: "Student@123", role: "student" },
  ];

  const created = {};
  for (const s of staff) {
    let user = await User.findOne({ email: s.email });
    if (!user) {
      user = await User.create(s);
      console.log(`Created ${s.role}: ${s.email} / ${s.password}`);
    } else {
      console.log(`Already exists: ${s.email}`);
    }
    created[s.role] = user;
  }

  const sampleScholarships = [
    {
      title: "Merit Excellence Scholarship",
      description: "Awarded to students with outstanding academic performance.",
      eligibility: "CGPA of 8.5 or above, full-time enrollment",
      amount: 50000,
      department: "All",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdBy: created.admin._id,
    },
    {
      title: "Need-Based Financial Aid",
      description: "Support for students from low-income households.",
      eligibility: "Annual family income below 200,000",
      amount: 30000,
      department: "All",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: created.admin._id,
    },
  ];

  for (const sch of sampleScholarships) {
    const exists = await Scholarship.findOne({ title: sch.title });
    if (!exists) {
      await Scholarship.create(sch);
      console.log(`Created scholarship: ${sch.title}`);
    }
  }

  console.log("\nSeed complete. You can now log in with any of the accounts above.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
