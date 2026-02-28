import { ChatHistoryModel } from '../models/ChatHistory';
import { FAQModel } from '../models/FAQ';
import { DocumentModel } from '../models/Document';

export class ChatbotService {
    static async handleQuery(userId: string, message: string, contextType: string) {
        // 1. Detect Intent (Simple rule-based for now)
        const intent = this.detectIntent(message, contextType);

        // 2. Fetch Relevant Data (Retrieval)
        let reply = "";
        let actions: { label: string; route: string }[] = [];
        let relatedScholarships: any[] = [];
        let confidenceScore = 0.8;

        switch (intent) {
            case 'eligibility':
                reply = "Based on your current profile, you are eligible for several scholarships. Would you like to check your eligibility score and see personalized matches?";
                actions = [{ label: "Check Eligibility", route: "/eligibility" }];
                break;
            case 'document_help':
                reply = "To apply for scholarships, you typically need an Income Certificate, Caste Certificate, and Aadhaar card. Would you like to see your uploaded documents in the vault?";
                actions = [{ label: "View Document Vault", route: "/vault" }];
                break;
            case 'application_help':
                reply = "The application process starts with completing your profile and uploading required documents. Then you can browse scholarships and apply to those you match with.";
                actions = [{ label: "Browse Scholarships", route: "/scholarships" }];
                break;
            case 'deadline_help':
                reply = "Scholarship deadlines vary. Most central and state scholarships open between July and September. I can show you scholarships closing soon.";
                actions = [{ label: "Ending Soon", route: "/scholarships?filter=deadline" }];
                break;
            case 'status_query':
                reply = "You can track all your submitted applications in your dashboard. Would you like to go there now?";
                actions = [{ label: "My Applications", route: "/dashboard" }];
                break;
            case 'faq':
                // Try to find in FAQ DB using text search
                const faqs = await FAQModel.find(
                    { $text: { $search: message } },
                    { score: { $meta: "textScore" } }
                ).sort({ score: { $meta: "textScore" } }).limit(1);

                if (faqs.length > 0) {
                    reply = faqs[0].answer;
                    confidenceScore = 0.95;
                } else {
                    reply = "I'm not exactly sure about that. You can browse our FAQ section or contact support for detailed help.";
                    actions = [{ label: "Browse FAQ", route: "/faq" }];
                }
                break;
            default:
                reply = "I'm your Scholarship Assistant. I can help with eligibility, documents, or application steps. What would you like to know?";
        }

        // 3. Persist Chat History
        await this.saveHistory(userId, message, reply, intent, actions);

        return {
            reply,
            actions,
            relatedScholarships,
            confidenceScore
        };
    }

    private static detectIntent(message: string, contextType: string): string {
        const msg = message.toLowerCase();
        if (msg.includes('eligible') || msg.includes('can i apply') || msg.includes('match') || contextType === 'eligibility') return 'eligibility';
        if (msg.includes('document') || msg.includes('certificate') || msg.includes('upload') || msg.includes('ocr')) return 'document_help';
        if (msg.includes('apply') || msg.includes('step') || msg.includes('how to') || contextType === 'application') return 'application_help';
        if (msg.includes('deadline') || msg.includes('when') || msg.includes('last date') || msg.includes('closing')) return 'deadline_help';
        if (msg.includes('status') || msg.includes('where is my') || msg.includes('tracking')) return 'status_query';
        return 'faq';
    }

    private static async saveHistory(userId: string, userMsg: string, assistantMsg: string, intent: string, actions: any[]) {
        try {
            let history = await ChatHistoryModel.findOne({ userId });
            if (!history) {
                history = new ChatHistoryModel({ userId, messages: [] });
            }

            history.messages.push({
                role: 'user',
                content: userMsg,
                timestamp: new Date(),
                intent
            });

            history.messages.push({
                role: 'assistant',
                content: assistantMsg,
                timestamp: new Date(),
                actions
            });

            // Limit history to last 50 messages
            if (history.messages.length > 50) {
                history.messages = history.messages.slice(-50);
            }

            await history.save();
        } catch (err) {
            console.error("Error saving chat history:", err);
        }
    }
}
