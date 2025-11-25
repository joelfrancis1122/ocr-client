import { useState, useRef } from "react";
import { Upload, FileText, Eye, AlertTriangle, Clipboard, Trash2 } from "lucide-react";
import { runOcr } from "../services/ocrService";

export default function OcrPage() {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [previewFront, setPreviewFront] = useState<string | null>(null);
  const [previewBack, setPreviewBack] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  // UI copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "front" && previewFront) {
      URL.revokeObjectURL(previewFront);
    } else if (type === "back" && previewBack) {
      URL.revokeObjectURL(previewBack);
    }

    if (type === "front") {
      setFrontImage(file);
      setPreviewFront(URL.createObjectURL(file));
    } else {
      setBackImage(file);
      setPreviewBack(URL.createObjectURL(file));
    }

    e.currentTarget.value = "";
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) {
      alert("Please upload both front and back images!");
      return;
    }
    try {
      setLoading(true);
      const data = await runOcr(frontImage, backImage);
      setOcrData(data);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyField = async (key: string, value: any) => {
    try {
      const text = String(value ?? "");
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error("copy failed", err);
      alert("Copy failed");
    }
  };

  const handleCopyAll = async () => {
    if (!ocrData) return;
    const lines = Object.entries(ocrData).map(([k, v]) => `${k}: ${String(v)}`);
    const payload = lines.join("\n");
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch (err) {
      console.error("copy all failed", err);
      alert("Copy failed");
    }
  };

  const handleReset = () => {
    // revoke object URLs
    if (previewFront) {
      URL.revokeObjectURL(previewFront);
    }
    if (previewBack) {
      URL.revokeObjectURL(previewBack);
    }

    setFrontImage(null);
    setBackImage(null);
    setPreviewFront(null);
    setPreviewBack(null);
    setOcrData(null);
    setLoading(false);
    setCopiedKey(null);
    setCopiedAll(false);

    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
  };

  const ImageUploadSection = ({
    type,
    preview,
    file,
    onChange,
    inputRef
  }: {
    type: "front" | "back";
    preview: string | null;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
  }) => {
    const inputId = `${type}-upload-input`;

    return (
      <div className="space-y-3">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
          {type} Side
        </label>

        {!preview ? (
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">Click to upload image</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</p>
            </div>
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={preview}
                alt={`${type} side`}
                className="w-full h-40 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                <Eye className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 truncate flex-1">{file?.name}</span>
              <label
                htmlFor={inputId}
                className="ml-3 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Change
              </label>
              <input
                id={inputId}
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-6">
            <FileText className="h-8 w-8 text-gray-700" />
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            Document OCR
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
            Extract text from your Aadhaar card using optical character recognition
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ImageUploadSection
              type="front"
              preview={previewFront}
              file={frontImage}
              onChange={(e) => handleFileChange(e, "front")}
              inputRef={frontInputRef}
            />
            <ImageUploadSection
              type="back"
              preview={previewBack}
              file={backImage}
              onChange={(e) => handleFileChange(e, "back")}
              inputRef={backInputRef}
            />
          </div>

          {/* Status */}
          {(!frontImage || !backImage) && (
            <div className="flex items-center justify-center p-4 bg-amber-50 rounded-lg mb-6">
              <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-700">
                Both sides required for processing
              </span>
            </div>
          )}

          {/* Buttons: Process, Reset */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !frontImage || !backImage}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                "Extract Text"
              )}
            </button>

            <button
              onClick={handleReset}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {ocrData && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Extraction Results</h2>
                <p className="text-gray-600">Data extracted from uploaded documents</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyAll}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  {copiedAll ? "Copied!" : "Copy All"}
                </button>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-3 py-2 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Results
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 rounded-lg border border-gray-200">
                <tbody>
                  {Object.entries(ocrData).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200">
                      <td className="px-4 py-2 font-medium text-gray-700 w-1/3 align-top">{key}</td>
                      <td className="px-4 py-2 text-gray-800 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 break-words">{String(value)}</div>
                          <button
                            onClick={() => handleCopyField(key, value)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                          >
                            <Clipboard className="h-3.5 w-3.5 mr-2" />
                            {copiedKey === key ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500"></p>
        </div>
      </div>
    </div>
  );
}
