// Import the centralized Gemini client
const geminiClient = require('./geminiClient');

/**
 * Grade an open-ended answer using Google Gemini API
 * @param {string} studentAnswer - The student's answer
 * @param {string} modelAnswer - The model answer to compare against
 * @param {number} maxPoints - Maximum points for the question
 * @returns {Object} - Score and feedback
 */
const gradeOpenEndedAnswer = async (studentAnswer, modelAnswer, maxPoints) => {
  try {
    // Get the generative model from our centralized client
    // Our geminiClient will try multiple model name variations
    const model = geminiClient.getModel('gemini-pro');

    // Create the prompt for grading
    const prompt = `
    You are an AI exam grader for students in Rwanda with up-to-date knowledge of modern technology and computer systems. Grade the following student answer based on the model answer.

    Model Answer: "${modelAnswer}"

    Student Answer: "${studentAnswer}"

    Maximum Points: ${maxPoints}

    Important guidelines:
    - Use current, up-to-date knowledge when evaluating answers
    - Consider that there may be multiple valid answers to technical questions
    - For example, both USB and PS/2 could be valid answers for keyboard connections, with USB being more modern
    - Accept answers that are technically correct even if they differ from the model answer
    - Be flexible with terminology if the student's answer demonstrates understanding of the concept

    Please analyze the student's answer and provide:
    1. A score between 0 and ${maxPoints} based on how well the student's answer demonstrates understanding of the concepts.
    2. Detailed feedback explaining the score, including specific strengths and areas for improvement.
    3. Identify key concepts that were present or missing.
    4. Provide a corrected answer that shows what a perfect answer would include.

    Format your response as a JSON object with the following structure:
    {
      "score": (number between 0 and ${maxPoints}),
      "feedback": "your detailed feedback here, including specific strengths and areas for improvement",
      "keyConceptsPresent": ["concept1", "concept2", ...],
      "keyConceptsMissing": ["concept3", "concept4", ...],
      "correctedAnswer": "a model answer that would receive full points"
    }

    Be encouraging but honest in your feedback. Focus on helping the student improve.
    Only return the JSON object, nothing else.
    `;

    // Set generation config for better JSON output
    const generationConfig = {
      temperature: 0.2,  // Lower temperature for more deterministic output
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    };

    // Generate content with proper error handling
    try {
      console.log('Sending grading request to Gemini API...');

      // Add timeout to avoid hanging if API is unresponsive
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API request timed out')), 15000);
      });

      // Race the API call against the timeout
      const result = await Promise.race([
        model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
        }),
        timeoutPromise
      ]);

      console.log('Received grading response from Gemini API');

      const response = await result.response;
      const text = response.text();

      // Clean up the response to ensure it's valid JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in AI response');
      }

      const jsonText = text.substring(jsonStart, jsonEnd);
      console.log('Successfully extracted JSON from AI grading response');

      // Parse the JSON response
      try {
        const grading = JSON.parse(jsonText);
        return {
          score: grading.score,
          feedback: grading.feedback,
          correctedAnswer: grading.correctedAnswer || modelAnswer,
          details: {
            keyConceptsPresent: grading.keyConceptsPresent,
            keyConceptsMissing: grading.keyConceptsMissing
          }
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to a simple scoring mechanism
        return {
          score: studentAnswer.toLowerCase().includes(modelAnswer.toLowerCase()) ? maxPoints / 2 : 0,
          feedback: 'Error in AI grading. Score assigned based on basic keyword matching.',
          details: {
            error: 'Failed to parse AI response'
          }
        };
      }
    } catch (aiError) {
      console.error('Error generating AI content:', aiError);
      throw aiError; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error using AI grading:', error);

    // Enhanced fallback grading mechanism
    const studentAns = studentAnswer.toLowerCase().trim();
    const modelAns = modelAnswer.toLowerCase().trim();

    // First check for exact match (case-insensitive and ignoring extra whitespace)
    if (studentAns === modelAns) {
      console.log('Exact match found between student answer and model answer!');
      return {
        score: maxPoints,
        feedback: 'Your answer is exactly correct! It matches the expected answer perfectly.',
        correctedAnswer: modelAnswer,
        details: {
          matchPercentage: 1.0,
          exactMatch: true,
          error: error.message
        }
      };
    }

    // Check for near-exact match (removing punctuation and parentheses)
    const cleanStudentAns = studentAns.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
    const cleanModelAns = modelAns.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");

    if (cleanStudentAns === cleanModelAns) {
      console.log('Near-exact match found between student answer and model answer!');
      return {
        score: maxPoints,
        feedback: 'Your answer is correct! It matches the expected answer.',
        correctedAnswer: modelAnswer,
        details: {
          matchPercentage: 1.0,
          nearExactMatch: true,
          error: error.message
        }
      };
    }

    // Check if student answer contains key phrases from model answer
    // Use a more lenient approach - include words of 3 or more characters
    const modelKeywords = modelAns.split(/\s+/).filter(word => word.length >= 3);

    // Count matches, giving partial credit for partial matches
    let matchCount = 0;
    for (const keyword of modelKeywords) {
      if (studentAns.includes(keyword)) {
        matchCount += 1; // Full match
      } else if (keyword.length > 4) {
        // For longer words, check if at least 70% of the word is present
        const partialMatches = studentAns.split(/\s+/).filter(word =>
          word.length >= 3 &&
          (keyword.includes(word) || word.includes(keyword.substring(0, Math.floor(keyword.length * 0.7))))
        );
        if (partialMatches.length > 0) {
          matchCount += 0.5; // Partial match
        }
      }
    }

    // Calculate match percentage with a minimum score to avoid zero scores
    const matchPercentage = modelKeywords.length > 0
      ? Math.max(0.2, matchCount / modelKeywords.length) // Minimum 20% score
      : 0.2;

    // Assign score based on keyword match percentage
    const score = Math.round(matchPercentage * maxPoints);

    // Generate appropriate feedback based on score
    let feedback;
    if (score >= maxPoints * 0.8) {
      feedback = 'Your answer covers most of the key concepts from the model answer.';
    } else if (score >= maxPoints * 0.5) {
      feedback = 'Your answer includes some important concepts, but is missing others.';
    } else if (score >= maxPoints * 0.3) {
      feedback = 'Your answer touches on a few key points, but needs more development.';
    } else {
      feedback = 'Your answer is missing most of the key concepts expected in the model answer.';
    }

    console.log(`Applied fallback grading with score: ${score}/${maxPoints} (${Math.round(matchPercentage * 100)}% match)`);

    return {
      score: score,
      feedback: `${feedback} (Note: This was graded using keyword matching due to AI grading unavailability)`,
      correctedAnswer: modelAnswer,
      details: {
        matchPercentage: matchPercentage,
        keywordsFound: matchCount,
        totalKeywords: modelKeywords.length,
        error: error.message
      }
    };
  }
};

module.exports = {
  gradeOpenEndedAnswer
};
