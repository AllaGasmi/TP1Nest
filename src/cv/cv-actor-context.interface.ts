export interface CvActorContext {
  userId: number | null;
  username: string | null;
  role: 'admin' | 'user';
}

export interface CvPersistenceEventPayload {
  id: number;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE';
  occurredAt: Date;
  actorId: number | null;
  actorUsername: string | null;
  actorRole: string;
  cvId: number | null;
  cvOwnerId: number | null;
  details: Record<string, unknown> | null;
}
