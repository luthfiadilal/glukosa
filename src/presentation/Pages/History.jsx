import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { predictionService } from "../../domain/services/predictionService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function History() {
    const { user } = useAuth();
    const toast = useToast();
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPredictions();
    }, [user]);

    const fetchPredictions = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const data = await predictionService.getUserPredictions(user.id, 50);
            setPredictions(data);
        } catch (error) {
            console.error("Failed to fetch predictions:", error);
            toast.error("Failed to load prediction history");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (prediction) => {
        setSelectedPrediction(prediction);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedPrediction(null), 300);
    };

    const getLabelConfig = (label) => {
        const configs = {
            High: {
                color: "bg-red-500",
                lightBg: "bg-red-50",
                textColor: "text-red-600",
                borderColor: "border-red-200",
                gradientFrom: "from-red-500",
                gradientTo: "to-red-600",
                ringColor: "ring-red-500/20",
            },
            Moderate: {
                color: "bg-yellow-500",
                lightBg: "bg-yellow-50",
                textColor: "text-yellow-600",
                borderColor: "border-yellow-200",
                gradientFrom: "from-yellow-500",
                gradientTo: "to-yellow-600",
                ringColor: "ring-yellow-500/20",
            },
            Normal: {
                color: "bg-green-500",
                lightBg: "bg-green-50",
                textColor: "text-green-600",
                borderColor: "border-green-200",
                gradientFrom: "from-green-500",
                gradientTo: "to-green-600",
                ringColor: "ring-green-500/20",
            },
            Low: {
                color: "bg-green-500",
                lightBg: "bg-green-50",
                textColor: "text-green-600",
                borderColor: "border-green-200",
                gradientFrom: "from-green-500",
                gradientTo: "to-green-600",
                ringColor: "ring-green-500/20",
            },
        };
        return configs[label] || configs.Normal;
    };

    // Compute probabilities object from prediction data if available
    const getProbabilities = (prediction) => {
        // If we stored probabilities in a JSON field, parse them
        // For now, we'll create a mock based on the confidence score
        const confidence = prediction.confidence_score || 0;
        const label = prediction.label;

        const levels = ["Low", "Normal", "Moderate", "High"];
        const probs = {};

        levels.forEach(level => {
            if (level === label) {
                probs[level] = confidence;
            } else {
                // Distribute remaining probability
                probs[level] = (100 - confidence) / (levels.length - 1);
            }
        });

        return probs;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Prediction{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            History
                        </span>
                    </h1>
                    <p className="text-gray-600">
                        View all your glucose level predictions
                    </p>
                </motion.div>

                {/* Empty State */}
                {predictions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="heroicons:document-text" className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Predictions Yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Start by uploading an image to detect glucose levels
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        {predictions.map((prediction, index) => {
                            const config = getLabelConfig(prediction.label);
                            return (
                                <motion.div
                                    key={prediction.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleRowClick(prediction)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Image Thumbnail */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all">
                                                {prediction.image_url ? (
                                                    <img
                                                        src={prediction.image_url}
                                                        alt="Prediction"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Icon icon="heroicons:photo" className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    Glucose Test
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} text-white`}>
                                                    {prediction.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Icon icon="heroicons:calendar" className="w-4 h-4" />
                                                    <span>{dayjs(prediction.created_at).format("MMM D, YYYY")}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Icon icon="heroicons:clock" className="w-4 h-4" />
                                                    <span>{dayjs(prediction.created_at).format("h:mm A")}</span>
                                                </div>
                                                {prediction.confidence_score && (
                                                    <div className="flex items-center gap-1">
                                                        <Icon icon="heroicons:chart-bar" className="w-4 h-4" />
                                                        <span>{prediction.confidence_score.toFixed(1)}% confidence</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex-shrink-0">
                                            <Icon
                                                icon="heroicons:chevron-right"
                                                className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {isModalOpen && selectedPrediction && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                >
                                    {/* Close Button */}
                                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Prediction Details
                                        </h2>
                                        <button
                                            onClick={closeModal}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <Icon icon="heroicons:x-mark" className="w-6 h-6 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="px-6 py-6 space-y-6">
                                        {/* Image Preview */}
                                        {selectedPrediction.image_url && (
                                            <div className="rounded-2xl overflow-hidden border border-gray-200">
                                                <img
                                                    src={selectedPrediction.image_url}
                                                    alt="Prediction sample"
                                                    className="w-full h-64 object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Label Badge */}
                                        <div className="text-center">
                                            <div className={`inline-flex items-center gap-2 ${getLabelConfig(selectedPrediction.label).color} text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-md`}>
                                                <Icon icon="healthicons:glucose" className="w-6 h-6" />
                                                {selectedPrediction.label.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Confidence Score */}
                                        {selectedPrediction.confidence_score && (
                                            <div className={`${getLabelConfig(selectedPrediction.label).lightBg} ${getLabelConfig(selectedPrediction.label).borderColor} border rounded-2xl p-4`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Confidence Level
                                                    </span>
                                                    <span className={`text-sm font-bold ${getLabelConfig(selectedPrediction.label).textColor}`}>
                                                        {selectedPrediction.confidence_score.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${selectedPrediction.confidence_score}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`bg-gradient-to-r ${getLabelConfig(selectedPrediction.label).gradientFrom} ${getLabelConfig(selectedPrediction.label).gradientTo} h-2.5 rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Range */}
                                        {selectedPrediction.range_value && (
                                            <div className={`${getLabelConfig(selectedPrediction.label).lightBg} rounded-2xl p-5`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`${getLabelConfig(selectedPrediction.label).color} p-2 rounded-lg`}>
                                                        <Icon icon="heroicons:chart-bar" className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                                            The Concentration
                                                        </p>
                                                        <p className={`font-bold ${getLabelConfig(selectedPrediction.label).textColor}`}>
                                                            {selectedPrediction.range_value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Interpretation */}
                                        {selectedPrediction.interpretation && (
                                            <div className="bg-blue-50 rounded-2xl p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-blue-500 p-2 rounded-lg">
                                                        <Icon icon="heroicons:information-circle" className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                                            Interpretation
                                                        </p>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {selectedPrediction.interpretation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggestion */}
                                        {selectedPrediction.suggestion && (
                                            <div className="bg-purple-50 rounded-2xl p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-purple-500 p-2 rounded-lg">
                                                        <Icon icon="heroicons:light-bulb" className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                                            Suggestion
                                                        </p>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {selectedPrediction.suggestion}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* All Probabilities */}
                                        {/* <div className="bg-gray-50 rounded-2xl p-5">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                                All Predictions Probability
                                            </h3>
                                            <div className="space-y-3">
                                                {Object.entries(getProbabilities(selectedPrediction)).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-gray-700 w-20">
                                                            {key}
                                                        </span>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className={`bg-gradient-to-r ${getLabelConfig(key).gradientFrom} ${getLabelConfig(key).gradientTo} h-2.5 rounded-full transition-all duration-700`}
                                                                style={{ width: `${value}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900 w-14 text-right">
                                                            {value.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div> */}

                                        {/* Timestamp */}
                                        <div className="bg-gray-50 rounded-2xl p-5 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                                <Icon icon="heroicons:clock" className="w-4 h-4" />
                                                <span>
                                                    Tested on {dayjs(selectedPrediction.created_at).format("MMMM D, YYYY")} at{" "}
                                                    {dayjs(selectedPrediction.created_at).format("h:mm A")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {dayjs(selectedPrediction.created_at).fromNow()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
