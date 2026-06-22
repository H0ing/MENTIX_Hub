import * as reportApi from '../api/reportApi';

export async function getReports(params = {}) {
  const { data } = await reportApi.adminGetReports(params);
  return data; // { success, data: [], pagination }
}

export async function getReportById(id) {
  const { data } = await reportApi.adminGetReportById(id);
  return data;
}

export async function resolveReport(id, { responseType, note } = {}) {
  const { data } = await reportApi.adminRespondToReport(id, {
    response_type: responseType || 'other',
    message:       note || ''
  });
  return data;
}

export async function dismissReport(id, { note } = {}) {
  const { data } = await reportApi.adminRespondToReport(id, {
    response_type: 'dismissed',
    message:       note || ''
  });
  return data;
}
