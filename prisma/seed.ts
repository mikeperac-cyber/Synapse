import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding OmniSphere OS operational database...");

  // Clean existing data
  await prisma.agentActionLog.deleteMany();
  await prisma.entityRelation.deleteMany();
  await prisma.entityTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.timeLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.project.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.voiceMemo.deleteMany();
  await prisma.note.deleteMany();
  await prisma.instagramPost.deleteMany();
  await prisma.repoBundle.deleteMany();

  // 1. Tags
  const tagUrgent = await prisma.tag.create({ data: { name: "urgent", color: "#EF4444" } });
  const tagAcademy = await prisma.tag.create({ data: { name: "ielts-prep", color: "#0F766E" } });
  const tagDev = await prisma.tag.create({ data: { name: "react-perf", color: "#0284C7" } });
  const tagFinance = await prisma.tag.create({ data: { name: "financial-q3", color: "#10B981" } });
  const tagSocial = await prisma.tag.create({ data: { name: "social-growth", color: "#F59E0B" } });
  const tagAI = await prisma.tag.create({ data: { name: "ai-agents", color: "#8B5CF6" } });
  const tagGrammar = await prisma.tag.create({ data: { name: "grammar-drill", color: "#EC4899" } });

  // 2. Projects
  const projCore = await prisma.project.create({
    data: {
      title: "OmniSphere Core Engine",
      description: "Autonomous multi-domain operational cockpit and local-first execution system.",
      stage: "BUILD",
      velocityScore: 94.0,
      healthScore: 96.0,
      targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      budget: 15000.0,
      hourlyRate: 95.0,
      markdownDoc: `# Architecture & Flow\n- Client-first local SQLite with Prisma ORM\n- Autonomostly background daemon executing 4 reconciliation cycles\n- Web Audio recording with real-time waveform visualization\n- Multi-repo AST bundler & LLM prompt packager\n\n\`\`\`mermaid\ngraph LR\n  UI[Dashboard UI] --> Store[Zustand Store]\n  Store --> DB[(SQLite / Prisma)]\n  Worker[Autonomous Worker] --> DB\n\`\`\``,
    },
  });

  const projAcademy = await prisma.project.create({
    data: {
      title: "Apex Language Academy",
      description: "High-performance IELTS Band 8.0+ and C1 Academic English coaching hub.",
      stage: "TRACK",
      velocityScore: 89.0,
      healthScore: 92.0,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budget: 10000.0,
      hourlyRate: 75.0,
      markdownDoc: `# Educational Framework\n- Target diagnostic testing for speaking & writing\n- Automatic homework generation triggered by lesson weak spots\n- Deadline alerts sent 24 hours prior to scheduled lesson`,
    },
  });

  const projGateway = await prisma.project.create({
    data: {
      title: "Distributed Micro-Mesh Gateway",
      description: "Zero-latency WASM sandbox and secure tunnel gateway for client-side toolchains.",
      stage: "IDEATION",
      velocityScore: 78.0,
      healthScore: 84.0,
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      budget: 20000.0,
      hourlyRate: 110.0,
      markdownDoc: `# Distributed Mesh\nExploring lightweight client-side sandboxes for isolated JS execution and encrypted data sync.`,
    },
  });

  // 3. Students
  const studentElena = await prisma.student.create({
    data: {
      name: "Elena Rostova",
      email: "elena.rostova@example.com",
      phone: "+1 (555) 234-8901",
      level: "C1 Academic",
      targetExamDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      ratePerHour: 75.0,
      status: "ACTIVE",
      diagnosticNotes: "High grammatical accuracy; needs targeted drills on negative inversions and Part 3 abstract discourse flow.",
    },
  });

  const studentMarcus = await prisma.student.create({
    data: {
      name: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "+1 (555) 345-6789",
      level: "IELTS Band 7.5 Target",
      targetExamDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      ratePerHour: 70.0,
      status: "ACTIVE",
      diagnosticNotes: "Broad lexicon; needs tighter paragraph cohesion and passive voice consistency in Task 1 dynamic chart reports.",
    },
  });

  const studentSophie = await prisma.student.create({
    data: {
      name: "Sophie Chen",
      email: "sophie.chen@example.com",
      phone: "+1 (555) 456-7890",
      level: "Upper-Intermediate",
      targetExamDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ratePerHour: 65.0,
      status: "ACTIVE",
      diagnosticNotes: "Developing academic register; practicing formal linkers (Albeit, Whereas, In spite of) and eliminating fragments.",
    },
  });

  // 4. Lessons
  const lessonElenaUpcoming = await prisma.lesson.create({
    data: {
      studentId: studentElena.id,
      title: "Advanced Inversion & Discourse Flow",
      scheduledAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // in 18 hours (upcoming!)
      durationMinutes: 60,
      status: "SCHEDULED",
      objectives: "Master negative adverbial inversions (Seldom, Rarely, Under no circumstances) in formal oral argumentation.",
      vocabDrillJson: JSON.stringify([
        { term: "Seldom have I witnessed", definition: "Emphatic inversion for rare occurrences", example: "Seldom have I witnessed such organizational resilience." },
        { term: "Not only did they succeed, but", definition: "Dual clause correlative inversion", example: "Not only did they meet the target, but they also exceeded expectations." },
        { term: "Under no circumstances should", definition: "Absolute prohibition structure", example: "Under no circumstances should safety protocols be bypassed." },
      ]),
      feeAmount: 75.0,
      isPaid: false,
    },
  });

  const lessonMarcusCompleted = await prisma.lesson.create({
    data: {
      studentId: studentMarcus.id,
      title: "IELTS Academic Task 1 Data Synthesis",
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // completed yesterday
      durationMinutes: 60,
      status: "COMPLETED",
      objectives: "Synthesizing multi-variable trend charts without repetitive verbs.",
      feeAmount: 70.0,
      isPaid: true,
    },
  });

  const lessonSophieUpcoming = await prisma.lesson.create({
    data: {
      studentId: studentSophie.id,
      title: "Cohesion & Complex Clauses in Academic Writing",
      scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // in 3 days
      durationMinutes: 60,
      status: "SCHEDULED",
      objectives: "Eliminating run-on sentences and applying concession structures accurately.",
      feeAmount: 65.0,
      isPaid: false,
    },
  });

  // 5. Homework
  const hwElenaPending = await prisma.homework.create({
    data: {
      studentId: studentElena.id,
      lessonId: lessonElenaUpcoming.id,
      title: "Essay: The Socio-Economic Impact of Autonomous AI",
      description: "Write a 350-word academic essay incorporating at least 3 negative inversion structures and 2 concession clauses.",
      assignedDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // Due in 12 hours! Within 24h nag window!
      status: "ASSIGNED",
      weakSpotCategory: "Inversion & Concession Clauses",
      reminderQueued: false,
    },
  });

  const hwMarcusGraded = await prisma.homework.create({
    data: {
      studentId: studentMarcus.id,
      lessonId: lessonMarcusCompleted.id,
      title: "Task 1 Report: Global Renewable Energy Shifts",
      description: "Summarize the chart data comparing solar, wind, and nuclear investments.",
      assignedDate: new Date(Date.now() - 96 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "GRADED",
      score: 95.0,
      weakSpotCategory: "Trend Vocabulary",
      reminderQueued: true,
    },
  });

  const hwSophieAssigned = await prisma.homework.create({
    data: {
      studentId: studentSophie.id,
      lessonId: lessonSophieUpcoming.id,
      title: "Sentence Transformation Drills (Set B)",
      description: "Rewrite 15 informal sentences into formal academic passive formulations.",
      assignedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      status: "ASSIGNED",
      weakSpotCategory: "Academic Passive Voice",
      reminderQueued: false,
    },
  });

  // 6. Tasks & Time Logs
  const task1 = await prisma.task.create({
    data: {
      title: "Benchmark SQLite query latency in Next.js Server Components",
      description: "Test index coverage and latency across 5,000 synthetic records.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      estimatedMinutes: 60,
      trackedMinutes: 55,
      projectId: projCore.id,
    },
  });

  await prisma.timeLog.create({
    data: {
      taskId: task1.id,
      projectId: projCore.id,
      startTime: new Date(Date.now() - 15 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 14 * 60 * 60 * 1000),
      durationMinutes: 55,
      billableAmount: (55 / 60) * 95.0,
      note: "Validated query plan and index performance on polymorphic entity tags.",
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Finalize IELTS Speaking Part 2 Diagnostic for Elena Rostova",
      description: "Review audio recording sample and calibrate fluency and lexical resource metrics.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // Due today!
      estimatedMinutes: 45,
      trackedMinutes: 25,
      projectId: projAcademy.id,
      studentId: studentElena.id,
    },
  });

  await prisma.timeLog.create({
    data: {
      taskId: task2.id,
      projectId: projAcademy.id,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      durationMinutes: 25,
      billableAmount: (25 / 60) * 75.0,
      note: "Logged 3 idiomatic correction points for Elena.",
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Audit Q3 SaaS subscriptions and recurring server licenses",
      description: "Identify unused dev dependencies and optimize cloud droplet costs.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      estimatedMinutes: 90,
      trackedMinutes: 0,
      projectId: projCore.id,
    },
  });

  const taskStale = await prisma.task.create({
    data: {
      title: "Investigate legacy micro-service AST parsing edge cases",
      description: "Evaluate edge case tokens in unminified bundle files.",
      status: "IN_PROGRESS",
      priority: "LOW",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      estimatedMinutes: 120,
      trackedMinutes: 15,
      projectId: projGateway.id,
      isStale: false, // Will be audited by autonomous daemon
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
  });

  // 7. Realistic Goals
  await prisma.goal.create({
    data: {
      title: "Expand Academy to 8 Active C1 / IELTS Retainer Students",
      targetCategory: "ACADEMY",
      targetHoursPerWeek: 12.0,
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      smartSpecific: "Enroll 8 dedicated students for 2 weekly sessions each",
      smartMeasurable: "Monthly recurring educational retainer revenue of $4,800+",
      smartAchievable: "Currently at 3 active students; pipeline has 4 qualified inquiries",
      smartRelevant: "Directly funds product engineering and operational autonomy",
      smartTimeBound: "Target reach date: end of next month",
      realismStatus: "REALISTIC",
      rationale: "Requires 12h/week instructional & prep time. Well within 40h human ceiling.",
    },
  });

  await prisma.goal.create({
    data: {
      title: "Ship OmniSphere OS Multi-Repo & Autonomous Engine",
      targetCategory: "DEVELOPMENT",
      targetHoursPerWeek: 20.0,
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      smartSpecific: "Complete all 6 integrated modules, background daemon, and local SQLite persistence",
      smartMeasurable: "100% type-safe build, seed verification, all autonomous cron cycles active",
      smartAchievable: "Core schema and components architected; 20h focused build time allocated",
      smartRelevant: "The central nervous system for all personal and business workflows",
      smartTimeBound: "Deliver MVP within 14 days",
      realismStatus: "REALISTIC",
      rationale: "Focused 20h weekly allocation leaves 8h buffer for academy and personal time.",
    },
  });

  await prisma.goal.create({
    data: {
      title: "Author & Publish 4 Comprehensive Engineering Textbooks Simultaneously",
      targetCategory: "DEVELOPMENT",
      targetHoursPerWeek: 35.0,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      smartSpecific: "Write 1,500 pages on distributed systems, compilers, and machine learning",
      smartMeasurable: "4 finished manuscripts ready for print in 30 days",
      smartAchievable: "Requires 35h/week on top of existing 32h commitments = 67h/week total load",
      smartRelevant: "Personal prestige",
      smartTimeBound: "Unrealistic 30-day timeline",
      realismStatus: "OVERCAPACITY",
      rationale: "⚠️ S.M.A.R.T. Audit Alert: Projected hours exceed maximum sustainable weekly cognitive ceiling. Flagged as Overcapacity.",
    },
  });

  // 8. Financial Records & Matrix
  // Debts
  await prisma.financialRecord.create({
    data: {
      type: "DEBT",
      category: "STUDENT_LOAN",
      description: "Undergrad & Master's Academic Tuition Loan",
      amount: 13850.0,
      aprRate: 4.65,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      isPaid: false,
    },
  });

  await prisma.financialRecord.create({
    data: {
      type: "DEBT",
      category: "HARDWARE_FINANCE",
      description: "Apple Developer Workstation Hardware (0% APR)",
      amount: 1420.0,
      aprRate: 0.0,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      isPaid: false,
    },
  });

  // Expenses
  await prisma.financialRecord.create({
    data: {
      type: "EXPENSE",
      category: "SERVER",
      description: "Vercel & Supabase Cloud Deployment Tier",
      amount: 45.0,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      isPaid: true,
      projectId: projCore.id,
    },
  });

  await prisma.financialRecord.create({
    data: {
      type: "EXPENSE",
      category: "SOFTWARE_TOOL",
      description: "OpenAI API & LLM Inference Tokens",
      amount: 180.0,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      isPaid: true,
      projectId: projCore.id,
    },
  });

  // Incomes
  await prisma.financialRecord.create({
    data: {
      type: "INCOME",
      category: "STUDENT_LESSON",
      description: "Marcus Vance - IELTS Task 1 Mastery Lesson Fee",
      amount: 70.0,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRecurring: false,
      isPaid: true,
      studentId: studentMarcus.id,
      projectId: projAcademy.id,
    },
  });

  await prisma.financialRecord.create({
    data: {
      type: "INCOME",
      category: "CLIENT_CONTRACT",
      description: "Enterprise Frontend Architecture Consultation",
      amount: 2850.0,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isRecurring: false,
      isPaid: false,
      projectId: projCore.id,
    },
  });

  // 9. Voice Memos
  await prisma.voiceMemo.create({
    data: {
      title: "Academy Curriculum Strategy & Student Follow-ups",
      durationSeconds: 48,
      transcription: "Need to prepare the inversion grammar drill for Elena before tomorrow morning. Also review Sophie's passive voice report. Follow up with Marcus on IELTS exam date booking.",
      actionItemsJson: JSON.stringify([
        "Prepare inversion grammar drill for Elena Rostova",
        "Review Sophie's passive voice report and log weak spots",
        "Follow up with Marcus Vance on IELTS test date registration",
      ]),
      clusteredTagsJson: JSON.stringify(["ielts-prep", "grammar-drill", "urgent"]),
    },
  });

  await prisma.voiceMemo.create({
    data: {
      title: "OmniSphere Autonomous Daemon Architecture Memo",
      durationSeconds: 36,
      transcription: "Make sure the reconciler runs automatically on completed lessons so manual invoicing is never needed. The capacity guardian should throw warnings when weekly hours exceed forty.",
      actionItemsJson: JSON.stringify([
        "Verify ledger reconciler creates draft income rows",
        "Implement capacity guardian 40-hour threshold alerts",
      ]),
      clusteredTagsJson: JSON.stringify(["ai-agents", "react-perf"]),
    },
  });

  // 10. Notes with Backlinks
  await prisma.note.create({
    data: {
      title: "OmniSphere Architecture Blueprint",
      content: `# Unified Operating System\n\nOmniSphere connects multiple discrete workflows into one fluid canvas:\n- **Academy Engine**: Links directly to [[Elena Rostova]] and [[Marcus Vance]].\n- **Project Pipeline**: Tracks progress on [[OmniSphere Core Engine]].\n- **Financial Health**: Audits burn rates and projected contracts.\n\nAll entities share universal polymorphic tags. No silos.`,
      backlinksJson: JSON.stringify(["Elena Rostova", "Marcus Vance", "OmniSphere Core Engine"]),
      pinned: true,
    },
  });

  await prisma.note.create({
    data: {
      title: "C1 Academic English Curriculum Matrix",
      content: `# IELTS Band 8.5 Linguistic Inventory\n\n1. **Inversions**: Seldom, Scarcely, Not only, On no account.\n2. **Concessions**: Albeit, In spite of, Notwithstanding.\n3. **Hedging Devices**: It could be argued that, Evidence tentatively points towards.\n\nLinked with active student [[Elena Rostova]].`,
      backlinksJson: JSON.stringify(["Elena Rostova"]),
      pinned: false,
    },
  });

  // 11. Instagram Posts
  await prisma.instagramPost.create({
    data: {
      hook: "Stop saying 'Very important' in your IELTS essays. Use these 5 C1 alternatives instead:",
      body: "1. Paramount ('Of paramount significance')\n2. Vital ('A vital prerequisite')\n3. Pivotal ('Plays a pivotal role')\n4. Indispensable ('An indispensable asset')\n5. Crucial ('Of crucial consequence')\n\nSave this for your next writing session!",
      cta: "Comment 'C1' to receive our free academic vocabulary reference guide!",
      visualAssetListJson: JSON.stringify([
        "Nordic minimalist title slide with teal accent",
        "Comparison breakdown slide (A2 vs C1)",
        "Collocation example sentences slide",
        "Save & share call-to-action slide",
      ]),
      audioTrack: "Deep Focus Ambient Piano (Nordic Waves)",
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 26 * 60 * 60 * 1000),
      hashtagClusterJson: JSON.stringify(["#ieltswriting", "#c1english", "#academicvocabulary", "#englishteacher", "#ieltsband8"]),
      charCount: 290,
      estScore: 94.5,
      studentAcquisitionGoal: "Acquire 2 new C1 Speaking candidates",
    },
  });

  await prisma.instagramPost.create({
    data: {
      hook: "How I built an autonomous background agent loop in 50 lines of TypeScript:",
      body: "Most productivity tools force you into manual data entry.\n\nIn OmniSphere OS, our autonomous daemon:\n1. Closes completed lessons into cash flow\n2. Flags stale tasks (>3 days)\n3. Nags pending homework 24h before lessons\n4. Prevents burn-out via capacity audits",
      cta: "Read the full system architecture guide at the link in bio.",
      visualAssetListJson: JSON.stringify([
        "Terminal IDE code snippet with syntax highlighting",
        "Mermaid data flow architecture card",
        "Live autonomous audit log screenshot",
      ]),
      audioTrack: "Cybernetic Synthwave Beat",
      status: "DRAFT",
      hashtagClusterJson: JSON.stringify(["#buildinpublic", "#indiehackers", "#nextjs", "#typescript", "#fullstack"]),
      charCount: 325,
      estScore: 88.0,
      studentAcquisitionGoal: "Attract developer clients for consulting",
    },
  });

  // 12. Repo Bundles
  await prisma.repoBundle.create({
    data: {
      name: "OmniSphere Full Monorepo Context Pack",
      repoUrlsJson: JSON.stringify([
        "https://github.com/omnisphere/core-engine",
        "https://github.com/omnisphere/academy-hub",
      ]),
      directoryStructureJson: JSON.stringify({
        name: "omnisphere-bundle",
        children: [
          { name: "packages/core", size: "48 KB", files: 12 },
          { name: "packages/academy", size: "32 KB", files: 8 },
          { name: "packages/autonomous", size: "18 KB", files: 5 },
        ],
      }),
      fileCount: 35,
      totalSize: 312000,
      tokenEstimate: 78500,
      outputFormat: "ZIP",
    },
  });

  // 13. Polymorphic Tags Linkage
  await prisma.entityTag.create({ data: { tagId: tagUrgent.id, entityType: "TASK", entityId: task2.id } });
  await prisma.entityTag.create({ data: { tagId: tagAcademy.id, entityType: "STUDENT", entityId: studentElena.id } });
  await prisma.entityTag.create({ data: { tagId: tagGrammar.id, entityType: "LESSON", entityId: lessonElenaUpcoming.id } });
  await prisma.entityTag.create({ data: { tagId: tagDev.id, entityType: "PROJECT", entityId: projCore.id } });
  await prisma.entityTag.create({ data: { tagId: tagFinance.id, entityType: "PROJECT", entityId: projCore.id } });
  await prisma.entityTag.create({ data: { tagId: tagSocial.id, entityType: "STUDENT", entityId: studentElena.id } });
  await prisma.entityTag.create({ data: { tagId: tagAI.id, entityType: "PROJECT", entityId: projCore.id } });

  // 14. Initial Agent Action Log
  await prisma.agentActionLog.create({
    data: {
      actionType: "RECONCILE_LEDGER",
      description: "Initialized Autonomous Engine baseline. Verified 1 completed lesson reconciled into ledger.",
      status: "SUCCESS",
      metadataJson: JSON.stringify({ initialReconcile: true }),
    },
  });

  await prisma.agentActionLog.create({
    data: {
      actionType: "CAPACITY_GUARDIAN",
      description: "Capacity Guardian active: 1.3h logged this week (3% of 40h weekly limit). Velocity is healthy.",
      status: "INFO",
      metadataJson: JSON.stringify({ weeklyTrackedHours: 1.3, weeklyTargetHours: 40.0 }),
    },
  });

  console.log("✅ OmniSphere OS operational database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
