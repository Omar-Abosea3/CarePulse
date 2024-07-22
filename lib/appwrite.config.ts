import * as sdk from 'node-appwrite';
export const {
  APPOINTMENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  PATIENT_COLLECTION_ID,
  DB_ID,
  API_KEY,
  PROJECT_ID,
  NEXT_PUBLIC_BUCKET_ID:BUCKET_ID,
  NEXT_PUBLIC_API_URL:ENDPOINT
} = process.env;


export const client = new sdk.Client();

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);