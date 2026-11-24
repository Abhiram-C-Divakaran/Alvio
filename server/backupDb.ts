import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface BackupVerificationResult {
  ok: boolean;
  integrity: string;
  migrationVersion: number;
  usersCount: number;
  problemsCount: number;
  sizeBytes: number;
}

/**
 * Creates a WAL-safe, online atomic SQLite backup using SQLite's VACUUM INTO statement.
 * Existing source database files and active WAL state remain intact.
 */
export function backupDatabase(sourcePath: string, destinationPath: string): BackupVerificationResult {
  const resolvedSource = path.resolve(sourcePath);
  const resolvedDest = path.resolve(destinationPath);
  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Source database not found: ${resolvedSource}`);
  }
  if (resolvedSource === resolvedDest) {
    throw new Error('Backup destination must differ from source database path.');
  }

  fs.mkdirSync(path.dirname(resolvedDest), { recursive: true });
  if (fs.existsSync(resolvedDest)) {
    fs.unlinkSync(resolvedDest);
  }

  const db = new DatabaseSync(resolvedSource);
  try {
    db.exec('PRAGMA busy_timeout = 5000;');
    const escapedDest = resolvedDest.replace(/'/g, "''");
    db.exec(`VACUUM INTO '${escapedDest}'`);
  } finally {
    db.close();
  }

  return verifyDatabaseBackup(resolvedDest);
}

/**
 * Verifies a SQLite backup file using PRAGMA integrity_check and basic schema checks.
 */
export function verifyDatabaseBackup(backupPath: string): BackupVerificationResult {
  const resolved = path.resolve(backupPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Backup file not found: ${resolved}`);
  }
  const sizeBytes = fs.statSync(resolved).size;
  const db = new DatabaseSync(resolved, { readOnly: true });
  try {
    const check = db.prepare('PRAGMA integrity_check').get() as { integrity_check?: string } | undefined;
    const integrity = String(check?.integrity_check || 'unknown');
    const migrationRow = db
      .prepare('SELECT MAX(version) as v FROM schema_migrations')
      .get() as { v?: number | null } | undefined;
    const usersRow = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c?: number } | undefined;
    const problemsRow = db.prepare('SELECT COUNT(*) as c FROM problems').get() as { c?: number } | undefined;
    return {
      ok: integrity === 'ok',
      integrity,
      migrationVersion: Number(migrationRow?.v || 0),
      usersCount: Number(usersRow?.c || 0),
      problemsCount: Number(problemsRow?.c || 0),
      sizeBytes,
    };
  } finally {
    db.close();
  }
}

/**
 * Verifies a backup snapshot first, removes stale WAL/SHM sidecars on the target path,
 * and atomically restores the target SQLite file (server must be stopped before restoring).
 */
export function restoreDatabase(backupPath: string, targetPath: string): BackupVerificationResult {
  const resolvedBackup = path.resolve(backupPath);
  const resolvedTarget = path.resolve(targetPath);
  if (resolvedBackup === resolvedTarget) {
    throw new Error('Backup source and restore target paths must differ.');
  }

  const preCheck = verifyDatabaseBackup(resolvedBackup);
  if (!preCheck.ok) {
    throw new Error(`Backup failed integrity check: ${preCheck.integrity}`);
  }

  fs.mkdirSync(path.dirname(resolvedTarget), { recursive: true });
  const tempPath = `${resolvedTarget}.restoring-${Date.now()}`;
  fs.copyFileSync(resolvedBackup, tempPath);

  for (const suffix of ['-wal', '-shm']) {
    const sidecar = `${resolvedTarget}${suffix}`;
    if (fs.existsSync(sidecar)) fs.unlinkSync(sidecar);
  }
  fs.renameSync(tempPath, resolvedTarget);
  return verifyDatabaseBackup(resolvedTarget);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const defaultDbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.sqlite');
  if (process.argv[2] === '--restore') {
    const backupFile = process.argv[3];
    const targetFile = process.argv[4] || defaultDbPath;
    if (!backupFile) {
      console.error('Usage: npm run db:restore -- <backupPath> [targetPath]');
      process.exit(1);
    }
    const restored = restoreDatabase(backupFile, targetFile);
    console.log(JSON.stringify({ event: 'db_restore_complete', targetFile, ...restored }));
    if (!restored.ok) process.exit(1);
  } else {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination =
      process.argv[2] || path.join(process.cwd(), 'data', 'backups', `alvio-backup-${stamp}.sqlite`);
    const result = backupDatabase(defaultDbPath, destination);
    console.log(JSON.stringify({ event: 'db_backup_complete', destination, ...result }));
    if (!result.ok) process.exit(1);
  }
}
