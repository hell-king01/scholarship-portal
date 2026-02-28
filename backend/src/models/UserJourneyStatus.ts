import mongoose, { Document, Schema } from 'mongoose';

export interface IUserJourneyStatus extends Document {
    userId: string;
    profileCompleted: boolean;
    ocrCompleted: boolean;
    eligibilityChecked: boolean;
    appliedScholarshipsCount: number;
    documentsGeneratedCount: number;
    stepsCompleted: string[]; // ["LOGIN", "PROFILE", "OCR", "ELIGIBILITY", "APPLY"]
    updatedAt: Date;
}

const userJourneyStatusSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    profileCompleted: { type: Boolean, default: false },
    ocrCompleted: { type: Boolean, default: false },
    eligibilityChecked: { type: Boolean, default: false },
    appliedScholarshipsCount: { type: Number, default: 0 },
    documentsGeneratedCount: { type: Number, default: 0 },
    stepsCompleted: [{ type: String }],
    updatedAt: { type: Date, default: Date.now },
});

export const UserJourneyStatusModel = mongoose.model<IUserJourneyStatus>('UserJourneyStatus', userJourneyStatusSchema);
