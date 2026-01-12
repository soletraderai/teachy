import { Router, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Helper function to get the start of day in user's timezone
function getStartOfDayInTimezone(timezone: string = 'America/New_York'): Date {
  // Get current time in user's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const localDateStr = formatter.format(now); // YYYY-MM-DD format

  // Create a date at midnight UTC for that local date
  // This ensures consistent date comparison across timezones
  const [year, month, day] = localDateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// GET /api/commitment/today
router.get('/today', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // First get user preferences to determine their timezone
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    // Get today's date in user's timezone
    const userTimezone = preferences?.timezone || 'America/New_York';
    const today = getStartOfDayInTimezone(userTimezone);

    const record = await prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today,
        },
      },
    });

    const baseTargetMinutes = preferences?.dailyCommitmentMinutes || 15;
    const busyWeekMode = record?.busyWeekMode || false;
    const vacationMode = record?.vacationMode || false;

    // Reduce target by 50% when in busy week mode
    const targetMinutes = busyWeekMode ? Math.ceil(baseTargetMinutes / 2) : baseTargetMinutes;

    const currentMinutes = record?.timeSpentMinutes || 0;
    const commitmentMet = record?.commitmentMet || false;

    res.json({
      date: today.toISOString().split('T')[0],
      targetMinutes,
      baseTargetMinutes,
      currentMinutes,
      progress: Math.min(100, (currentMinutes / targetMinutes) * 100),
      commitmentMet,
      questionsAnswered: record?.questionsAnswered || 0,
      sessionsCompleted: record?.sessionsCompleted || 0,
      busyWeekMode,
      vacationMode,
      timezone: userTimezone,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/commitment/calendar
router.get('/calendar', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { view = 'week' } = req.query;
    const days = view === 'month' ? 30 : 7;

    // Get user preferences to determine timezone
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });
    const userTimezone = preferences?.timezone || 'America/New_York';

    // Get today in user's timezone
    const today = getStartOfDayInTimezone(userTimezone);

    // Calculate start date (days ago from today)
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - days);

    const records = await prisma.dailyRecord.findMany({
      where: {
        userId: req.user!.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const calendar: { date: string; commitmentMet: boolean; timeSpentMinutes: number; vacationMode: boolean }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + i);

      const record = records.find(r => {
        const recordDate = new Date(r.date);
        return recordDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
      });

      calendar.push({
        date: date.toISOString().split('T')[0],
        commitmentMet: record?.commitmentMet || false,
        timeSpentMinutes: record?.timeSpentMinutes || 0,
        vacationMode: record?.vacationMode || false,
      });
    }

    const metDays = records.filter(r => r.commitmentMet && !r.vacationMode).length;
    const totalDays = records.filter(r => !r.vacationMode).length;
    const consistency = totalDays > 0 ? (metDays / totalDays * 100).toFixed(1) : 0;

    res.json({
      calendar,
      consistency,
      metDays,
      totalDays,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/commitment/log
router.post('/log', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { timeSpentMinutes, questionsAnswered, sessionsCompleted } = req.body;

    // Get user preferences to determine timezone and target
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    // Get today in user's timezone
    const userTimezone = preferences?.timezone || 'America/New_York';
    const today = getStartOfDayInTimezone(userTimezone);

    const targetMinutes = preferences?.dailyCommitmentMinutes || 15;

    const record = await prisma.dailyRecord.upsert({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today,
        },
      },
      update: {
        timeSpentMinutes: { increment: timeSpentMinutes || 0 },
        questionsAnswered: { increment: questionsAnswered || 0 },
        sessionsCompleted: { increment: sessionsCompleted || 0 },
      },
      create: {
        userId: req.user!.id,
        date: today,
        timeSpentMinutes: timeSpentMinutes || 0,
        questionsAnswered: questionsAnswered || 0,
        sessionsCompleted: sessionsCompleted || 0,
      },
    });

    // Check if commitment met
    const commitmentMet = record.timeSpentMinutes >= targetMinutes;
    if (commitmentMet !== record.commitmentMet) {
      await prisma.dailyRecord.update({
        where: { id: record.id },
        data: { commitmentMet },
      });
    }

    res.json({
      ...record,
      commitmentMet,
      targetMinutes,
      progress: Math.min(100, (record.timeSpentMinutes / targetMinutes) * 100),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/commitment/settings
router.patch('/settings', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { busyWeekMode, vacationMode } = req.body;

    // Get user preferences to determine timezone
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });
    const userTimezone = preferences?.timezone || 'America/New_York';
    const today = getStartOfDayInTimezone(userTimezone);

    const record = await prisma.dailyRecord.upsert({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today,
        },
      },
      update: {
        ...(busyWeekMode !== undefined && { busyWeekMode }),
        ...(vacationMode !== undefined && { vacationMode }),
      },
      create: {
        userId: req.user!.id,
        date: today,
        busyWeekMode: busyWeekMode || false,
        vacationMode: vacationMode || false,
      },
    });

    res.json(record);
  } catch (error) {
    next(error);
  }
});

export default router;
