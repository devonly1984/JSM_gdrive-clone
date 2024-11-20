import FileCard from "@/components/cards/FileCard";
import Sorter from "@/components/shared/Sorter";
import { getFiles } from "@/lib/actions/file.actions";
import { getFileTypesParams } from "@/lib/utils";
import { FileType, SearchParamProps } from "@/types";
import { Models } from "node-appwrite";

const TypePage = async ({ params,searchParams }: SearchParamProps) => {
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";
  const type = ((await params)?.type as string) || "";
  const types = getFileTypesParams(type) as FileType[];
  let totalSize = 0;
  const files = await getFiles({ types, searchText, sort });
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>
        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{totalSize}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-200">Sort by:</p>
            <Sorter />
          </div>
        </div>
      </section>
      {/**Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <FileCard key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};
export default TypePage;
