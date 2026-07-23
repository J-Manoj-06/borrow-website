const { db, FieldValue } = require('./admin');

/**
 * Server-side immutable audit logger writing directly to activityLogs collection
 */
const logServerActivity = async ({
  user = 'Cloud Function',
  action = 'performed backend operation',
  target = 'System',
  type = 'system',
  status = 'Success',
  details = {},
}) => {
  const logDoc = {
    user,
    action,
    target,
    type,
    status,
    details,
    timestamp: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('activityLogs').add(logDoc);
  } catch (err) {
    console.error('Server activity log creation failed:', err);
  }
};

module.exports = {
  logServerActivity,
};
