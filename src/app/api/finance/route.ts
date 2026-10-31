import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [records, students, projects] = await Promise.all([
      prisma.financialRecord.findMany({
        include: {
          student: true,
          project: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.findMany({
        where: { status: "ACTIVE" },
        include: { lessons: true },
      }),
      prisma.project.findMany({
        where: { stage: { in: ["BUILD", "TRACK"] } },
      }),
    ]);

    const debts = records.filter((r) => r.type === "DEBT");
    const expenses = records.filter((r) => r.type === "EXPENSE");
    const incomes = records.filter((r) => r.type === "INCOME");

    const totalDebts = debts.reduce((sum, d) => sum + d.amount, 0);
    const confirmedIncome = incomes.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
    const pendingIncome = incomes.filter((i) => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);

    const actualExpenses = expenses.filter((e) => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
    const recurringMonthlyExpenses = expenses
      .filter((e) => e.isRecurring)
      .reduce((sum, e) => sum + e.amount, 0);

    // Projected Monthly Educational Retainer Pipeline:
    // Active students * average 4 lessons/month * ratePerHour
    const projectedStudentRetainers = students.reduce((sum, s) => sum + s.ratePerHour * 4, 0);
    const projectedTotalPipeline = pendingIncome + projectedStudentRetainers;

    const currentNetCash = confirmedIncome - actualExpenses;
    const projectedMonthEndCash = currentNetCash + projectedTotalPipeline - recurringMonthlyExpenses;
    const estimatedTaxSetAside = Math.round((confirmedIncome + projectedTotalPipeline) * 0.25); // 25% tax reserve

    // Estimated runway
    const monthlyBurn = recurringMonthlyExpenses > 0 ? recurringMonthlyExpenses : 500;
    const runwayMonths = Math.max(0, parseFloat((currentNetCash / monthlyBurn).toFixed(1)));

    return NextResponse.json({
      success: true,
      records,
      debts,
      expenses,
      incomes,
      summary: {
        totalDebts,
        confirmedIncome,
        pendingIncome,
        actualExpenses,
        recurringMonthlyExpenses,
        projectedStudentRetainers,
        projectedTotalPipeline,
        currentNetCash,
        projectedMonthEndCash,
        estimatedTaxSetAside,
        monthlyBurn,
        runwayMonths,
      },
    });
  } catch (error: unknown) {
    console.error("GET finance error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch financial data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      category,
      description,
      amount,
      dueDate,
      isRecurring = false,
      aprRate,
      isPaid = false,
      studentId,
      projectId,
    } = body;

    const record = await prisma.financialRecord.create({
      data: {
        type,
        category,
        description: description.trim(),
        amount: Number(amount) || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        isRecurring: Boolean(isRecurring),
        aprRate: aprRate ? Number(aprRate) : null,
        isPaid: Boolean(isPaid),
        studentId: studentId || null,
        projectId: projectId || null,
      },
      include: {
        student: true,
        project: true,
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST finance error:", error);
    return NextResponse.json({ success: false, error: "Failed to create financial record" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isPaid, amount, description } = body;

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: {
        ...(isPaid !== undefined && { isPaid: Boolean(isPaid) }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(description !== undefined && { description: description.trim() }),
      },
      include: {
        student: true,
        project: true,
      },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error: unknown) {
    console.error("PATCH finance error:", error);
    return NextResponse.json({ success: false, error: "Failed to update financial record" }, { status: 500 });
  }
}
