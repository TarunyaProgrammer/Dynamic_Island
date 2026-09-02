export type MediaTargetKind = 'native' | 'browser';

export interface MediaCandidate {
  id: string;
  kind: MediaTargetKind;
  isPlaying: boolean;
  activityAt: number;
  isFrontmost?: boolean;
  isActiveTab?: boolean;
}

/**
 * Chooses one playback target without relying on discovery order. A confirmed
 * target remains stable while it is still playing, avoiding visual/control
 * oscillation when several browser tabs produce media at once.
 */
export class MediaTargetResolver {
  private confirmedId?: string;

  confirm(candidate: MediaCandidate): void {
    this.confirmedId = candidate.id;
  }

  invalidate(id: string): void {
    if (this.confirmedId === id) {
      this.confirmedId = undefined;
    }
  }

  resolve(candidates: readonly MediaCandidate[]): MediaCandidate | undefined {
    const playable = candidates.filter((candidate) => candidate.isPlaying);
    const pool = playable.length > 0 ? playable : candidates;

    if (!pool.some((candidate) => candidate.id === this.confirmedId)) {
      this.confirmedId = undefined;
    }

    return pool.reduce<MediaCandidate | undefined>((best, candidate) => {
      if (!best || this.score(candidate) > this.score(best)) {
        return candidate;
      }
      return best;
    }, undefined);
  }

  private score(candidate: MediaCandidate): number {
    return (candidate.id === this.confirmedId ? 1_000_000_000_000 : 0)
      + (candidate.isFrontmost ? 1_000_000_000 : 0)
      + (candidate.isActiveTab ? 1_000_000 : 0)
      + candidate.activityAt;
  }
}
