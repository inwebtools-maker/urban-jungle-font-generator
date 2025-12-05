import { GoogleGenAI } from "@google/genai";

// Initialize the client only when needed to ensure we have the latest key if it changes
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateJungleImage = async (
  text: string,
  promptTemplate: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Construct the full prompt by injecting the user's text
    const fullPrompt = promptTemplate.replace('${text}', text.toUpperCase());

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error("No response candidates received from the model.");
    }

    // Check if the generation was stopped due to safety or other reasons
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
       if (candidate.finishReason === "SAFETY") {
         throw new Error("Generation was blocked by safety settings. Please try a different text or style.");
       }
       console.warn(`Generation stopped with reason: ${candidate.finishReason}`);
    }

    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      // If no image is found, check if the model returned a text explanation (refusal)
      const textPart = candidate.content.parts.find(p => p.text);
      if (textPart?.text) {
        // Clean up the message a bit if it's verbose
        throw new Error(`Model message: ${textPart.text.substring(0, 200)}...`);
      }
    }

    throw new Error("No image data found in response. The model may have failed to generate the visual content.");
  } catch (error: any) {
    console.error("Error generating jungle image:", error);
    throw error;
  }
};