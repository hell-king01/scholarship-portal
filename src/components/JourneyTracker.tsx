import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trophy, ArrowRight, Star } from 'lucide-react';
import { Progress } from '../components/ui/progress';

const JourneyTracker = ({ userId }: { userId: string }) => {
    const [journey, setJourney] = useState<any>(null);

    const steps = [
        { id: 'LOGIN', label: 'Login to Portal', description: 'Get access to your dashboard.' },
        { id: 'PROFILE', label: 'Complete Profile', description: 'Accuracy improves eligibility scores.' },
        { id: 'OCR', label: 'Upload Documents', description: 'OCR extraction for automatic matching.' },
        { id: 'ELIGIBILITY', label: 'Check Eligibility', description: 'See which scholarships fit you.' },
        { id: 'APPLY', label: 'Apply scholarships', description: 'Begin your journey to funding.' },
        { id: 'DOCGEN', label: 'Generate Documents', description: 'AI-assisted document writing.' },
        { id: 'SUBMIT', label: 'Track Applications', description: 'Stay updated on your status.' },
    ];

    useEffect(() => {
        fetch(`http://localhost:3001/api/journey/${userId}`)
            .then(res => res.json())
            .then(data => data.success && setJourney(data.journey));
    }, [userId]);

    if (!journey) return null;

    const completedCount = journey.stepsCompleted.length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl overflow-hidden relative group">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors duration-500"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                            Your Journey <Trophy size={20} className="text-yellow-500" />
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Complete steps to unlock milestone badges</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-indigo-600 tracking-tighter">{Math.round(progress)}%</span>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Complete</p>
                    </div>
                </div>

                <Progress value={progress} className="h-3 bg-indigo-50 rounded-full mb-10 shadow-inner" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step, i) => {
                        const isCompleted = journey.stepsCompleted.includes(step.id);
                        const isNext = !isCompleted && (i === 0 || journey.stepsCompleted.includes(steps[i - 1].id));

                        return (
                            <div
                                key={step.id}
                                className={`flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${isCompleted ? 'bg-indigo-50 border-indigo-100' : isNext ? 'bg-white border-indigo-500 shadow-indigo-100 shadow-lg scale-[1.02]' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {isCompleted ? <CheckCircle2 size={24} className="text-indigo-600" /> : isNext ? <Star size={24} className="text-indigo-500 animate-pulse fill-indigo-100" /> : <Circle size={24} className="text-gray-300" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm leading-tight ${isCompleted || isNext ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                                    {isNext && (
                                        <button className="text-xs font-bold text-indigo-600 mt-2 flex items-center gap-1 hover:gap-2 transition-all group/btn">
                                            Let's Go <ArrowRight size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default JourneyTracker;
