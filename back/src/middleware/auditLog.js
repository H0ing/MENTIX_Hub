import { log } from '../repositories/auditRepository.js'

function auditLog(actionType) {
  return async function (req, res, next) {
    const originalJson = res.json

    res.json = function (data) {
      if (res.statusCode < 400 && req.user) {
        log(req.user.id, actionType, {
          targetType: req.params?.id ? 'unknown' : null,
          targetId: req.params?.id || null,
          ipAddress: req.ip
        }).catch(err => console.error('Audit log failed:', err))
      }
      return originalJson.call(this, data)
    }

    next()
  }
}

export default auditLog