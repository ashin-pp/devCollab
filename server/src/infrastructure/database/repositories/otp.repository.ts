import { injectable } from 'tsyringe';
import { IOtpRepository } from "../../../application/interfaces/repositories/otp.repository.interface";
import { OtpVerification } from "../../../domain/entities/otp-verification.entity";
import { MongoBaseRepository } from "./base.repository";
import { IOtpModel } from "../models/otp.model";
import { OtpMapper } from "../mappers/otp.mapper";
import { OtpModel } from "../models/otp.model";

@injectable()
export class OtpRepository extends MongoBaseRepository<OtpVerification, IOtpModel> implements IOtpRepository {
    
    constructor() {
        super(OtpModel, new OtpMapper());
    }

    async findValidOtpByEmail(email: string, otp: string): Promise<OtpVerification | null> {
        const found = await this._model.findOne({ 
            email, 
            otp, 
            is_used: false 
        });
        
        return found ? this._mapper.toDomain(found) : null;
    }

    async findLatestOtpByEmail(email: string): Promise<OtpVerification | null> {
        const found = await this._model.findOne({ email }).sort({ createdAt: -1 });
        return found ? this._mapper.toDomain(found) : null;
    }

    async deleteByEmail(email: string): Promise<void> {
        await this._model.deleteMany({ email });
    }
}
