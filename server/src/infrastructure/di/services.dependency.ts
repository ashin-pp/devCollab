import { container } from 'tsyringe';
import { BcryptHashService } from '../services/bcrypt-hash.service';
import { NodemailerEmailService } from '../services/nodemailer-email.service';
import { JwtService } from '../services/jwt.service';
import { AwsS3StorageService } from '../services/aws-s3-storage.service';
import { LangChainService } from '../services/lang-chain.service';
import { WinstonLogger } from '../services/winston-logger.service';
import { SERVICE_TOKENS } from "./service.tokens";

export function registerServices() {
    container.registerSingleton(SERVICE_TOKENS.IHashService, BcryptHashService);
    container.registerSingleton(SERVICE_TOKENS.IJwtService, JwtService);
    container.registerSingleton(SERVICE_TOKENS.ILogger, WinstonLogger);
    container.registerSingleton(SERVICE_TOKENS.IEmailService, NodemailerEmailService);
    container.registerSingleton(SERVICE_TOKENS.IStorageService, AwsS3StorageService);
    container.registerSingleton(SERVICE_TOKENS.IAIService, LangChainService);
}
