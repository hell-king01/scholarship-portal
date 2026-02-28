import { FAQModel } from '../models/FAQ';

export class FAQService {
    static async searchFAQs(query: string, category?: string) {
        let filter: any = {};
        if (category && category !== 'All') {
            filter.category = category;
        }

        if (query) {
            filter.$text = { $search: query };
        }

        const faqs = await FAQModel.find(query ? filter : filter)
            .sort(query ? { score: { $meta: "textScore" } } : { viewsCount: -1 })
            .limit(10);

        return faqs;
    }

    static async getTopFAQs() {
        return FAQModel.find().sort({ viewsCount: -1 }).limit(5);
    }

    static async markHelpful(id: string, isHelpful: boolean) {
        const update = isHelpful ? { $inc: { helpfulCount: 1 } } : { $inc: { unhelpfulCount: 1 } };
        return FAQModel.findByIdAndUpdate(id, update, { new: true });
    }

    static async incrementViews(id: string) {
        return FAQModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    }
}
