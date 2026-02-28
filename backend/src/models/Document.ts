import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
    userId: string;
    documentType: string;
    filePath: string;
    extractedData: any;
    confidenceScore: number;
    checksum: string;
    createdAt: Date;
}

const documentSchema: Schema = new Schema({
    userId: { type: String, required: true },
    documentType: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedData: { type: Schema.Types.Mixed, required: true },
    confidenceScore: { type: Number, required: true },
    checksum: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Create compound index for faster queries regarding user doc pairs
documentSchema.index({ userId: 1, documentType: 1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
