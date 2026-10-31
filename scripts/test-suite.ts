async function runTestSuite() {
  console.log("🚀 Starting OmniSphere OS Verification Test Suite...\n");

  const baseUrl = "http://localhost:3000";

  // Test 1: GET / (Frontend Cockpit)
  console.log("1. Testing GET / (Main App Shell & Cockpit)...");
  const homeRes = await fetch(`${baseUrl}/`);
  if (!homeRes.ok) throw new Error(`GET / failed with status ${homeRes.status}`);
  const homeHtml = await homeRes.text();
  if (!homeHtml.includes("OmniSphere OS")) {
    throw new Error("Homepage HTML does not contain OmniSphere OS title");
  }
  console.log("   ✅ Homepage loaded successfully (HTML verified)\n");

  // Test 2: GET /api/overview
  console.log("2. Testing GET /api/overview (Operational Dashboard Data)...");
  const overviewRes = await fetch(`${baseUrl}/api/overview`);
  const overview = await overviewRes.json();
  if (!overview.success) throw new Error("GET /api/overview returned failure");
  console.log(`   ✅ Overview metrics: Net Cash: $${overview.data.metrics.netCash}, Runway: ${overview.data.metrics.runwayMonths} mo, Active Tasks: ${overview.data.tasks.length}, Students: ${overview.data.students.length}\n`);

  // Test 3: POST /api/tasks
  console.log("3. Testing POST /api/tasks (Task Creation with Tags)...");
  const taskRes = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Automated Test Task: Calibrate WASM Audio Pipeline",
      description: "Ensure Web Audio analyser node receives microphone input.",
      priority: "URGENT",
      estimatedMinutes: 45,
      tagNames: ["#react-perf", "#urgent"],
    }),
  });
  const taskData = await taskRes.json();
  if (!taskData.success) throw new Error("POST /api/tasks failed");
  const createdTaskId = taskData.task.id;
  console.log(`   ✅ Created Task ID: ${createdTaskId} (${taskData.task.title})\n`);

  // Test 4: POST /api/tasks/[id]/timelog
  console.log("4. Testing POST /api/tasks/[id]/timelog (Active Stopwatch Roll-Up)...");
  const timeRes = await fetch(`${baseUrl}/api/tasks/${createdTaskId}/timelog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      durationMinutes: 45,
      note: "E2E verification stopwatch test run",
    }),
  });
  const timeData = await timeRes.json();
  if (!timeData.success) throw new Error("POST /api/tasks/[id]/timelog failed");
  console.log(`   ✅ Logged 45m. Task tracked minutes: ${timeData.task.trackedMinutes}m, Billable amount: $${timeData.timeLog.billableAmount}\n`);

  // Test 5: POST /api/education/generate-homework
  console.log("5. Testing POST /api/education/generate-homework (Dynamic Assignment Generator)...");
  const student = overview.data.students[0];
  const hwRes = await fetch(`${baseUrl}/api/education/generate-homework`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: student.id }),
  });
  const hwData = await hwRes.json();
  if (!hwData.success) throw new Error("POST /api/education/generate-homework failed");
  console.log(`   ✅ Autonomously generated assignment: "${hwData.homework.title}" for ${student.name} (Weak Spot: ${hwData.homework.weakSpotCategory})\n`);

  // Test 6: GET /api/finance
  console.log("6. Testing GET /api/finance (Multi-Column Ledger & Runway)...");
  const finRes = await fetch(`${baseUrl}/api/finance`);
  const finData = await finRes.json();
  if (!finData.success) throw new Error("GET /api/finance failed");
  console.log(`   ✅ Financial Ledger: Total Debts: $${finData.summary.totalDebts}, Recurring: $${finData.summary.recurringMonthlyExpenses}/mo, Student Retainers: $${finData.summary.projectedStudentRetainers}\n`);

  // Test 7: POST /api/voice
  console.log("7. Testing POST /api/voice (Audio Ingestion & Action Item Extraction)...");
  const voiceRes = await fetch(`${baseUrl}/api/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Audio Memo: Pre-Exam Diagnostic Calibration",
      durationSeconds: 32,
      transcription: "Need to review Marcus's Task 1 dynamic chart report before Wednesday. Must prepare collocations drill for Elena. Follow up with corporate contract lead.",
      autoExtractTasks: true,
    }),
  });
  const voiceData = await voiceRes.json();
  if (!voiceData.success) throw new Error("POST /api/voice failed");
  console.log(`   ✅ Ingested Voice Memo. Extracted ${voiceData.extractedCount} action items automatically into Todos.\n`);

  // Test 8: POST /api/bundler
  console.log("8. Testing POST /api/bundler (Multi-Repo Pipeline & LLM Prompt Packager)...");
  const bundleRes = await fetch(`${baseUrl}/api/bundler`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "OmniSphere Test Monorepo Pack",
      repoUrls: ["https://github.com/omnisphere/core", "https://github.com/omnisphere/academy"],
      outputFormat: "XML_PROMPT",
    }),
  });
  const bundleData = await bundleRes.json();
  if (!bundleData.success) throw new Error("POST /api/bundler failed");
  console.log(`   ✅ Repository Bundled: ${bundleData.fileCount} standardized files, ~${bundleData.tokenEstimate.toLocaleString()} tokens, generated XML prompt length: ${bundleData.xmlPrompt?.length} chars\n`);

  // Test 9: POST /api/social
  console.log("9. Testing POST /api/social (Instagram Content Matrix & Hashtag Scorer)...");
  const socialRes = await fetch(`${baseUrl}/api/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hook: "Stop using basic linkers in IELTS Academic Task 2 essays:",
      body: "Replace 'Moreover' with 'Furthermore' or 'What is more'.\nReplace 'Because' with 'Inasmuch as' or 'Given that'.",
      cta: "Comment 'BAND9' to receive our free lexical guide!",
      audioTrack: "Deep Focus Ambient Waves",
      studentAcquisitionGoal: "Acquire 3 new C1 Candidates",
      hashtagCluster: ["#ieltswriting", "#c1english", "#academicvocabulary", "#ieltsband8"],
      visualAssetList: ["Title Hook", "Vocabulary Table", "CTA Ending"],
      status: "SCHEDULED",
    }),
  });
  const socialData = await socialRes.json();
  if (!socialData.success) throw new Error("POST /api/social failed");
  console.log(`   ✅ Instagram Post Created: Algorithmic Score: ${socialData.post.estScore}/100, Character count: ${socialData.post.charCount}\n`);

  // Test 10: POST /api/autonomous
  console.log("10. Testing POST /api/autonomous (Autonomostly Background Cycle)...");
  const agentRes = await fetch(`${baseUrl}/api/autonomous`, { method: "POST" });
  const agentData = await agentRes.json();
  if (!agentData.success) throw new Error("POST /api/autonomous failed");
  console.log(`   ✅ Autonomous Daemon Cycle Executed:`);
  for (const action of agentData.result.actionsTaken) {
    console.log(`      [${action.type}] (${action.status}): ${action.description}`);
  }
  console.log(`   Capacity Guardian: ${agentData.result.capacityStatus.weeklyTrackedHours}h tracked (${agentData.result.capacityStatus.utilizationPercent}% of ${agentData.result.capacityStatus.weeklyTargetHours}h ceiling), Risk Level: ${agentData.result.capacityStatus.riskLevel}\n`);

  // Test 11: GET /api/tags
  console.log("11. Testing GET /api/tags (Universal Polymorphic Tag Engine)...");
  const tagsRes = await fetch(`${baseUrl}/api/tags`);
  const tagsData = await tagsRes.json();
  if (!tagsData.success) throw new Error("GET /api/tags failed");
  console.log(`   ✅ Polymorphic Tags: ${tagsData.tags.length} active tags with cross-entity relations (${tagsData.tags.map((t: any) => `#${t.name} [${t.entityCount}]`).join(", ")})\n`);

  console.log("🎉 ALL 11 OPERATIONAL DOMAIN INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
}

runTestSuite().catch((err) => {
  console.error("❌ Test Suite Error:", err);
  process.exit(1);
});
