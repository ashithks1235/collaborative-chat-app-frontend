import { useState } from "react";
import { motion } from "framer-motion";
import FileHoverBar from "./FileHoverBar";

export default function FileMessage({
  m,
  isSender,
  readOnly,
  onReact,
  onDelete,
  onReply
}) {
  const [preview, setPreview] = useState(null);

  const bubbleClass = `
    rounded-2xl shadow-md overflow-hidden max-w-[420px] w-fit
    ${
      isSender
        ? "bg-blue-500 text-white rounded-br-md"
        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-md"
    }
  `;

  return (
    <div className="relative group">

      {/* HOVER BAR (outside bubble) */}
      <FileHoverBar
        m={m}
        isSender={isSender}
        readOnly={readOnly}
        onReact={onReact}
        onDelete={onDelete}
        onReply={onReply}
      />

      {/* MESSAGE BUBBLE */}
      <motion.div layout className={bubbleClass}>

        <div className="flex flex-col">

          {m.attachments.map((file, index) => {

            const fileUrl = file.url?.startsWith("http")
              ? file.url
              : `http://localhost:3000${file.url}`;

            const type = file.type || "";
            const name = file.name || "";

            const isImage =
              type.startsWith("image") ||
              /\.(png|jpg|jpeg|gif|webp)$/i.test(name);

            const isVideo =
              type.startsWith("video") ||
              /\.(mp4|webm|mov|mkv)$/i.test(name);

            /* IMAGE */

            if (isImage) {
              return (
                <img
                  key={file._id || index}
                  src={fileUrl}
                  onClick={() => setPreview(file)}
                  className="max-w-[320px] w-full rounded-lg cursor-pointer"
                />
              );
            }

            /* VIDEO */

            if (isVideo) {
              return (
                <video
                  key={file._id || index}
                  controls
                  src={fileUrl}
                  onClick={() => setPreview(file)}
                  className="max-w-[320px] w-full rounded-lg cursor-pointer"
                />
              );
            }

            /* DOCUMENT */

            return (
              <div
                key={file._id || index}
                onClick={() => setPreview(file)}
                className="px-4 py-3 text-sm flex items-center gap-2 cursor-pointer"
              >
                📎 {name || "Download file"}
              </div>
            );

          })}

        </div>

      </motion.div>

      {/* PREVIEW MODAL */}

      {preview && (() => {

        const previewUrl = preview.url?.startsWith("http")
            ? preview.url
            : `http://localhost:3000${preview.url}`;

        const type = preview.type || "";
        const name = preview.name || "";

        const isImage =
            type.startsWith("image") ||
            /\.(png|jpg|jpeg|gif|webp)$/i.test(name);

        const isVideo =
            type.startsWith("video") ||
            /\.(mp4|webm|mov|mkv)$/i.test(name);

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 max-w-4xl w-full relative shadow-2xl">

                <button
                onClick={() => setPreview(null)}
                className="absolute right-4 top-4"
                >
                ✕
                </button>

                <h3 className="font-semibold mb-3">{name}</h3>

                {/* IMAGE PREVIEW */}
                {isImage && (
                <img
                    src={previewUrl}
                    className="max-h-[70vh] mx-auto rounded-lg"
                />
                )}

                {/* VIDEO PREVIEW */}
                {isVideo && (
                <video
                    controls
                    src={previewUrl}
                    className="max-h-[70vh] mx-auto rounded-lg"
                />
                )}

                {/* DOCUMENT PREVIEW */}
                {!isImage && !isVideo && (
                <div
                    onClick={() => window.open(previewUrl, "_blank")}
                    className="flex flex-col items-center justify-center 
                            border rounded-lg h-[60vh] cursor-pointer
                            hover:bg-gray-50 transition"
                >
                    <div className="text-6xl mb-4">📄</div>

                    <div className="font-medium text-gray-700">
                    {name || "Document"}
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                    Click to open document
                    </div>
                </div>
                )}

            </div>
            </div>
        );

        })()}

    </div>
  );
}