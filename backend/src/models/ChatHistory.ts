import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: string;
    actions?: { label: string; route: string }[];
}

export interface IChatHistory extends Document {
    userId: string;
    messages: IChatMessage[];
}

const chatHistorySchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        intent: { type: String },
        actions: [{
            label: { type: String },
            route: { type: String }
        }],
    }],
});

export const ChatHistoryModel = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
