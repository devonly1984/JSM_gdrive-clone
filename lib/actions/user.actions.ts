"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { AppwriteConfig } from "../appwrite/config";
import { handleError, parseStringify } from "../utils";
import { cookies } from "next/headers";
import { placeholderimg } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();
  const result = await databases.listDocuments(
    AppwriteConfig.databaseId,
    AppwriteConfig.usersCollection,
    [Query.equal("email", [email])]
  );
  return result.total > 0 ? result.documents[0] : null;
};

export const sendEmailToOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send OTP");
  }
};
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);
  const accountId = await sendEmailToOTP({ email });

  if (!accountId) throw new Error("Failed ot send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();
    await databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.usersCollection,
      ID.unique(),
      {
        fullName,
        email,
        avatar: placeholderimg,
        accountId,
      }
    );
  }
  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const {account} = await createAdminClient();  
    const session = await account.createSession(accountId,password);
  (await cookies()).set("appwrite-session", session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
  return parseStringify({ sessionId: session?.$id });
  } catch (error) {
    handleError(error,"Failed to verify OTP")
  }
  

};

export const getCurrentUser = async()=>{
  const {databases,account} = await createSessionClient();
  const result = await account.get();
  const user = await databases.listDocuments(
    AppwriteConfig.databaseId,
    AppwriteConfig.usersCollection,
    [Query.equal("accountId", [result.$id])]
  );
  if (user.total <=0) return null;
  return parseStringify(user.documents[0]);
}

export const signOutUser = async()=>{
  const {account} = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error,'Failed to sign out user')
  } finally {
    redirect("/sign-in");
  }
}
export const signInUser = async({email}:{email:string})=>{
  try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        await sendEmailToOTP({email});
        return parseStringify({ accountId: existingUser.$id });
      }
      return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error,"Failed to sign in user")
  }
}