import { predictGlukosaAPI } from "../infrastructure/glukosaApi";
import { GlukosaPrediction } from "../domain/glukosa";

export async function predictGlukosaUseCase(imageFile) {
  const result = await predictGlukosaAPI(imageFile);
  return new GlukosaPrediction(result.prediction, result.probabilities);
}
