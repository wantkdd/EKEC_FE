import { useRef, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

interface ContentInputProps {
  onValueChange?: (value: string) => void;
  value?: string;
}

const ContentInput: React.FC<ContentInputProps> = ({
  onValueChange,
  value = "",
}) => {
  const editorRef = useRef<Editor>(null);

  const handleChange = () => {
    const html = editorRef.current?.getInstance().getHTML() || "";
    onValueChange?.(html);
  };

  useEffect(() => {
    if (value && editorRef.current) {
      editorRef.current.getInstance().setHTML(value);
    }
  }, [value]);

  return (
    <div role="region" aria-label="게시글 본문 입력 영역">
      <div className="font-bold mb-2">
        본문 입력<span className="text-red-500 text-base" aria-label="필수">*</span>
      </div>
      <div className="mb-6">
        <Editor
          ref={editorRef}
          initialValue=" "
          height="400px"
          useCommandShortcut
          hideModeSwitch={true}
          onChange={handleChange}
          aria-label="게시글 본문 편집기"
          toolbarItems={[
            ["heading", "bold", "italic", "strike"],
            ["hr", "quote"],
            ["ul", "ol", "task", "indent", "outdent"],
            ["table", "image", "link"],
            ["code", "codeblock"],
          ]}
        />
      </div>
    </div>
  );
};

export default ContentInput;
