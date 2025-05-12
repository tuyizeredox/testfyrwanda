/**
 * Centralized Gemini API client configuration
 * This file ensures consistent API version settings across the application
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create a custom configuration for the Gemini API client
const createGeminiClient = () => {
  // Get API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  // Create the client with explicit API version
  // The second parameter is the requestOptions object
  const genAI = new GoogleGenerativeAI(apiKey);

  // Create a function to get a model with the correct API version
  const getModel = (modelName = 'gemini-pro') => {
    // Map of model name variations to try - based on Google's documentation
    const modelVariations = {
      'gemini-pro': ['gemini-1.5-pro', 'models/gemini-1.5-pro', 'gemini-1.5-flash', 'models/gemini-1.5-flash'],
      'gemini-1.0-pro': ['gemini-1.5-pro', 'models/gemini-1.5-pro', 'gemini-1.5-flash', 'models/gemini-1.5-flash']
    };

    // Get the variations to try based on the requested model
    const variationsToTry = modelVariations[modelName] || [modelName, `models/${modelName}`];

    // Log which model we're trying to create
    console.log(`Attempting to create Gemini model with variations of ${modelName} using API version v1`);

    // Try the first variation
    const firstVariation = variationsToTry[0];
    console.log(`Using model name: ${firstVariation}`);

    // Create the model with explicit API version
    const model = genAI.getGenerativeModel({
      model: firstVariation
    }, {
      // Force v1 API version in the request options
      apiVersion: 'v1'
    });

    // Store the other variations to try if the first one fails
    model._alternativeNames = variationsToTry.slice(1);

    // Wrap the generateContent method to handle fallbacks
    const originalGenerateContent = model.generateContent.bind(model);
    model.generateContent = async function(request) {
      try {
        console.log(`Attempting to generate content with model: ${firstVariation}`);
        console.log(`API Version: v1`);
        console.log(`Request:`, JSON.stringify(request, null, 2));

        // Try with the current model name
        return await originalGenerateContent(request);
      } catch (error) {
        console.error(`Error generating content with model ${firstVariation}:`, error);
        console.error(`Error status: ${error.status}, message: ${error.message}`);

        // If we have alternative names to try and this is a 404 error
        if (model._alternativeNames && model._alternativeNames.length > 0 &&
            (error.status === 404 || error.status === 400)) {
          // Get the next model name to try
          const nextModelName = model._alternativeNames.shift();
          console.log(`First model name failed. Trying alternative: ${nextModelName}`);

          // Create a new model with the alternative name
          const alternativeModel = genAI.getGenerativeModel({
            model: nextModelName
          }, {
            apiVersion: 'v1'
          });

          // Try with the alternative model
          try {
            console.log(`Attempting to generate content with alternative model: ${nextModelName}`);
            return await alternativeModel.generateContent(request);
          } catch (altError) {
            console.error(`Error with alternative model ${nextModelName}:`, altError);
            // If we have more alternatives, continue with the loop
            if (model._alternativeNames.length > 0) {
              // Recursively try the next alternative
              return await model.generateContent(request);
            }
            throw altError;
          }
        }

        // If no alternatives or not a 404/400 error, rethrow
        throw error;
      }
    };

    return model;
  };

  return {
    genAI,
    getModel
  };
};

// Export a singleton instance
const geminiClient = createGeminiClient();
module.exports = geminiClient;
