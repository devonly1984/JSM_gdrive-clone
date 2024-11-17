"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { AppwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";

const getUserByEmail = async(email:string)=>{
    const {databases} = await createAdminClient();
    const result = await databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.usersCollection,
      [Query.equal("email", [email])]
    );
    return result.total > 0 ? result.documents[0] : null;
}
const handleError = (error:unknown,message:string) =>{
    console.log(error,message);
    throw error;
}
const sendEmailToOTP = async({email}:{email:string})=>{
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send OTP");
  }
}
export const createAccount = async({fullName,email}:{fullName:string,email:string})=>{
    const existingUser = await getUserByEmail(email);
    const accountId = await sendEmailToOTP({email});

    if (!accountId) throw new Error("Failed ot send an OTP");

    if (!existingUser) {
        const {databases} = await createAdminClient();
        await databases.createDocument(
          AppwriteConfig.databaseId,
          AppwriteConfig.usersCollection,
          ID.unique(),
          {
            fullName,
            email,
            avatar:
              "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
            accountId,
          }
        );

    }
    return parseStringify({accountId})
}