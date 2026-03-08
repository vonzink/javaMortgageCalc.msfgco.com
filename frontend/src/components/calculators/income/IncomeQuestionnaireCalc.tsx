import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RotateCcw, Calculator } from 'lucide-react';

type IncomeType = 'w2' | 'self-employment' | 'rental' | 'investment' | 'other';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

interface Recommendation {
  name: string;
  slug: string;
  description: string;
}

const INCOME_TYPE_QUESTION: Question = {
  id: 'income-type',
  text: 'What type of income does the borrower receive?',
  options: [
    { label: 'W-2 Wages / Salary', value: 'w2' },
    { label: 'Self-Employment', value: 'self-employment' },
    { label: 'Rental Property', value: 'rental' },
    { label: 'Investment / Passive Income', value: 'investment' },
    { label: 'Other Income Sources', value: 'other' },
  ],
};

const W2_FOLLOW_UP: Question = {
  id: 'w2-type',
  text: 'What type of W-2 income needs to be analyzed?',
  options: [
    { label: 'Standard salary/wages (1040 Page 1)', value: '1040' },
    { label: 'Variable income (overtime, bonus, commission)', value: 'variable' },
    { label: 'Both standard and variable income', value: 'both' },
  ],
};

const SELF_EMPLOYMENT_FOLLOW_UP: Question = {
  id: 'se-type',
  text: 'What type of self-employment entity?',
  options: [
    { label: 'Sole Proprietorship (Schedule C)', value: 'schedule-c' },
    { label: 'Partnership (Form 1065)', value: '1065' },
    { label: 'S-Corporation (Form 1120S)', value: '1120s' },
    { label: 'C-Corporation (Form 1120)', value: '1120' },
    { label: 'Farm Income (Schedule F)', value: 'schedule-f' },
    { label: 'Not sure / Multiple entities', value: 'se-multiple' },
  ],
};

const SE_K1_FOLLOW_UP: Question = {
  id: 'se-k1',
  text: 'Does the borrower have K-1 income from this entity?',
  options: [
    { label: 'Yes - Partnership K-1 (from 1065)', value: 'k1-partnership' },
    { label: 'Yes - S-Corp K-1 (from 1120S)', value: 'k1-1120s' },
    { label: 'No K-1 / Just the business return', value: 'no-k1' },
  ],
};

const RENTAL_FOLLOW_UP: Question = {
  id: 'rental-type',
  text: 'How should the rental income be documented?',
  options: [
    { label: 'Schedule E from tax return (non-subject property)', value: 'schedule-e' },
    { label: 'Schedule E for the subject property', value: 'schedule-e-subject' },
    { label: 'Lease agreement / 1038 worksheet', value: 'rental-1038' },
  ],
};

const INVESTMENT_FOLLOW_UP: Question = {
  id: 'investment-type',
  text: 'What type of investment income?',
  options: [
    { label: 'Interest & Dividends (Schedule B)', value: 'schedule-b' },
    { label: 'Capital Gains (Schedule D)', value: 'schedule-d' },
    { label: 'Pension / Social Security / Alimony (1040)', value: '1040-other' },
  ],
};

const OTHER_FOLLOW_UP: Question = {
  id: 'other-type',
  text: 'What type of other income?',
  options: [
    { label: 'Pension, Annuity, or IRA distributions', value: '1040-pension' },
    { label: 'Social Security', value: '1040-ss' },
    { label: 'Alimony received', value: '1040-alimony' },
    { label: 'Unemployment compensation', value: '1040-unemployment' },
  ],
};

function getRecommendations(answers: Record<string, string>): Recommendation[] {
  const incomeType = answers['income-type'];
  const recs: Recommendation[] = [];

  if (incomeType === 'w2') {
    const w2Type = answers['w2-type'];
    if (w2Type === '1040' || w2Type === 'both') {
      recs.push({
        name: 'Form 1040 Calculator',
        slug: 'form-1040',
        description: 'Calculate W-2 wages, pension, social security, alimony, and unemployment from the 1040.',
      });
    }
    if (w2Type === 'variable' || w2Type === 'both') {
      recs.push({
        name: 'Variable Income Calculator',
        slug: 'variable-income',
        description: 'Analyze variable income trends with YTD paystubs and W-2 history.',
      });
    }
  } else if (incomeType === 'self-employment') {
    const seType = answers['se-type'];
    const k1Type = answers['se-k1'];

    if (seType === 'schedule-c') {
      recs.push({
        name: 'Schedule C Calculator',
        slug: 'schedule-c',
        description: 'Sole proprietorship income from Schedule C.',
      });
    } else if (seType === '1065') {
      recs.push({
        name: 'Form 1065 Calculator',
        slug: 'form-1065',
        description: 'Partnership income from Form 1065.',
      });
      if (k1Type === 'k1-partnership') {
        recs.push({
          name: 'K-1 Partnership Calculator',
          slug: 'k1-partnership',
          description: 'Partnership K-1 income analysis.',
        });
      }
    } else if (seType === '1120s') {
      recs.push({
        name: 'Form 1120S Calculator',
        slug: 'form-1120s',
        description: 'S-Corporation income from Form 1120S.',
      });
      if (k1Type === 'k1-1120s') {
        recs.push({
          name: '1120S K-1 Calculator',
          slug: 'form-1120s-k1',
          description: 'S-Corp K-1 income analysis.',
        });
      }
    } else if (seType === '1120') {
      recs.push({
        name: 'Form 1120 Calculator',
        slug: 'form-1120',
        description: 'C-Corporation income from Form 1120.',
      });
    } else if (seType === 'schedule-f') {
      recs.push({
        name: 'Schedule F Calculator',
        slug: 'schedule-f',
        description: 'Farm income from Schedule F.',
      });
    } else if (seType === 'se-multiple') {
      recs.push(
        { name: 'Schedule C Calculator', slug: 'schedule-c', description: 'Sole proprietorship income.' },
        { name: 'Form 1065 Calculator', slug: 'form-1065', description: 'Partnership income.' },
        { name: 'Form 1120S Calculator', slug: 'form-1120s', description: 'S-Corp income.' },
        { name: 'Form 1120 Calculator', slug: 'form-1120', description: 'C-Corp income.' },
      );
    }
  } else if (incomeType === 'rental') {
    const rentalType = answers['rental-type'];
    if (rentalType === 'schedule-e') {
      recs.push({
        name: 'Schedule E Calculator',
        slug: 'schedule-e',
        description: 'Non-subject property rental income from Schedule E.',
      });
    } else if (rentalType === 'schedule-e-subject') {
      recs.push({
        name: 'Schedule E Subject Property Calculator',
        slug: 'schedule-e-subject',
        description: 'Subject property rental income from Schedule E.',
      });
    } else if (rentalType === 'rental-1038') {
      recs.push({
        name: 'Rental 1038 Calculator',
        slug: 'rental-1038',
        description: 'Rental income via Schedule E or lease agreement method.',
      });
    }
  } else if (incomeType === 'investment') {
    const invType = answers['investment-type'];
    if (invType === 'schedule-b') {
      recs.push({
        name: 'Schedule B Calculator',
        slug: 'schedule-b',
        description: 'Interest and dividend income from Schedule B.',
      });
    } else if (invType === 'schedule-d') {
      recs.push({
        name: 'Schedule D Calculator',
        slug: 'schedule-d',
        description: 'Capital gains and losses from Schedule D.',
      });
    } else if (invType === '1040-other') {
      recs.push({
        name: 'Form 1040 Calculator',
        slug: 'form-1040',
        description: 'Pension, Social Security, and other income from page 1 of the 1040.',
      });
    }
  } else if (incomeType === 'other') {
    recs.push({
      name: 'Form 1040 Calculator',
      slug: 'form-1040',
      description: 'Covers pension, Social Security, alimony, and unemployment income.',
    });
  }

  if (recs.length === 0) {
    recs.push({
      name: 'Form 1040 Calculator',
      slug: 'form-1040',
      description: 'Start with the 1040 for general income analysis.',
    });
  }

  return recs;
}

function getFollowUpQuestion(answers: Record<string, string>): Question | null {
  const incomeType = answers['income-type'];

  if (!incomeType) return null;

  if (incomeType === 'w2' && !answers['w2-type']) return W2_FOLLOW_UP;
  if (incomeType === 'self-employment') {
    if (!answers['se-type']) return SELF_EMPLOYMENT_FOLLOW_UP;
    const seType = answers['se-type'];
    if ((seType === '1065' || seType === '1120s') && !answers['se-k1']) return SE_K1_FOLLOW_UP;
  }
  if (incomeType === 'rental' && !answers['rental-type']) return RENTAL_FOLLOW_UP;
  if (incomeType === 'investment' && !answers['investment-type']) return INVESTMENT_FOLLOW_UP;
  if (incomeType === 'other' && !answers['other-type']) return OTHER_FOLLOW_UP;

  return null;
}

export default function IncomeQuestionnaireCalc() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);

  const currentQuestion = !answers['income-type']
    ? INCOME_TYPE_QUESTION
    : getFollowUpQuestion(answers);

  const isComplete = answers['income-type'] && !currentQuestion;
  const recommendations = isComplete ? getRecommendations(answers) : [];

  const handleAnswer = (questionId: string, value: string) => {
    setHistory((prev) => [...prev, questionId]);
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleBack = () => {
    const prevQuestionId = history[history.length - 1];
    if (!prevQuestionId) return;
    setHistory((prev) => prev.slice(0, -1));
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[prevQuestionId];
      return next;
    });
  };

  const handleReset = () => {
    setAnswers({});
    setHistory([]);
  };

  const stepNumber = history.length + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Income Calculator Guide</h1>
        <p className="text-gray-500 mt-1">
          Answer a few questions to find the right income calculator for your scenario.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Step {stepNumber}</span>
        <span className="text-gray-300">|</span>
        <span>{isComplete ? 'Recommendations' : 'Questionnaire'}</span>
      </div>

      {/* Question or Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {!isComplete && currentQuestion ? (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentQuestion.text}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700">
                    {opt.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Recommended Calculator{recommendations.length > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Based on your answers, use the following calculator{recommendations.length > 1 ? 's' : ''}:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.slug}
                  to={`/calculators/${rec.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-gray-800 group-hover:text-brand-700">
                        {rec.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-200">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
