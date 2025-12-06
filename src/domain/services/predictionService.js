
import { supabase } from '../../infrastructure/supabaseClient';

export const predictionService = {
    async createPrediction(userId, imageFile) {
        try {
            // 1. Upload image to storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('prediction-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('prediction-images')
                .getPublicUrl(filePath);

            // 2. Create initial prediction record
            const { data, error } = await supabase
                .from('predictions')
                .insert([
                    {
                        user_id: userId,
                        image_url: publicUrl,
                        prediction_date: new Date().toISOString().split('T')[0],
                        label: 'Processing...', // Temporary until prediction completes
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },

    async updatePrediction(predictionId, results) {
        try {
            const { data, error } = await supabase
                .from('predictions')
                .update({
                    label: results.label,
                    confidence_score: results.confidenceScore,
                    range_value: results.rangeValue,
                    interpretation: results.interpretation,
                    suggestion: results.suggestion,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', predictionId)
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },

    async getUserPredictions(userId, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('predictions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    }
};
