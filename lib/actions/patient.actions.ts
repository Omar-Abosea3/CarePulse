"use server";
import { ID, Query } from "node-appwrite"
import { parseStringify } from "@/utils/utils";
import {InputFile} from 'node-appwrite/file'
import {
    BUCKET_ID,
    DB_ID,
    ENDPOINT,
    PATIENT_COLLECTION_ID,
    PROJECT_ID,
    databases,
    storage,
    users,
  } from "../appwrite.config";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
    
    try {
      const newuser = await users.create(
        ID.unique(),
        user.email,
        user.phone,
        undefined,
        user.name
      );
      console.log(newuser);
      
      return parseStringify(newuser);
    } catch (error: any) {
      // Check existing user
      if (error && error?.code === 409) {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);
  
        return existingUser.users[0];
      }
      console.error("An error occurred while creating a new user:", error);
    }
};

export const getUser = async (userId:string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user)
  } catch (error) {
    console.log(error);
    
  }
}

export const registerPatient = async ({identificationDocument , ...patient}:RegisterUserParams) => {
  try {
    let file;
    if(identificationDocument){
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get('blobFile') as Blob,
        identificationDocument?.get('fileName') as string
      );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }
    const newPatient = await databases.createDocument(
      DB_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentID:file?.$id || null,
        identificationDocumentUrl:`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient
      }
    );
    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
    
  }
}

export const getPatient = async (userId:string) => {
  try {
    const patients = await databases.listDocuments(
      DB_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)],
    );
    return parseStringify(patients.documents[0])
  } catch (error) {
    console.log(error);
    
  }
}