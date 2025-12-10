
interface IParticipant {
  prepare(): Promise<boolean>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class TwoPhaseCommit {
  static async execute(participants: IParticipant[]) {
    // Phase 1: Prepare
    try {
      for (const p of participants) {
        const ready = await p.prepare();
        if (!ready) throw new Error("Participant not ready");
      }
    } catch (e) {
      console.warn("2PC Abort during Prepare");
      await Promise.all(participants.map(p => p.rollback()));
      return false;
    }

    // Phase 2: Commit
    try {
      await Promise.all(participants.map(p => p.commit()));
      return true;
    } catch (e) {
      console.error("2PC Critical Failure during Commit (Inconsistent State)");
      return false;
    }
  }
}
