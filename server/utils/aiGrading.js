// Import the centralized Gemini client
const geminiClient = require('./geminiClient');

/**
 * Enhanced AI grading system with improved accuracy and reliability
 * @param {string} studentAnswer - The student's answer
 * @param {string} modelAnswer - The model answer to compare against
 * @param {number} maxPoints - Maximum points for the question
 * @param {string} questionText - The original question text for context
 * @param {string} questionType - Type of question (multiple-choice, open-ended, etc.)
 * @returns {Object} - Score, feedback, and detailed analysis
 */
const gradeOpenEndedAnswer = async (studentAnswer, modelAnswer, maxPoints, questionText = '', questionType = 'open-ended') => {
  try {
    console.log(`Starting enhanced AI grading for ${questionType} question...`);

    // Enhanced input validation
    if (!studentAnswer || typeof studentAnswer !== 'string' || studentAnswer.trim().length === 0) {
      return {
        score: 0,
        feedback: 'No answer provided',
        correctedAnswer: modelAnswer || 'No model answer available',
        details: {
          questionType: questionType,
          gradingMethod: 'no_answer',
          error: 'Empty or invalid student answer'
        }
      };
    }

    // Validate maxPoints
    if (!maxPoints || maxPoints <= 0) {
      console.warn('Invalid maxPoints provided, defaulting to 1');
      maxPoints = 1;
    }

    // Clean and prepare inputs with better sanitization
    const cleanStudentAnswer = String(studentAnswer).trim().replace(/\s+/g, ' ');
    const cleanModelAnswer = String(modelAnswer || '').trim().replace(/\s+/g, ' ');
    const cleanQuestionText = String(questionText || '').trim().replace(/\s+/g, ' ');

    // Enhanced model answer validation
    if (!cleanModelAnswer ||
        cleanModelAnswer === 'Not provided' ||
        cleanModelAnswer === 'Sample answer' ||
        cleanModelAnswer.length < 10) {
      console.log('No valid model answer provided, using lenient grading approach');
      return generateFallbackScore(cleanStudentAnswer, '', maxPoints, 'No model answer provided');
    }

    // For fill-in-blank questions, be more lenient with short answers
    if (questionType === 'fill-in-blank') {
      // For fill-in-blank, short answers are often correct (like "CPU", "RAM", etc.)
      // Only check if answer is extremely short (1 character) or empty
      if (cleanStudentAnswer.length < 2) {
        return {
          score: 0,
          feedback: 'Your answer is too brief. Please provide a complete answer.',
          correctedAnswer: cleanModelAnswer,
          details: {
            questionType: questionType,
            gradingMethod: 'too_brief',
            answerLength: cleanStudentAnswer.length
          }
        };
      }
    } else {
      // For other question types, check for minimum answer length
      if (cleanStudentAnswer.length < 5) {
        return {
          score: Math.round(maxPoints * 0.1), // Give minimal credit for very short answers
          feedback: 'Your answer is too brief. Please provide more detailed explanation.',
          correctedAnswer: cleanModelAnswer,
          details: {
            questionType: questionType,
            gradingMethod: 'too_brief',
            answerLength: cleanStudentAnswer.length
          }
        };
      }
    }

    // Get the generative model from our centralized client
    const model = geminiClient.getModel('gemini-1.5-flash'); // Use flash for better performance

    // Create an enhanced prompt for semantic understanding and grading
    const prompt = `
You are an expert AI exam grader specializing in academic assessment with deep knowledge of computer systems, technology, and educational standards. Your task is to provide accurate, fair, and constructive grading that recognizes semantic equivalence.

GRADING CONTEXT:
Question Type: ${questionType}
Question Text: ${cleanQuestionText || 'Not provided'}
Maximum Points: ${maxPoints}
Model Answer: ${cleanModelAnswer}
Student Answer: ${cleanStudentAnswer}

SEMANTIC GRADING GUIDELINES:
1. RECOGNIZE EQUIVALENT MEANINGS: If the student answer means the same as the model answer, award full points
2. HANDLE ABBREVIATIONS: "WAN" = "WAN (Wide Area Network)" = "Wide Area Network" (all should get full points)
3. ACCEPT SYNONYMS: "CPU" = "Central Processing Unit" = "Processor" = "Central Processor"
4. TECHNICAL TERMS: "RAM" = "Random Access Memory" = "Memory" (in appropriate context)
5. CASE INSENSITIVE: "cpu" = "CPU" = "Cpu" (all equivalent)
6. PARTIAL EXPANSIONS: "Hard disk" = "Hard disk drive" = "HDD" (all correct)
7. COMMON VARIATIONS: "Operating System" = "OS" = "System Software" (context dependent)

GRADING CRITERIA:
1. ACCURACY (40%): How factually correct is the answer?
2. COMPLETENESS (30%): Does the answer address all parts of the question?
3. UNDERSTANDING (20%): Does the student demonstrate clear understanding of concepts?
4. CLARITY (10%): Is the answer well-structured and clearly expressed?

SEMANTIC EQUIVALENCE RULES (MOST IMPORTANT - FOLLOW THESE EXACTLY):
- If student answer is an abbreviation of model answer → AWARD FULL POINTS (${maxPoints})
- If student answer is an expansion of model answer → AWARD FULL POINTS (${maxPoints})
- If student answer means exactly the same thing → AWARD FULL POINTS (${maxPoints})
- Case differences don't matter: "wan" = "WAN" = "Wan" → AWARD FULL POINTS (${maxPoints})
- Technical terms: "CPU" = "Central Processing Unit" → AWARD FULL POINTS (${maxPoints})
- Network terms: "WAN" = "Wide Area Network" → AWARD FULL POINTS (${maxPoints})
- Storage terms: "RAM" = "Random Access Memory" → AWARD FULL POINTS (${maxPoints})
- System terms: "OS" = "Operating System" → AWARD FULL POINTS (${maxPoints})

SPECIFIC EXAMPLES FOR FULL POINTS:
- Model: "WAN (Wide Area Network)" | Student: "WAN" → ${maxPoints}/${maxPoints} points
- Model: "CPU (Central Processing Unit)" | Student: "CPU" → ${maxPoints}/${maxPoints} points
- Model: "Random Access Memory" | Student: "RAM" → ${maxPoints}/${maxPoints} points
- Model: "Operating System" | Student: "OS" → ${maxPoints}/${maxPoints} points
- Model: "Hard Disk Drive" | Student: "Hard disk" → ${maxPoints}/${maxPoints} points
- Model: "Motherboard" | Student: "motherboard" → ${maxPoints}/${maxPoints} points

GRADING GUIDELINES:
- Award full points (${maxPoints}) for semantically equivalent answers
- Award 75-90% only if answer is incomplete but mostly correct
- Award 50-74% only if answer shows understanding but has significant errors
- Award 25-49% only if answer shows some understanding but is largely wrong
- Award 0-24% only if answer is completely incorrect or irrelevant

CRITICAL RULE: DO NOT reduce points for abbreviations, expansions, or case differences if the meaning is correct!

RESPONSE FORMAT:
Return your response as valid JSON with this exact structure:
{
  "score": [number between 0 and ${maxPoints}],
  "feedback": "[Detailed constructive feedback explaining the score, what was done well, and areas for improvement]",
  "correctedAnswer": "[The model answer or an improved version of the student's answer]",
  "keyConceptsPresent": ["[concept1]", "[concept2]"],
  "keyConceptsMissing": ["[concept3]", "[concept4]"],
  "confidenceLevel": "[high|medium|low]",
  "partialCreditBreakdown": {
    "accuracy": [score out of ${Math.round(maxPoints * 0.4)}],
    "completeness": [score out of ${Math.round(maxPoints * 0.3)}],
    "understanding": [score out of ${Math.round(maxPoints * 0.2)}],
    "clarity": [score out of ${Math.round(maxPoints * 0.1)}]
  }
}

IMPORTANT:
- Provide specific, actionable feedback
- Be encouraging while being honest about areas needing improvement
- Ensure the total score matches the sum of partial credit components
- Only return valid JSON, no additional text
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

      // Add timeout to avoid hanging if API is unresponsive - reduced to 8 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API request timed out')), 8000);
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

        // Validate the response structure
        if (typeof grading.score !== 'number' || grading.score < 0 || grading.score > maxPoints) {
          console.warn('Invalid score in AI response, using fallback');
          throw new Error('Invalid score in AI response');
        }

        return {
          score: Math.round(grading.score * 100) / 100, // Round to 2 decimal places
          feedback: grading.feedback || 'No feedback provided',
          correctedAnswer: grading.correctedAnswer || modelAnswer,
          details: {
            keyConceptsPresent: grading.keyConceptsPresent || [],
            keyConceptsMissing: grading.keyConceptsMissing || [],
            confidenceLevel: grading.confidenceLevel || 'medium',
            partialCreditBreakdown: grading.partialCreditBreakdown || {},
            questionType: questionType,
            gradingMethod: 'enhanced_ai'
          }
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw AI response:', jsonText.substring(0, 200) + '...');

        // Enhanced fallback scoring
        return generateFallbackScore(studentAnswer, modelAnswer, maxPoints, 'AI parsing failed');
      }
    } catch (aiError) {
      console.error('Error generating AI content:', aiError);
      throw aiError; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error using AI grading:', error);
    return generateFallbackScore(studentAnswer, modelAnswer, maxPoints, error.message);
  }
};

/**
 * Generate enhanced fallback score when AI grading fails
 * @param {string} studentAnswer - The student's answer
 * @param {string} modelAnswer - The model answer
 * @param {number} maxPoints - Maximum points
 * @param {string} errorReason - Reason for fallback
 * @returns {Object} - Fallback grading result
 */
const generateFallbackScore = (studentAnswer, modelAnswer, maxPoints, errorReason) => {
  console.log('Generating enhanced fallback score...');

  // Enhanced fallback grading mechanism
  const studentAns = String(studentAnswer || '').toLowerCase().trim();
  const modelAns = String(modelAnswer || '').toLowerCase().trim();

  // Handle empty student answer
  if (!studentAns) {
    return {
      score: 0,
      feedback: 'No answer provided',
      correctedAnswer: modelAnswer || '',
      details: {
        gradingMethod: 'fallback_no_answer',
        errorReason: errorReason
      }
    };
  }

  // Handle empty model answer
  if (!modelAns) {
    // Give partial credit for any answer when no model answer is available
    const score = Math.round(maxPoints * 0.5);
    return {
      score: score,
      feedback: 'Answer provided but cannot be fully evaluated due to missing model answer',
      correctedAnswer: '',
      details: {
        gradingMethod: 'fallback_no_model',
        errorReason: 'No model answer provided'
      }
    };
  }

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
        gradingMethod: 'fallback_exact_match',
        errorReason: errorReason
      }
    };
  }

  // Enhanced semantic matching for abbreviations and expansions
  const cleanStudentAns = studentAns.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
  const cleanModelAns = modelAns.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();

  // Check for exact match after cleaning
  if (cleanStudentAns === cleanModelAns) {
    console.log('Exact match found after cleaning punctuation!');
    return {
      score: maxPoints,
      feedback: 'Your answer is correct! It matches the expected answer.',
      correctedAnswer: modelAnswer,
      details: {
        matchPercentage: 1.0,
        exactMatch: true,
        gradingMethod: 'fallback_exact_match_cleaned',
        errorReason: errorReason
      }
    };
  }

  // Check if student answer is contained in model answer (abbreviation case)
  // e.g., "WAN" is contained in "WAN (Wide Area Network)"
  if (cleanModelAns.includes(cleanStudentAns) && cleanStudentAns.length >= 2) {
    console.log('Student answer is an abbreviation of the model answer!');
    return {
      score: maxPoints,
      feedback: 'Your answer is correct! You provided the correct abbreviation.',
      correctedAnswer: modelAnswer,
      details: {
        matchPercentage: 1.0,
        abbreviationMatch: true,
        gradingMethod: 'fallback_abbreviation_match',
        errorReason: errorReason
      }
    };
  }

  // Check if model answer is contained in student answer (expansion case)
  // e.g., "Wide Area Network" contains "WAN"
  if (cleanStudentAns.includes(cleanModelAns) && cleanModelAns.length >= 2) {
    console.log('Student answer is an expansion of the model answer!');
    return {
      score: maxPoints,
      feedback: 'Your answer is correct! You provided the expanded form.',
      correctedAnswer: modelAnswer,
      details: {
        matchPercentage: 1.0,
        expansionMatch: true,
        gradingMethod: 'fallback_expansion_match',
        errorReason: errorReason
      }
    };
  }

  // Check for common technical abbreviations and their expansions
  const technicalMappings = {
    'wan': ['wide area network', 'wan (wide area network)'],
    'lan': ['local area network', 'lan (local area network)'],
    'cpu': ['central processing unit', 'cpu (central processing unit)', 'processor'],
    'ram': ['random access memory', 'ram (random access memory)', 'memory'],
    'rom': ['read only memory', 'rom (read only memory)'],
    'os': ['operating system', 'os (operating system)'],
    'hdd': ['hard disk drive', 'hdd (hard disk drive)', 'hard disk'],
    'ssd': ['solid state drive', 'ssd (solid state drive)'],
    'usb': ['universal serial bus', 'usb (universal serial bus)'],
    'url': ['uniform resource locator', 'url (uniform resource locator)'],
    'html': ['hypertext markup language', 'html (hypertext markup language)'],
    'http': ['hypertext transfer protocol', 'http (hypertext transfer protocol)'],
    'ftp': ['file transfer protocol', 'ftp (file transfer protocol)']
  };

  // Check if there's a semantic match using technical mappings
  for (const [abbrev, expansions] of Object.entries(technicalMappings)) {
    if (cleanStudentAns === abbrev && expansions.some(exp => cleanModelAns.includes(exp))) {
      console.log(`Found semantic match: ${cleanStudentAns} matches ${cleanModelAns}`);
      return {
        score: maxPoints,
        feedback: 'Your answer is correct! You used the correct technical abbreviation.',
        correctedAnswer: modelAnswer,
        details: {
          matchPercentage: 1.0,
          semanticMatch: true,
          gradingMethod: 'fallback_semantic_match',
          errorReason: errorReason
        }
      };
    }

    if (expansions.includes(cleanStudentAns) && cleanModelAns === abbrev) {
      console.log(`Found semantic match: ${cleanStudentAns} matches ${cleanModelAns}`);
      return {
        score: maxPoints,
        feedback: 'Your answer is correct! You provided the full technical term.',
        correctedAnswer: modelAnswer,
        details: {
          matchPercentage: 1.0,
          semanticMatch: true,
          gradingMethod: 'fallback_semantic_match',
          errorReason: errorReason
        }
      };
    }
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
      gradingMethod: 'fallback_keyword_matching',
      errorReason: errorReason
    }
  };
};

module.exports = {
  gradeOpenEndedAnswer
};
