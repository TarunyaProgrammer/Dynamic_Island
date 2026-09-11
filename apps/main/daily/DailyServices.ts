import Database from 'better-sqlite3';
import { GoalService } from '@core/services/goal-service';
import { ActionService } from '@core/services/action-service';
import { TodayService } from '@core/services/today-service';
import { SQLiteActionRepository } from '@database/repository/action-repository';
import { SQLiteTodayPlanRepository } from '@database/repository/today-plan-repository';
import { OperationLogRepository } from '@database/repository/operation-log-repository';

/** One shared daily-action graph for IPC, deep links, and future Shortcuts.
 * Keeping this instance singular preserves change broadcasts and operation history. */
export interface DailyServices {
  actionRepository: SQLiteActionRepository;
  actionService: ActionService;
  todayService: TodayService;
  operationLog: OperationLogRepository;
}

export function createDailyServices(database: Database.Database, goals: GoalService): DailyServices {
  const actionRepository = new SQLiteActionRepository(database);
  const operationLog = new OperationLogRepository(database);
  const recorder = { record: (operation: Parameters<OperationLogRepository['append']>[0]) => operationLog.append(operation) };
  return {
    actionRepository,
    operationLog,
    actionService: new ActionService((goalId) => Boolean(goals.getGoal(goalId)), actionRepository, recorder),
    todayService: new TodayService(actionRepository, new SQLiteTodayPlanRepository(database), recorder),
  };
}
