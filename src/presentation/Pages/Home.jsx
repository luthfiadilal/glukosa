import { useState, useRef } from "react";
import { predictGlukosaUseCase } from "../../application/predictGlukosa";
import Modal from "../Components/Modal";
import Spinner from "../Components/Spinner";
import { Icon } from "@iconify/react";
import CameraWithPinchZoom from "../Components/CameraControl";

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  // const videoConstraints = {
  //   facingMode: { ideal: "environment" },
  //   width: 640,
  //   height: 480,
  // };

  const takePicture = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      fetch(screenshot)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreview(URL.createObjectURL(blob));
          setResult(null);
          setShowCamera(false);
        });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setIsLoading(true);
    setResult(null);

    try {
      const prediction = await predictGlukosaUseCase(image);
      setResult(prediction);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("An error occurred while making prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  const descriptions = {
    Normal: {
      range: "1–5 mg/dL",
      interpretation:
        "The glucose level is within the normal range for saliva, indicating stability.",
      suggestion: "Keep up your current routine and balanced diet.",
    },
    Moderate: {
      range: ">10–20 mg/dL",
      interpretation:
        "The glucose level is elevated, suggesting possible hyperglycemia.",
      suggestion:
        "Reduce your consumption of sugary foods and drinks, and regularly monitor your levels.",
    },
    High: {
      range: ">20 mg/dL",
      interpretation:
        "The glucose level is alarmingly high, closely associated with uncontrolled diabetes.",
      suggestion: "Seek immediate medical assistance.",
    },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-6 md:px-[100px]">
      {/* Left Section */}
      <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
        <h1 className="md:text-[48px] text-[32px] font-extrabold mt-6 leading-tight text-gray-800">
          Glucose <span className="text-blue-600">Detection</span>
        </h1>
        <p className="text-gray-600 md:text-[22px] mt-3 max-w-md">
          Upload an image or use the camera to instantly detect glucose levels.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-white p-8 rounded-xl shadow-lg max-w-md w-full space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
            {/* Camera View */}
            {showCamera ? (
              <div className="space-y-4">
                <CameraWithPinchZoom webcamRef={webcamRef} />

                <div className="flex justify-center flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={takePicture}
                    className="bg-white cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 flex items-center space-x-2"
                  >
                    <Icon icon="solar:camera-bold" width="20" height="20" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCamera(false)}
                    className="bg-white cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                  >
                    <Icon
                      icon="solar:close-circle-bold"
                      width="20"
                      height="20"
                    />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* File Upload Button */}
                <label className="cursor-pointer block mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div className="text-blue-700 font-medium bg-blue-100 hover:bg-blue-200 rounded px-4 py-2 inline-block transition">
                    📁 Choose from Gallery
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="text-blue-700 font-medium bg-blue-100 hover:bg-blue-200 rounded px-4 py-2 transition"
                >
                  📷 Open Camera
                </button>
              </>
            )}

            {/* Preview Image */}
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-md border"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !image}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Spinner className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              "Detect Now"
            )}
          </button>
        </form>
      </div>

      {/* Modal Result */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Glucose Prediction Result"
      >
        {result ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold shadow">
              🩸
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">
                Prediction:
              </h3>
              <p
                className={`text-2xl font-bold ${
                  result.prediction === "High"
                    ? "text-red-600"
                    : result.prediction === "Moderate"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {result.prediction}
              </p>

              {/* ✅ Descriptions */}
              {descriptions[result.prediction] && (
                <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg shadow-inner">
                  <p className="text-sm text-gray-600">
                    <strong>Range:</strong>{" "}
                    {descriptions[result.prediction].range}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Interpretation:</strong>{" "}
                    {descriptions[result.prediction].interpretation}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Suggestion:</strong>{" "}
                    {descriptions[result.prediction].suggestion}
                  </p>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mt-6">
                Probability:
              </h3>
              <ul>
                {Object.entries(result.probabilities).map(([key, value]) => (
                  <li key={key} className="text-gray-600 text-lg font-medium">
                    {key}: {value.toFixed(2)}%
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Data not available.
          </div>
        )}
      </Modal>
    </div>
  );
}
