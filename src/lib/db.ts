
import Dexie, { Table } from 'dexie';
import { Report } from '../types';

export class FieldODatabase extends Dexie {
  drafts!: Table<Report>;

  constructor() {
    super('FieldODatabase');
    this.version(1).stores({
      drafts: 'id, uid, projectName, status, createdAt'
    });
  }
}

export const localDb = new FieldODatabase();
