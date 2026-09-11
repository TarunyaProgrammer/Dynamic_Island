import { beforeEach, describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { GoalService } from './goal-service';
import { WeeklyReviewService } from './weekly-review-service';

describe('WeeklyReviewService', () => {
  beforeEach(() => DatabaseConnection.close());
  it('uses existing progress events and offers a non-punitive adjustment', () => {
    const repo = new SQLiteGoalRepository(DatabaseConnection.initializeInMemory());
    const service = new GoalService(repo);
    const goal = service.createGoal({ name: 'Read', targetValue: 10 });
    service.incrementProgress(goal.id, 1);
    const review = new WeeklyReviewService(repo).getReview();
    expect(review.commitmentsKept).toBe(1);
    expect(review.goals[0].trajectory).toBe('Moving');
    expect(review.adjustment).toContain('rhythm');
  });
});
