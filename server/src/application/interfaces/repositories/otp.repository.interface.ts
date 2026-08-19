import { IBaseRepository } from "./base.repository.interface";
import { OtpVerification } from "../../../domain/entities/otp-verification.entity";

export interface IOtpRepository extends IBaseRepository<OtpVerification> {
    findValidOtpByEmail(email: string, otp: string): Promise<OtpVerification | null>;
    findLatestOtpByEmail(email: string): Promise<OtpVerification | null>;
    deleteByEmail(email: string): Promise<void>;
}
