import { convertFileSize, formatDateTime } from "@/lib/utils";
import DetailRow from "./DetailRow";
import ImageThumbnail from "./ImageThumbnail";
import { Models } from "node-appwrite";

const FileDetails = ({ file }: { file: Models.Document }) => {
    return (
      <>
        <ImageThumbnail file={file} />
        <div className="space-y-4 px-2 pt-2">
          <DetailRow label="Format:" value={file.extension} />
          <DetailRow label="Size:" value={convertFileSize(file.size)} />
          <DetailRow label="Owner:" value={file.ownerId.fullName} />
          <DetailRow
            label="Last Modified:"
            value={formatDateTime(file.$updatedAt)}
          />
        </div>
      </>
    );
  };
  export default FileDetails;