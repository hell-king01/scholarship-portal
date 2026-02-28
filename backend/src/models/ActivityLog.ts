import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
    userId: string;
    actionType: string;
    description: string;
    metadata: any;
    createdAt: Date;
}

const activityLogSchema: Schema = new Schema({
    userId: { type: String, required: true },
    actionType: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ userId: 1, actionType: 1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLogModel = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
