import mongoose, { Schema, Document } from "mongoose";

export interface IAdminModel extends Document {
    name: string;
    email: string;
    password?: string;
    created_at: Date;
    updated_at: Date;
}

const AdminSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const AdminModel = mongoose.model<IAdminModel>("Admin", AdminSchema);
