"use server";
import { UploadFileProps } from "@/types/index";
import { createAdminClient } from "../appwrite";
import {
  constructFileUrl,
  getFileType,
  handleError,
  parseStringify,
} from "../utils";
import { InputFile } from "node-appwrite/file";
import { AppwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const createQueries = (currentUser: Models.Document) => {
  const queries = [
    Query.or([
      Query.equal("ownerId", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];
  return queries;
  //TODO: Search SORT LIMITS ETC
};
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();
  try {
    const inputFile = InputFile.fromBuffer(file, file.name);
    const bucketFile = await storage.createFile(
      AppwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };
    const newFile = await databases
      .createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.filesCollection,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(AppwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Issue uploading file");
  }
};
export const getFiles =async()=>{
  const {databases} = await createAdminClient();
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not found")
    }
    const queries = createQueries(currentUser)
    const files = await databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.filesCollection,
      queries
    );
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Error fetching files");
  }
}
