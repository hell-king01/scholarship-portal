import mongoose, { Document, Schema } from 'mongoose';

export interface IFAQ extends Document {
    category: string;
    question: string;
    answer: string;
    tags: string[];
    viewsCount: number;
    helpfulCount: number;
    unhelpfulCount: number;
    createdAt: Date;
}

const faqSchema: Schema = new Schema({
    category: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tags: [{ type: String }],
    viewsCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    unhelpfulCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

faqSchema.index({ category: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

export const FAQModel = mongoose.model<IFAQ>('FAQ', faqSchema);
