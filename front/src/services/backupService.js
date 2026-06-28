import * as backupApi from '../api/backupApi';

function unwrap(response) {
  return response.data;
}

export async function getBackupHistory(params = {}) {
  return unwrap(await backupApi.getBackupHistory(params));
}

export async function getBackupSchedule() {
  return unwrap(await backupApi.getSchedule());
}

export async function saveBackupSchedule(payload) {
  return unwrap(await backupApi.updateSchedule(payload));
}

export async function runBackup() {
  return unwrap(await backupApi.triggerBackup());
}

export async function restoreBackup(id) {
  return unwrap(await backupApi.restoreBackup(id));
}

export async function deleteBackup(id) {
  return unwrap(await backupApi.deleteBackup(id));
}

export async function getRecoverableBackups(params = {}) {
  return unwrap(await backupApi.getRecoverableBackups(params));
}
