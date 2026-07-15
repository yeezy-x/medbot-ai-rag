import type {
  RetrievalEvaluationQuery,
} from "../types/evaluation.types";

export const RETRIEVAL_EVALUATION_QUERIES:
  RetrievalEvaluationQuery[] = [

  /*
   * Category A:
   * Clearly grounded medical questions.
   */
  {
    id: "grounded-001",
    category: "GROUNDED_MEDICAL",
    query:
      "What are the symptoms of AIDS?",
  },

  {
    id: "grounded-002",
    category: "GROUNDED_MEDICAL",
    query:
      "What are the symptoms of diabetes?",
  },

  {
    id: "grounded-003",
    category: "GROUNDED_MEDICAL",
    query:
      "What causes Alzheimer's disease?",
  },

  {
    id: "grounded-004",
    category: "GROUNDED_MEDICAL",
    query:
      "What are the symptoms of asthma?",
  },

  {
    id: "grounded-005",
    category: "GROUNDED_MEDICAL",
    query:
      "How is tuberculosis diagnosed?",
  },

  /*
   * Category B:
   * More specific medical questions.
   */
  {
    id: "specific-001",
    category: "SPECIFIC_MEDICAL",
    query:
      "What complications can occur from untreated diabetes?",
  },

  {
    id: "specific-002",
    category: "SPECIFIC_MEDICAL",
    query:
      "What are the risk factors for Alzheimer's disease?",
  },

  {
    id: "specific-003",
    category: "SPECIFIC_MEDICAL",
    query:
      "How is asthma treated?",
  },

  {
    id: "specific-004",
    category: "SPECIFIC_MEDICAL",
    query:
      "What diagnostic tests are used for HIV infection?",
  },

  /*
   * Category C:
   * Fictional or unsupported medical questions.
   */
  {
    id: "unsupported-001",
    category: "UNSUPPORTED_MEDICAL",
    query:
      "What is the dosage of Zorvexal-900 for lunar fever?",
  },

  {
    id: "unsupported-002",
    category: "UNSUPPORTED_MEDICAL",
    query:
      "How is quantum blood syndrome treated?",
  },

  {
    id: "unsupported-003",
    category: "UNSUPPORTED_MEDICAL",
    query:
      "What are the symptoms of Martian influenza?",
  },

  /*
   * Category D:
   * Completely non-medical questions.
   */
  {
    id: "non-medical-001",
    category: "NON_MEDICAL",
    query:
      "What is the capital of France?",
  },

  {
    id: "non-medical-002",
    category: "NON_MEDICAL",
    query:
      "Who wrote Hamlet?",
  },

  {
    id: "non-medical-003",
    category: "NON_MEDICAL",
    query:
      "How do I center a div in CSS?",
  },
];