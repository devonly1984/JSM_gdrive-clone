"use server";
import {
  DeleteFileProps,
  GetFilesProps,
  RenameFileProps,
  UpdateFileUsersProps,
  UploadFileProps,
} from "@/types/index";
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

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText?: string,
  sort?: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("ownerId", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];
  if (types.length > 0) {
    queries.push(Query.equal("type", types));
  }
  if (searchText) {
    queries.push(Query.contains("name", searchText));
  }
  if (limit) {
    queries.push(Query.limit(limit));
  }if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }
  
  
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
export const getFiles = async ({
  types,
  searchText = "",
  sort = "$created-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not found");
    }
    const queries = createQueries(currentUser, types, searchText, sort, limit);
    const files = await databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.filesCollection,
      queries
    );
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Error fetching files");
  }
};
export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();
  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.filesCollection,
      fileId,
      {
        name: newName,
      }
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename File");
  }
};
export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();
  try {
    const updatedFile = await databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.filesCollection,
      fileId,
      {
        users: emails,
      }
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename File");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases,storage } = await createAdminClient();
  
  try {
    const deletedFile = await databases.deleteDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.filesCollection,
      fileId,
     
    );
    if (deletedFile) {
      await storage.deleteFile(AppwriteConfig.bucketId, bucketFileId);
    }
    revalidatePath(path);
    return parseStringify({status: "Success"});
  } catch (error) {
    handleError(error, "Failed to rename File");
  }
};