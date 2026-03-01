import { useState, useEffect } from 'react';

export const useSavedScholarships = () => {
    const [savedScholarships, setSavedScholarships] = useState<string[]>(() => {
        const saved = localStorage.getItem('savedScholarships');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'savedScholarships' && e.newValue) {
                setSavedScholarships(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const toggleSave = (id: string) => {
        setSavedScholarships(prev => {
            const next = prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id];
            localStorage.setItem('savedScholarships', JSON.stringify(next));
            // Manually trigger storage event for the same window
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'savedScholarships',
                newValue: JSON.stringify(next)
            }));
            return next;
        });
    };

    return { savedScholarships, toggleSave };
};
