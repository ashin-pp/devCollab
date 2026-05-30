import { OtpVerification } from "../../domain/entities/OtpVerification";
import { IMapper } from "./IMapper";
import { IOtpModel } from "../database/models/OtpModel";

export class OtpMapper implements IMapper<OtpVerification, IOtpModel> {

    toDomain(persistence: IOtpModel): OtpVerification {
        return new OtpVerification(
            persistence.email,
            persistence.otp,
            persistence.expires_at,
            persistence.is_used,
            persistence._id ? persistence._id.toString() : undefined,
            persistence.created_at
        );
    }

    toPersistence(domain: Partial<OtpVerification>): any {
        return {
            email: domain.email,
            otp: domain.otp,
            expires_at: domain.expiresAt,
            is_used: domain.isUsed
        };
    }
}
