import React, { useState, lazy, Suspense } from "react";
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = lazy(() => import("react-quill-new"));

interface BlogEditorProps {
    initialValue?: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
    initialValue = "",
    onChange,
    placeholder,
}) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (content: string, delta: any, source: string, editor: any) => {
        setValue(content);
        onChange(content);
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
        ],
    };

    return (
        <div className="bg-white">
            {typeof window !== "undefined" && (
                <Suspense fallback={<div className="h-64 bg-gray-100 flex items-center justify-center">Loading editor...</div>}>
                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={handleChange}
                        modules={modules}
                        placeholder={placeholder}
                        className="h-64 mb-12"
                    />
                </Suspense>
            )}
        </div>
    );
};

export default BlogEditor;
