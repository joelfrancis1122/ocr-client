import { useState } from "react";
import { Upload, FileText, Eye, AlertTriangle } from "lucide-react";
import { runOcr } from "../services/ocrService";

export default function OcrPage() {
    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);
    const [previewFront, setPreviewFront] = useState<string | null>(null);
    const [previewBack, setPreviewBack] = useState<string | null>(null);
    const [ocrData, setOcrData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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
        // Clear the input value to allow selecting the same file again if needed
        e.target.value = '';
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


    const ImageUploadSection = ({
        type,
        preview,
        file,
        onChange
    }: {
        type: "front" | "back";
        preview: string | null;
        file: File | null;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
                        />
                        <ImageUploadSection
                            type="back"
                            preview={previewBack}
                            file={backImage}
                            onChange={(e) => handleFileChange(e, "back")}
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

                    {/* Process Button */}
                    <div className="text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !frontImage || !backImage}
                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    </div>
                </div>

                {/* Results */}
                {ocrData && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-medium text-gray-900 mb-2">
                                Extraction Results
                            </h2>
                            <p className="text-gray-600">
                                Data extracted from uploaded documents
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 border">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto font-mono leading-relaxed">
                                {JSON.stringify(ocrData, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-16">
                    <p className="text-sm text-gray-500">
                    </p>
                </div>
            </div>
        </div>
    );
}