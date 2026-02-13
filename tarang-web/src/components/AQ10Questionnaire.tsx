"use client"
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface AQ10QuestionnaireProps {
    responses: number[]
    onResponseChange: (index: number, value: number) => void
    onComplete: () => void
}

const AQ10_QUESTIONS = [
    {
        id: 1,
        text: "I often notice small sounds when others do not",
        category: "Sensory Sensitivity"
    },
    {
        id: 2,
        text: "I usually concentrate more on the whole picture, rather than small details",
        category: "Attention to Detail",
        reverse: true
    },
    {
        id: 3,
        text: "I find it easy to do more than one thing at once",
        category: "Multitasking",
        reverse: true
    },
    {
        id: 4,
        text: "If there is an interruption, I can switch back to what I was doing very quickly",
        category: "Task Switching",
        reverse: true
    },
    {
        id: 5,
        text: "I find it easy to 'read between the lines' when someone is talking to me",
        category: "Social Communication",
        reverse: true
    },
    {
        id: 6,
        text: "I know how to tell if someone listening to me is getting bored",
        category: "Social Awareness",
        reverse: true
    },
    {
        id: 7,
        text: "When I'm reading a story, I find it difficult to work out the characters' intentions",
        category: "Theory of Mind"
    },
    {
        id: 8,
        text: "I like to collect information about categories of things",
        category: "Special Interests"
    },
    {
        id: 9,
        text: "I find it easy to work out what someone is thinking or feeling just by looking at their face",
        category: "Emotion Recognition",
        reverse: true
    },
    {
        id: 10,
        text: "I find it difficult to work out people's intentions",
        category: "Social Cognition"
    }
]

export function calculateAQ10Score(responses: number[]): number {
    return responses.reduce((sum, optionIndex, questionIndex) => {
        if (optionIndex === -1) return sum
        const question = AQ10_QUESTIONS[questionIndex]
        // Standard: Agree(0,1)=1 point, Disagree(2,3)=0 points
        // Reverse: Agree(0,1)=0 points, Disagree(2,3)=1 point
        if (question.reverse) {
            return (optionIndex === 2 || optionIndex === 3) ? sum + 1 : sum
        } else {
            return (optionIndex === 0 || optionIndex === 1) ? sum + 1 : sum
        }
    }, 0)
}

export default function AQ10Questionnaire({ responses, onResponseChange, onComplete }: AQ10QuestionnaireProps) {
    // responses now stores the OPTION INDEX (0-3), not the score. -1 means unanswered.
    const allAnswered = responses.every(r => r !== -1)

    // Calculate score dynamically based on AQ-10 logic
    const totalScore = calculateAQ10Score(responses)

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl font-serif font-black tracking-tighter text-[#0B3D33] mb-4">
                    AQ-10 Screening Questionnaire
                </h2>
                <p className="text-lg text-[#0B3D33]/60 leading-relaxed">
                    Please answer the following questions about your child's behavior.
                    Select "Definitely Agree" or "Slightly Agree" if the statement applies,
                    otherwise select "Definitely Disagree" or "Slightly Disagree".
                </p>
                <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-2 bg-[#0B3D33]/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#D4AF37]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(responses.filter(r => r !== -1).length / 10) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-black text-[#0B3D33]/40">
                        {responses.filter(r => r !== -1).length}/10
                    </span>
                </div>
            </div>

            <div className="space-y-6 mb-12">
                {AQ10_QUESTIONS.map((question, index) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border-2 border-[#0B3D33]/10 p-8"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 bg-[#0B3D33] flex items-center justify-center text-[#D4AF37] font-black">
                                {question.id}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-2">
                                    {question.category}
                                </p>
                                <p className="text-lg font-medium text-[#0B3D33] leading-relaxed">
                                    {question.text}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Definitely Agree", value: question.reverse ? 0 : 1 },
                                { label: "Slightly Agree", value: question.reverse ? 0 : 1 },
                                { label: "Slightly Disagree", value: question.reverse ? 1 : 0 },
                                { label: "Definitely Disagree", value: question.reverse ? 1 : 0 }
                            ].map((option, optIndex) => (
                                <button
                                    key={optIndex}
                                    onClick={() => onResponseChange(index, option.value)}
                                    className={`p-4 border-2 transition-all text-sm font-bold uppercase tracking-widest ${responses[index] === option.value
                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B3D33]'
                                        : 'border-[#0B3D33]/20 text-[#0B3D33]/60 hover:border-[#D4AF37]/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {responses[index] === option.value ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <Circle className="w-4 h-4" />
                                        )}
                                        <span className="text-xs">{option.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {allAnswered && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/20 p-8 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-2">
                                Questionnaire Complete
                            </p>
                            <p className="text-2xl font-serif font-black text-[#0B3D33]">
                                Total Score: {totalScore}/10
                            </p>
                            <p className="text-sm text-[#0B3D33]/60 mt-2">
                                {totalScore >= 6 ? "Score indicates potential ASD markers. Video analysis will provide additional insights." :
                                    totalScore >= 3 ? "Score shows some ASD markers. Combined with video analysis for comprehensive assessment." :
                                        "Score is low. Video analysis will help confirm overall risk profile."}
                            </p>
                        </div>
                        <button
                            onClick={onComplete}
                            className="px-8 py-4 bg-[#0B3D33] text-[#D4AF37] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0B3D33] transition-all flex items-center gap-2"
                        >
                            Continue to Video Analysis
                            <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}

            {!allAnswered && (
                <div className="text-center p-8 border-2 border-dashed border-[#0B3D33]/20">
                    <p className="text-sm font-medium text-[#0B3D33]/40">
                        Please answer all questions to continue
                    </p>
                </div>
            )}
        </div>
    )
}
