const { db, messaging, FieldValue } = require('../utils/admin');

/**
 * Dispatch Firebase Cloud Messaging (FCM) Push Notification to Student App & Web Clients
 */
const sendFCMNotification = async (studentId, title, body, metadata = {}) => {
  const nowIso = new Date().toISOString();

  // 1. Create in-app notification record in Firestore
  const notificationPayload = {
    studentId,
    title,
    body,
    metadata,
    read: false,
    sentAt: nowIso,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('notifications').add(notificationPayload);
  } catch (err) {
    console.error('Firestore notification add failed:', err);
  }

  // 2. Fetch student's registered FCM token
  try {
    const studentQuery = await db.collection('students').where('registerNumber', '==', studentId).get();
    if (studentQuery.empty) return;

    const studentData = studentQuery.docs[0].data();
    const fcmToken = studentData.fcmToken;

    if (!fcmToken) return;

    // Send FCM Push Payload
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...metadata,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };

    await messaging.send(message);
    console.log(`FCM push sent to student ${studentId}: "${title}"`);
  } catch (err) {
    console.warn(`FCM push failed for student ${studentId}:`, err.message);
  }
};

/**
 * Extensible Email Notification Service Interface Abstraction (SendGrid / Nodemailer ready)
 */
const sendEmailNotification = async (recipientEmail, subject, htmlBody) => {
  console.log(`[EMAIL SERVICE] Prepared email to ${recipientEmail} | Subject: "${subject}"`);
  // Email transport integration (e.g. Nodemailer or SendGrid) can be attached here seamlessly
  return true;
};

module.exports = {
  sendFCMNotification,
  sendEmailNotification,
};
