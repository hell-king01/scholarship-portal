require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const scholarship = {
    id: "aspire-leaders-program", // custom id to match user's URL
    title: "Aspire Leaders Program 2026",
    title_hi: "एस्पायर लीडर्स प्रोग्राम 2026",
    provider: "Aspire Institute (Harvard University)",
    provider_hi: "एस्पायर संस्थान (हार्वर्ड विश्वविद्यालय)",
    provider_type: "ngo",
    description: "The Aspire Leaders Program 2026 is a fully funded, 9-week online leadership program launched by the Aspire Institute. It aims to help students discover their abilities, strengthen their professional skills, and grow into impactful leaders. Earn a Certificate from Harvard faculty and access up to INR 1,00,000 in seed grants!",
    description_hi: "एस्पायर लीडर्स प्रोग्राम 2026 हार्वर्ड के संकाय द्वारा शुरू किया गया एक पूरी तरह से वित्त पोषित ऑनलाइन नेतृत्व कार्यक्रम है।",
    amount: 100000,
    amount_type: "one-time",
    deadline: "2026-03-16",
    eligibility: {
        categories: ["All"],
        genders: ["Male", "Female", "Other"],
        minPercentage: 0,
        maxIncome: 800000,
        educationLevels: ["graduation", "postGrad"],
        states: ["All"],
        disabilities: false,
        degreeTypes: ["all"],
    },
    required_documents: [],
    application_url: "https://www.buddy4study.com/page/aspire-leaders-program",
    tags: ["harvard", "leadership", "grant"],
    featured: true,
    status: "active"
};

async function insertAspire() {
    const { error } = await supabase.from('scholarships').upsert(scholarship).select();
    if (error) {
        console.error("Error inserting scholarship", error);
    } else {
        console.log("Successfully inserted Aspire Leaders Program!");
    }
}
insertAspire();
