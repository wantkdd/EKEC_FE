import React, { useState, useRef, useEffect } from 'react';
import { showWarning } from "../../../../../utils/toast";

interface ImageAttachmentProps {
  onValueChange?: (files: File[]) => void;
  initialUrls?: string[]; // existing attachment URLs to show
}

const ImageAttachment: React.FC<ImageAttachmentProps> = ({ onValueChange, initialUrls = [] }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>(initialUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onValueChange?.(selectedFiles);
  }, [selectedFiles, onValueChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (selectedFiles.length + files.length <= 5) {
      setSelectedFiles([...selectedFiles, ...files]);
    } else {
      showWarning('최대 5개까지만 첨부할 수 있습니다.');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const removeExistingUrl = (index: number) => {
    setExistingUrls(existingUrls.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <h3 className="text-lg font-semibold text-gray-900">이미지 첨부</h3>
        <span className="text-xs text-red-500">지원되는 파일을 최대 5개까지 업로드하세요.</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-sm">
            {/* Existing URLs */}
            {existingUrls.map((url, index) => (
              <div key={`url-${index}`} className="flex items-center justify-between py-1">
                <a href={url} target="_blank" rel="noreferrer" className="truncate text-blue-600 hover:underline">{url}</a>
                <button onClick={() => removeExistingUrl(index)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
            {/* Newly selected files */}
            {selectedFiles.map((file, index) => (
              <div key={`file-${index}`} className="flex items-center justify-between py-1">
                <span className="truncate">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
            {existingUrls.length === 0 && selectedFiles.length === 0 && "이미지를 첨부해주세요"}
          </div>
        </div>
        <button
          onClick={handleAttachClick}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>📤</span>
          <span>파일 첨부</span>
        </button>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="text-sm text-gray-600">
          첨부된 파일: {selectedFiles.length}/5
        </div>
      )}
    </div>
  );
};

export default ImageAttachment;