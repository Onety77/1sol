const admin = require('firebase-admin');

// Paste your Firebase service account values here.
// Get them from: Firebase Console → Project Settings → Service Accounts → Generate new private key
const serviceAccount = {
  type: "service_account",
  project_id: "YOUR_PROJECT_ID",
  private_key_id: "YOUR_PRIVATE_KEY_ID",
  private_key: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  client_email: "YOUR_CLIENT_EMAIL",
  client_id: "YOUR_CLIENT_ID",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "YOUR_CLIENT_X509_CERT_URL"
};

let db = null;

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return db;
  }
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  db = admin.firestore();
  return db;
}

function getDb() {
  if (!db) return initFirebase();
  return db;
}

function createMockDb() {
  const store = {};
  const mockCollection = (name) => ({
    doc: (id) => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async (data) => { store[`${name}/${id}`] = data; },
      update: async (data) => { store[`${name}/${id}`] = { ...(store[`${name}/${id}`] || {}), ...data }; },
      ref: { update: async () => {} },
    }),
    where: () => ({ where: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [] }) }) }), orderBy: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [] }) }) }), limit: () => ({ get: async () => ({ empty: true, docs: [] }) }), get: async () => ({ empty: true, docs: [] }) }),
    add: async (data) => { const id = Math.random().toString(36); store[`${name}/${id}`] = data; return { id }; },
  });
  return { collection: mockCollection };
}

module.exports = { initFirebase, getDb };
