import * as promotionApi from '../api/promotionApi';

export async function getPromotionQueue(params = {}) {
  const { data } = await promotionApi.adminGetQueue(params);
  return data; // { success, data: [], pagination }
}

export async function approvePromotion(id) {
  const { data } = await promotionApi.adminReviewPromotion(id, { status: 'approved' });
  return data;
}

export async function rejectPromotion(id, rejectionReason) {
  const { data } = await promotionApi.adminReviewPromotion(id, {
    status: 'rejected',
    rejection_reason: rejectionReason
  });
  return data;
}

// Mentor requirements (for SettingsPage)
export async function getMentorRequirements() {
  const { data } = await promotionApi.adminGetRequirements();
  return data; // { success, data: [] }
}

export async function updateMentorRequirement(id, payload) {
  const { data } = await promotionApi.adminUpdateRequirement(id, payload);
  return data;
}
