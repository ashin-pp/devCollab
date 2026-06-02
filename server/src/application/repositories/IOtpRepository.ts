import { IBaseRepository } from "./IBaseRepository";
import { OtpVerification } from "../../domain/entities/OtpVerification";

export interface IOtpRepository extends IBaseRepository<OtpVerification> {
    findValidOtpByEmail(email: string, otp: string): Promise<OtpVerification | null>;
    findLatestOtpByEmail(email: string): Promise<OtpVerification | null>;
    deleteByEmail(email: string): Promise<void>;
}
