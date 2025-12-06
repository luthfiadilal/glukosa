import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function PredictionResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (location.state?.result) {
            setResult(location.state.result);
        } else {
            // If no result data, redirect to home
            navigate("/");
        }
    }, [location.state, navigate]);

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const getLabelConfig = (label) => {
        const configs = {
            High: {
                color: "bg-red-500",
                lightBg: "bg-red-50",
                textColor: "text-red-600",
                borderColor: "border-red-200",
                gradientFrom: "from-red-500",
                gradientTo: "to-red-600",
            },
            Moderate: {
                color: "bg-yellow-500",
                lightBg: "bg-yellow-50",
                textColor: "text-yellow-600",
                borderColor: "border-yellow-200",
                gradientFrom: "from-yellow-500",
                gradientTo: "to-yellow-600",
            },
            Normal: {
                color: "bg-green-500",
                lightBg: "bg-green-50",
                textColor: "text-green-600",
                borderColor: "border-green-200",
                gradientFrom: "from-green-500",
                gradientTo: "to-green-600",
            },
            Low: {
                color: "bg-green-500",
                lightBg: "bg-green-50",
                textColor: "text-green-600",
                borderColor: "border-green-200",
                gradientFrom: "from-green-500",
                gradientTo: "to-green-600",
            },
        };
        return configs[label] || configs.Normal;
    };

    const config = getLabelConfig(result.prediction);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
                    <span className="font-medium">Back to Home</span>
                </Link>

                {/* Result Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Your Glucose Condition
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Based on AI analysis of your sample
                        </p>
                    </div>

                    {/* Label Badge */}
                    <div className="px-8 pb-6">
                        <div
                            className={`${config.color} text-white text-center py-3 px-6 rounded-2xl font-bold text-lg shadow-md`}
                        >
                            {result.prediction.toUpperCase()}
                        </div>
                    </div>

                    {/* Glucose Icon */}
                    <div className="flex justify-center pb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                                <Icon
                                    icon="healthicons:glucose"
                                    className="w-16 h-16 text-gray-300"
                                />
                            </div>
                            {/* Decorative pulse */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} opacity-20 animate-pulse`}></div>
                        </div>
                    </div>

                    {/* Confidence Progress */}
                    <div className="px-8 pb-6">
                        <div className={`${config.lightBg} ${config.borderColor} border rounded-2xl p-4`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Confidence Level
                                </span>
                                <span className={`text-sm font-bold ${config.textColor}`}>
                                    {result.probabilities[result.prediction]?.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${result.probabilities[result.prediction]}%`,
                                    }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} h-2.5 rounded-full`}
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="px-8 pb-8 space-y-4">
                        {/* Range */}
                        <div className={`${config.lightBg} rounded-2xl p-5`}>
                            <div className="flex items-start gap-3">
                                <div className={`${config.color} p-2 rounded-lg`}>
                                    <Icon
                                        icon="heroicons:chart-bar"
                                        className="w-5 h-5 text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                        The Concentration
                                    </p>
                                    <p className={`font-bold ${config.textColor}`}>
                                        {result.range}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-blue-50 rounded-2xl p-5">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon
                                        icon="heroicons:information-circle"
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <p className="text-sm font-semibold text-gray-700">
                                        Interpretation
                                    </p>
                                </div>
                                <div className="pl-7">
                                    <p className="text-sm text-red-600 font-medium leading-relaxed">
                                        Red Intensity: ...
                                    </p>
                                    <p className="text-sm text-blue-600 font-medium leading-relaxed">
                                        Blue Intensity: ...
                                    </p>
                                    <p className="text-sm text-yellow-600 font-medium leading-relaxed">
                                        R/B Ratio: ...
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                                        {result.interpretation}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion */}
                        <div className="bg-purple-50 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-500 p-2 rounded-lg">
                                    <Icon
                                        icon="heroicons:light-bulb"
                                        className="w-5 h-5 text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                        Suggestion
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {result.suggestion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-8 pb-8 flex gap-3">
                        <Link
                            to="/"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-center shadow-sm"
                        >
                            New Test
                        </Link>
                        <button
                            onClick={() => navigate("/history")}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors shadow-sm"
                        >
                            View History
                        </button>
                    </div>
                </motion.div>

                {/* All Probabilities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        All Predictions Probability
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(result.probabilities).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 w-24">
                                    {key}
                                </span>
                                <div className="flex-1 bg-gray-100 rounded-full h-3">
                                    <div
                                        className={`bg-gradient-to-r ${getLabelConfig(key).gradientFrom
                                            } ${getLabelConfig(key).gradientTo} h-3 rounded-full transition-all duration-700`}
                                        style={{ width: `${value}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-16 text-right">
                                    {value.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
