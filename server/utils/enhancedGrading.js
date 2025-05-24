// Enhanced grading functions for different question types
const { gradeOpenEndedAnswer } = require('./aiGrading');
const geminiClient = require('./geminiClient');

/**
 * Enhanced semantic equivalence mappings for technical terms
 */
const SEMANTIC_MAPPINGS = {
  // Network terms
  'wan': ['wide area network', 'wide-area network'],
  'lan': ['local area network', 'local-area network'],
  'man': ['metropolitan area network', 'metropolitan-area network'],
  'pan': ['personal area network', 'personal-area network'],
  'vpn': ['virtual private network', 'virtual-private network'],
  'dns': ['domain name system', 'domain name service'],
  'dhcp': ['dynamic host configuration protocol'],
  'tcp': ['transmission control protocol'],
  'udp': ['user datagram protocol'],
  'ip': ['internet protocol'],
  'http': ['hypertext transfer protocol', 'hyper text transfer protocol'],
  'https': ['hypertext transfer protocol secure', 'hyper text transfer protocol secure'],
  'ftp': ['file transfer protocol'],
  'smtp': ['simple mail transfer protocol'],
  'pop3': ['post office protocol version 3', 'post office protocol 3'],
  'imap': ['internet message access protocol'],

  // Hardware terms
  'cpu': ['central processing unit', 'central processor unit', 'processor'],
  'gpu': ['graphics processing unit', 'graphics processor unit'],
  'ram': ['random access memory'],
  'rom': ['read only memory', 'read-only memory'],
  'hdd': ['hard disk drive', 'hard drive'],
  'ssd': ['solid state drive', 'solid-state drive'],
  'usb': ['universal serial bus'],
  'pci': ['peripheral component interconnect'],
  'sata': ['serial advanced technology attachment', 'serial ata'],
  'ide': ['integrated drive electronics'],
  'bios': ['basic input output system', 'basic input/output system'],
  'uefi': ['unified extensible firmware interface'],

  // Software terms
  'os': ['operating system'],
  'gui': ['graphical user interface'],
  'cli': ['command line interface', 'command-line interface'],
  'api': ['application programming interface'],
  'sdk': ['software development kit'],
  'ide': ['integrated development environment'],
  'sql': ['structured query language'],
  'html': ['hypertext markup language', 'hyper text markup language'],
  'css': ['cascading style sheets'],
  'xml': ['extensible markup language'],
  'json': ['javascript object notation'],
  'ajax': ['asynchronous javascript and xml'],

  // Database terms
  'dbms': ['database management system'],
  'rdbms': ['relational database management system'],
  'crud': ['create read update delete', 'create, read, update, delete'],
  'acid': ['atomicity consistency isolation durability'],

  // Security terms
  'ssl': ['secure sockets layer', 'secure socket layer'],
  'tls': ['transport layer security'],
  'aes': ['advanced encryption standard'],
  'rsa': ['rivest shamir adleman'],
  'md5': ['message digest 5'],
  'sha': ['secure hash algorithm'],

  // Storage terms
  'raid': ['redundant array of independent disks', 'redundant array of inexpensive disks'],
  'nas': ['network attached storage', 'network-attached storage'],
  'san': ['storage area network', 'storage-area network']
};

/**
 * Check if two answers are semantically equivalent
 */
const areSemanticallySimilar = (answer1, answer2) => {
  if (!answer1 || !answer2) return false;

  // Normalize both answers
  const normalize = (text) => {
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const norm1 = normalize(answer1);
  const norm2 = normalize(answer2);

  // Direct match
  if (norm1 === norm2) return true;

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  // Check semantic mappings
  for (const [abbrev, expansions] of Object.entries(SEMANTIC_MAPPINGS)) {
    // Check if one is abbreviation and other is expansion
    if ((norm1 === abbrev && expansions.some(exp => norm2.includes(exp))) ||
        (norm2 === abbrev && expansions.some(exp => norm1.includes(exp)))) {
      return true;
    }

    // Check if both are expansions of the same abbreviation
    if (expansions.some(exp => norm1.includes(exp)) &&
        expansions.some(exp => norm2.includes(exp))) {
      return true;
    }
  }

  return false;
};

/**
 * Grade different question types with enhanced accuracy
 * @param {Object} question - The question object
 * @param {Object} answer - The student's answer
 * @param {string} modelAnswer - The correct answer
 * @returns {Promise<Object>} - Grading result
 */
const gradeQuestionByType = async (question, answer, modelAnswer = '') => {
  try {
    console.log(`Grading ${question.type} question: ${question._id}`);

    switch (question.type) {
      case 'multiple-choice':
        return gradeMultipleChoice(question, answer, modelAnswer);

      case 'true-false':
        return gradeTrueFalse(question, answer, modelAnswer);

      case 'fill-in-blank':
        return gradeFillInBlank(question, answer, modelAnswer);

      case 'matching':
        return gradeMatching(question, answer);

      case 'ordering':
        return gradeOrdering(question, answer);

      case 'drag-drop':
        return gradeDragDrop(question, answer);

      case 'open-ended':
        return gradeOpenEndedAnswer(
          answer.textAnswer || '',
          modelAnswer || question.correctAnswer,
          question.points,
          question.text,
          question.type
        );

      default:
        console.warn(`Unknown question type: ${question.type}`);
        return {
          score: 0,
          feedback: 'Unknown question type',
          details: { error: 'Unsupported question type' }
        };
    }
  } catch (error) {
    console.error('Error grading question:', error);
    return {
      score: 0,
      feedback: 'Error occurred during grading',
      details: { error: error.message }
    };
  }
};

/**
 * Grade multiple choice questions with enhanced detection
 */
const gradeMultipleChoice = async (question, answer, modelAnswer) => {
  try {
    console.log(`Grading multiple-choice question: ${question._id}`);

    // Extract the selected option, handling various formats
    let selectedOption = answer.selectedOption || answer.selectedOptionLetter || answer.textAnswer || '';

    // Handle case where answer might be in object format
    if (typeof selectedOption === 'object') {
      selectedOption = String(selectedOption).trim();
    } else {
      selectedOption = String(selectedOption || '').trim();
    }

    console.log(`Selected option: "${selectedOption}"`);

    if (!selectedOption) {
      return {
        score: 0,
        feedback: 'No answer selected',
        details: { answerType: 'no_answer' }
      };
    }

    // Ensure question has options
    if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
      console.log('Question has no valid options, using direct answer comparison for multiple-choice');

      // For multiple choice without options, compare directly with model answer
      if (!modelAnswer) {
        return {
          score: 0,
          feedback: 'No correct answer available for comparison',
          details: { answerType: 'no_model_answer' }
        };
      }

      // Enhanced semantic matching for direct comparison
      let isCorrect = selectedOption.toLowerCase().trim() === modelAnswer.toLowerCase().trim();

      // If not exact match, check semantic equivalence
      if (!isCorrect) {
        isCorrect = areSemanticallySimilar(selectedOption, modelAnswer);
      }

      const score = isCorrect ? (question.points || 1) : 0;

      return {
        score,
        feedback: isCorrect
          ? 'Correct! Well done.'
          : `Incorrect. The correct answer is: ${modelAnswer}`,
        correctedAnswer: modelAnswer,
        details: {
          selectedOption: selectedOption,
          correctAnswer: modelAnswer,
          isCorrect,
          answerType: 'multiple_choice_direct',
          gradingMethod: isCorrect && selectedOption.toLowerCase().trim() !== modelAnswer.toLowerCase().trim()
            ? 'semantic_match' : 'direct_comparison'
        }
      };
    }

    // Find the correct option
    let correctOption = null;
    let isCorrect = false;

    // Find the selected option in the question
    const option = question.options.find(opt => {
      const optLetter = String(opt.letter || '').trim().toLowerCase();
      const optText = String(opt.text || '').trim().toLowerCase();
      const optId = String(opt._id || '').trim();
      const selected = selectedOption.toLowerCase();

      return optLetter === selected ||
             optText === selected ||
             optId === selected ||
             optLetter === selected.charAt(0) || // Handle single letter selection
             selected.includes(optLetter) ||
             selected.includes(optText);
    });

    // Check if we have a model answer to compare against
    if (modelAnswer) {
      // Use AI to determine if the answer is correct
      const answerText = option ? option.text : selectedOption;
      isCorrect = await checkAnswerWithAI(question.text, answerText, modelAnswer, 'multiple-choice');
    } else {
      // Use the question's options to determine correctness
      correctOption = question.options.find(opt => opt.isCorrect);
      if (correctOption && option) {
        isCorrect = option.letter === correctOption.letter ||
                   option.text === correctOption.text ||
                   option._id === correctOption._id;
      } else if (option) {
        // Check if the selected option is marked as correct
        isCorrect = option.isCorrect === true;
      }
    }

    const score = isCorrect ? (question.points || 1) : 0;
    const feedback = isCorrect
      ? 'Correct! Well done.'
      : `Incorrect. The correct answer is: ${correctOption?.text || modelAnswer}`;

    return {
      score,
      feedback,
      correctedAnswer: correctOption?.text || modelAnswer,
      details: {
        selectedOption: option ? option.letter : selectedOption,
        selectedText: option ? option.text : selectedOption,
        correctOption: correctOption?.text || modelAnswer,
        isCorrect,
        answerType: 'multiple_choice',
        gradingMethod: modelAnswer ? 'ai_assisted' : 'predefined'
      }
    };
  } catch (error) {
    console.error('Error grading multiple choice:', error);
    return {
      score: 0,
      feedback: 'Error grading multiple choice question',
      details: {
        error: error.message,
        gradingMethod: 'error_fallback'
      }
    };
  }
};

/**
 * Grade true/false questions
 */
const gradeTrueFalse = async (question, answer, modelAnswer) => {
  try {
    const selectedOption = answer.selectedOption;

    if (!selectedOption) {
      return {
        score: 0,
        feedback: 'No answer selected',
        details: { answerType: 'no_answer' }
      };
    }

    let isCorrect = false;
    let correctAnswer = modelAnswer;

    if (modelAnswer) {
      // Use AI to determine correctness
      isCorrect = await checkAnswerWithAI(question.text, selectedOption, modelAnswer, 'true-false');
    } else {
      // Use the question's options
      const correctOption = question.options.find(opt => opt.isCorrect);
      correctAnswer = correctOption?.text || 'True';
      isCorrect = selectedOption.toLowerCase() === correctAnswer.toLowerCase();
    }

    const score = isCorrect ? question.points : 0;
    const feedback = isCorrect
      ? 'Correct!'
      : `Incorrect. The correct answer is: ${correctAnswer}`;

    return {
      score,
      feedback,
      correctedAnswer: correctAnswer,
      details: {
        selectedOption,
        correctAnswer,
        isCorrect,
        answerType: 'true_false'
      }
    };
  } catch (error) {
    console.error('Error grading true/false:', error);
    return {
      score: 0,
      feedback: 'Error grading true/false question',
      details: { error: error.message }
    };
  }
};

/**
 * Grade fill-in-blank questions with enhanced AI detection
 */
const gradeFillInBlank = async (question, answer, modelAnswer) => {
  try {
    console.log(`Grading fill-in-blank question: ${question._id}`);

    // Extract and clean the student answer
    let studentAnswer = answer.textAnswer || answer.selectedOption || '';

    // Handle case where answer might be in object format
    if (typeof studentAnswer === 'object') {
      studentAnswer = String(studentAnswer).trim();
    } else {
      studentAnswer = String(studentAnswer || '').trim();
    }

    console.log(`Student answer: "${studentAnswer}"`);

    if (!studentAnswer || studentAnswer === '') {
      return {
        score: 0,
        feedback: 'No answer provided for this fill-in-blank question',
        details: { answerType: 'no_answer' }
      };
    }

    // Get the model answer
    let correctAnswer = modelAnswer || question.correctAnswer || '';
    if (typeof correctAnswer === 'object') {
      correctAnswer = String(correctAnswer).trim();
    } else {
      correctAnswer = String(correctAnswer || '').trim();
    }

    console.log(`Model answer: "${correctAnswer}"`);

    // If no model answer is available, try to extract from question text
    if (!correctAnswer) {
      // Look for common patterns in fill-in-blank questions
      const questionText = question.text || '';
      const answerPatterns = [
        /answer:\s*([^.\n]+)/i,
        /correct:\s*([^.\n]+)/i,
        /solution:\s*([^.\n]+)/i
      ];

      for (const pattern of answerPatterns) {
        const match = questionText.match(pattern);
        if (match) {
          correctAnswer = match[1].trim();
          break;
        }
      }
    }

    // Use AI grading for fill-in-blank questions
    const gradingResult = await gradeOpenEndedAnswer(
      studentAnswer,
      correctAnswer,
      question.points || 1,
      question.text || '',
      'fill-in-blank'
    );

    console.log(`Fill-in-blank grading result:`, gradingResult);

    return {
      ...gradingResult,
      details: {
        ...gradingResult.details,
        questionType: 'fill-in-blank',
        studentAnswer: studentAnswer,
        modelAnswer: correctAnswer
      }
    };

  } catch (error) {
    console.error('Error grading fill-in-blank:', error);

    // Fallback grading
    const studentAnswer = String(answer.textAnswer || answer.selectedOption || '').trim();
    const correctAnswer = String(modelAnswer || question.correctAnswer || '').trim();

    let score = 0;
    let feedback = 'Error occurred during grading';

    if (studentAnswer && correctAnswer) {
      // Enhanced comparison fallback with semantic matching
      let isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase() ||
                     correctAnswer.toLowerCase().includes(studentAnswer.toLowerCase()) ||
                     studentAnswer.toLowerCase().includes(correctAnswer.toLowerCase());

      // If not exact match, check semantic equivalence
      if (!isCorrect) {
        isCorrect = areSemanticallySimilar(studentAnswer, correctAnswer);
      }

      score = isCorrect ? (question.points || 1) : 0;
      feedback = isCorrect ? 'Correct answer!' : `Incorrect. The correct answer is: ${correctAnswer}`;
    }

    return {
      score: score,
      feedback: feedback,
      details: {
        error: error.message,
        gradingMethod: 'fallback',
        questionType: 'fill-in-blank'
      }
    };
  }
};

/**
 * Grade matching questions
 */
const gradeMatching = async (question, answer) => {
  try {
    const studentMatches = answer.matchingAnswers || [];
    const correctPairs = question.matchingPairs?.correctPairs || [];

    if (studentMatches.length === 0) {
      return {
        score: 0,
        feedback: 'No matches provided',
        details: { answerType: 'no_answer' }
      };
    }

    let correctCount = 0;
    const totalPairs = correctPairs.length;

    // Check each student match against correct pairs
    for (const studentMatch of studentMatches) {
      const isCorrect = correctPairs.some(correctPair =>
        correctPair.left === studentMatch.left && correctPair.right === studentMatch.right
      );
      if (isCorrect) correctCount++;
    }

    const score = Math.round((correctCount / totalPairs) * question.points);
    const feedback = `You got ${correctCount} out of ${totalPairs} matches correct.`;

    return {
      score,
      feedback,
      details: {
        correctMatches: correctCount,
        totalMatches: totalPairs,
        accuracy: correctCount / totalPairs,
        answerType: 'matching'
      }
    };
  } catch (error) {
    console.error('Error grading matching:', error);
    return {
      score: 0,
      feedback: 'Error grading matching question',
      details: { error: error.message }
    };
  }
};

/**
 * Grade ordering questions
 */
const gradeOrdering = async (question, answer) => {
  try {
    const studentOrder = answer.orderingAnswer || [];
    const correctOrder = question.itemsToOrder?.correctOrder || [];

    if (studentOrder.length === 0) {
      return {
        score: 0,
        feedback: 'No order provided',
        details: { answerType: 'no_answer' }
      };
    }

    // Calculate partial credit for ordering
    let score = 0;
    const totalItems = correctOrder.length;

    // Award points for items in correct positions
    for (let i = 0; i < Math.min(studentOrder.length, correctOrder.length); i++) {
      if (studentOrder[i] === correctOrder[i]) {
        score += question.points / totalItems;
      }
    }

    score = Math.round(score);
    const feedback = `Your ordering is ${Math.round((score / question.points) * 100)}% correct.`;

    return {
      score,
      feedback,
      details: {
        studentOrder,
        correctOrder,
        accuracy: score / question.points,
        answerType: 'ordering'
      }
    };
  } catch (error) {
    console.error('Error grading ordering:', error);
    return {
      score: 0,
      feedback: 'Error grading ordering question',
      details: { error: error.message }
    };
  }
};

/**
 * Grade drag-drop questions
 */
const gradeDragDrop = async (question, answer) => {
  try {
    const studentPlacements = answer.dragDropAnswer || [];
    const correctPlacements = question.dragDropData?.correctPlacements || [];

    if (studentPlacements.length === 0) {
      return {
        score: 0,
        feedback: 'No items placed',
        details: { answerType: 'no_answer' }
      };
    }

    let correctCount = 0;
    const totalPlacements = correctPlacements.length;

    // Check each placement
    for (const studentPlacement of studentPlacements) {
      const isCorrect = correctPlacements.some(correctPlacement =>
        correctPlacement.item === studentPlacement.item &&
        correctPlacement.zone === studentPlacement.zone
      );
      if (isCorrect) correctCount++;
    }

    const score = Math.round((correctCount / totalPlacements) * question.points);
    const feedback = `You placed ${correctCount} out of ${totalPlacements} items correctly.`;

    return {
      score,
      feedback,
      details: {
        correctPlacements: correctCount,
        totalPlacements,
        accuracy: correctCount / totalPlacements,
        answerType: 'drag_drop'
      }
    };
  } catch (error) {
    console.error('Error grading drag-drop:', error);
    return {
      score: 0,
      feedback: 'Error grading drag-drop question',
      details: { error: error.message }
    };
  }
};

/**
 * Use AI to check if an answer is correct
 */
const checkAnswerWithAI = async (questionText, studentAnswer, modelAnswer, questionType) => {
  try {
    // Ensure all inputs are proper strings
    const cleanQuestionText = String(questionText || '').trim();
    const cleanStudentAnswer = String(studentAnswer || '').trim();
    const cleanModelAnswer = String(modelAnswer || '').trim();

    if (!cleanStudentAnswer) {
      return false;
    }

    const model = geminiClient.getModel('gemini-1.5-flash');

    const prompt = `
Determine if the student's answer is semantically equivalent to the model answer for this ${questionType} question.

Question: ${cleanQuestionText}
Model Answer: ${cleanModelAnswer}
Student Answer: ${cleanStudentAnswer}

SEMANTIC EQUIVALENCE RULES:
- "WAN" = "WAN (Wide Area Network)" = "Wide Area Network" (ALL CORRECT)
- "CPU" = "CPU (Central Processing Unit)" = "Central Processing Unit" (ALL CORRECT)
- "RAM" = "RAM (Random Access Memory)" = "Random Access Memory" (ALL CORRECT)
- "OS" = "OS (Operating System)" = "Operating System" (ALL CORRECT)
- Case doesn't matter: "wan" = "WAN" = "Wan" (ALL CORRECT)

IMPORTANT: If the student answer is an abbreviation, expansion, or synonym of the model answer, it should be considered CORRECT.

Respond with only "true" if the answers are semantically equivalent, or "false" if they are different concepts.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();

    return response === 'true';
  } catch (error) {
    console.error('Error checking answer with AI:', error);
    // Enhanced semantic fallback comparison
    const cleanStudent = String(studentAnswer || '').toLowerCase().trim();
    const cleanModel = String(modelAnswer || '').toLowerCase().trim();

    // Remove punctuation for better comparison
    const cleanStudentNoPunct = cleanStudent.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
    const cleanModelNoPunct = cleanModel.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();

    // Check for exact match
    if (cleanStudentNoPunct === cleanModelNoPunct) {
      return true;
    }

    // Check for abbreviation/expansion matches
    if (cleanModelNoPunct.includes(cleanStudentNoPunct) && cleanStudentNoPunct.length >= 2) {
      return true; // Student provided abbreviation
    }

    if (cleanStudentNoPunct.includes(cleanModelNoPunct) && cleanModelNoPunct.length >= 2) {
      return true; // Student provided expansion
    }

    // Use the enhanced semantic mappings
    return areSemanticallySimilar(cleanStudent, cleanModel);
  }
};

module.exports = {
  gradeQuestionByType,
  gradeMultipleChoice,
  gradeTrueFalse,
  gradeFillInBlank,
  gradeMatching,
  gradeOrdering,
  gradeDragDrop,
  checkAnswerWithAI,
  areSemanticallySimilar,
  SEMANTIC_MAPPINGS
};
