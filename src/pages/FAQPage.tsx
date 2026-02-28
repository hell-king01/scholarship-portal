import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const FAQPage = () => {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [expanded, setExpanded] = useState<string | null>(null);

    const categories = ['All', 'Eligibility', 'Documentation', 'Application', 'Technical', 'Scholarship Types'];

    useEffect(() => {
        fetchFAQs();
    }, [search, category]);

    const fetchFAQs = async () => {
        try {
            const url = `http://localhost:3001/api/faqs?query=${search}&category=${category}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setFaqs(data.faqs);
            }
        } catch (error) {
            console.error("FAQ Fetch Error:", error);
        }
    };

    const handleHelpful = async (id: string, isHelpful: boolean) => {
        try {
            await fetch(`http://localhost:3001/api/faqs/helpful/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isHelpful })
            });
            // Update local state would go here for better UX
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />
            <div className="max-w-4xl mx-auto pt-24 px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        How can we help you?
                    </h1>
                    <p className="text-gray-600 text-lg">Search for answers or browse categories below.</p>

                    <div className="mt-8 relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Describe your issue..."
                            className="pl-12 py-6 rounded-2xl shadow-lg border-gray-100 focus:ring-indigo-500 text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <Card key={faq._id} className="overflow-hidden border-gray-100 hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setExpanded(expanded === faq._id ? null : faq._id)}
                                className="w-full text-left p-6 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold transition-colors group-hover:bg-indigo-100">
                                        Q
                                    </span>
                                    <h3 className="font-semibold text-gray-800 text-lg">{faq.question}</h3>
                                </div>
                                {expanded === faq._id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                            </button>
                            {expanded === faq._id && (
                                <CardContent className="px-6 pb-6 pt-0 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-gray-600 leading-relaxed pl-12 mb-6">{faq.answer}</p>
                                    <div className="pl-12 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {faq.tags?.map((tag: string) => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs uppercase tracking-wider font-semibold">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">Was this helpful?</span>
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleHelpful(faq._id, true)}>
                                                <ThumbsUp size={14} />
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleHelpful(faq._id, false)}>
                                                <ThumbsDown size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {faqs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No FAQs found matching your query.</p>
                        <Button variant="link" onClick={() => { setSearch(''); setCategory('All'); }} className="text-indigo-600 mt-2">
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FAQPage;
