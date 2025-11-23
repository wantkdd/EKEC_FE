import { useEffect, useRef, useState } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { SafeHtml } from "../../../../common/SafeHtml";

interface ContentInputProps {
  onValueChange: (value: string) => void;
  initialValue?: string;
}

const ContentInput: React.FC<ContentInputProps> = ({ onValueChange, initialValue }) => {
  const editorRef = useRef<Editor>(null);
  const [content, setContent] = useState("");

  const handleChange = () => {
    const html = editorRef.current?.getInstance().getHTML() || "";
    setContent(html);
    onValueChange(html);
  };

  // 초기값 주입
  useEffect(() => {
    if (typeof initialValue === "string") {
      setContent(initialValue);
      const inst = editorRef.current?.getInstance();
      if (inst) inst.setHTML(initialValue);
      onValueChange(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  return (
    <div>
      <div className="font-bold mb-2">
        본문 입력<span className="text-red-500 text-base">*</span>
      </div>
      <div className="mb-6">
        <Editor
          ref={editorRef}
          initialValue={content}
          height="400px"
          useCommandShortcut
          hideModeSwitch={true}
          onChange={handleChange}
          toolbarItems={[
            ["heading", "bold", "italic", "strike"],
            ["hr", "quote"],
            ["ul", "ol", "task", "indent", "outdent"],
            ["table", "image", "link"],
            ["code", "codeblock"],
          ]}
        />
      </div>

      <SafeHtml
        html={content}
        className="border border-gray-300 p-2"
      />
    </div>
  );
};

export default ContentInput;
