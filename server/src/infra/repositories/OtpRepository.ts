import { Model } from "mongoose";
import { IOtpRepository } from "../../application/repositories/IOtpRepository";
import { OtpVerification } from "../../domain/entities/OtpVerification";
import { MongoBaseRepository } from "./BaseRepository";
import { IOtpModel } from "../database/models/OtpModel";
import { OtpMapper } from "../mappers/OtpMapper";

export class OtpRepository extends MongoBaseRepository<OtpVerification, IOtpModel> implements IOtpRepository {
    
    constructor(model: Model<IOtpModel>) {
        super(model, new OtpMapper());
    }

    async findValidOtpByEmail(email: string, otp: string): Promise<OtpVerification | null> {
        const found = await this.model.findOne({ 
            email, 
            otp, 
            is_used: false 
        });
        
        return found ? this.mapper.toDomain(found) : null;
    }
}
