import type { Bulletin } from "../../../../types/bulletin/types";
import { SafeHtml } from "../../../common/SafeHtml";

interface BulletinAboutProps {
  bulletin: Bulletin;
}

const BulletinAbout: React.FC<BulletinAboutProps> = ({ bulletin }) => {
  return (
    <div className="text-sm bg-[#F7F8FC] px-4 py-6 rounded-2xl font-semibold text-gray-800 space-y-1">
      <SafeHtml
        html={bulletin.content || ""}
        className="text-gray-700 font-normal whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none [&>p]:mb-3 [&>br]:block [&>br]:mb-2 [&>strong]:font-semibold [&>em]:italic [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4"
      />

      {bulletin?.images && bulletin.images.length > 0 && (
        <div className="mt-4 space-y-2">
          {bulletin.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`첨부 이미지 ${index + 1}`}
              className="max-w-full h-auto rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BulletinAbout;
