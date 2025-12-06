import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { predictGlukosaAPI } from "../../infrastructure/glukosaApi";
import { predictionService } from "../../domain/services/predictionService";

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const videoConstraints = {
    facingMode: { ideal: "environment" },
    width: 640,
    height: 480,
  };

  const descriptions = {
    High: {
      range: ">20 mg/dL",
      interpretation: "The glucose level is alarmingly high, closely associated with uncontrolled diabetes.",
      suggestion: "Seek immediate medical assistance.",
    },
    Moderate: {
      range: ">5-20 mg/dL",
      interpretation: "The glucose level is elevated, suggesting possible hyperglycemia.",
      suggestion: "Reduce your consumption of sugary foods and drinks, and regularly monitor your levels.",
    },
    Normal: {
      range: "1–5 mg/dL",
      interpretation: "The glucose level is within the normal range for saliva, indicating stability.",
      suggestion: "Keep up your current routine and balanced diet.",
    },
    Low: {
      range: "1–5 mg/dL",
      interpretation: "The glucose level is within the normal range for saliva, indicating stability.",
      suggestion: "Keep up your current routine and balanced diet.",
    },
  };

  const takePicture = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      fetch(screenshot)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreview(URL.createObjectURL(blob));
          setShowCamera(false);
        });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !user) return;

    setIsLoading(true);
    let predictionRecord = null;

    try {
      // 1. Create initial prediction record with image upload
      predictionRecord = await predictionService.createPrediction(user.id, image);

      // 2. Call ML API for prediction
      const mlResult = await predictGlukosaAPI(image);

      // 3. Prepare results data
      const desc = descriptions[mlResult.prediction] || descriptions.Normal;
      const maxProb = Math.max(...Object.values(mlResult.probabilities));

      const resultsData = {
        label: mlResult.prediction,
        confidenceScore: maxProb,
        rangeValue: desc.range,
        interpretation: desc.interpretation,
        suggestion: desc.suggestion,
      };

      // 4. Update prediction record with results
      await predictionService.updatePrediction(predictionRecord.id, resultsData);

      // 5. Navigate to result page with data
      navigate("/result", {
        state: {
          result: {
            prediction: mlResult.prediction,
            probabilities: mlResult.probabilities,
            ...desc,
          },
        },
      });

      toast.success("Prediction completed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to get prediction. Please try again.");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Glucose <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Detection</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload an image or use the camera to instantly detect glucose levels with AI-powered analysis.
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Image</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Camera View */}
            <AnimatePresence mode="wait">
              {showCamera ? (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-64 rounded-xl object-cover bg-gray-900"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={takePicture}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Icon icon="heroicons:camera" className="w-5 h-5" />
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCamera(false)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* Drag & Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon icon="heroicons:cloud-arrow-up" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2 font-medium">Drop your image here or click to browse</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Preview */}
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 relative"
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={resetForm}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                      >
                        <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                    >
                      <Icon icon="heroicons:camera" className="w-5 h-5" />
                      Open Camera
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !image}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </span>
              ) : (
                "Detect Glucose Level"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
