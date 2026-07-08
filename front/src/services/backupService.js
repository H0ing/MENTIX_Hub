import * as backupApi from '../api/backupApi';

function unwrap(response) {
  return response.data;
}

export async function getBackupHistory(params = {}) {
  return unwrap(await backupApi.getBackupHistory(params));
}

export async function getSchedules() {
  return unwrap(await backupApi.getSchedules());
}

export async function createSchedule(payload) {
  return unwrap(await backupApi.createSchedule(payload));
}

export async function updateSchedule(id, payload) {
  return unwrap(await backupApi.updateSchedule(id, payload));
}

export async function deleteSchedule(id) {
  return unwrap(await backupApi.deleteSchedule(id));
}

export async function runBackup(payload) {
  return unwrap(await backupApi.triggerBackup(payload));
}

export async function restoreBackup(id) {
  return unwrap(await backupApi.restoreBackup(id));
}

export async function deleteBackupById(id) {
  return unwrap(await backupApi.deleteBackup(id));
}

export async function getRecoverableBackups(params = {}) {
  return unwrap(await backupApi.getRecoverableBackups(params));
}
