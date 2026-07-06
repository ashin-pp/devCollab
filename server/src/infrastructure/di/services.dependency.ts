import { container } from 'tsyringe';
import { TOKENS } from './tokens';

// Services
import { BcryptHashService } from '../services/bcrypt-hash.service';
import { NodemailerEmailService } from '../services/nodemailer-email.service';
import { JwtService } from '../services/jwt.service';
import { AwsS3StorageService } from '../services/aws-s3-storage.service';
import { LangChainService } from '../services/lang-chain.service';
import { WinstonLogger } from '../services/winston-logger.service';

export function registerServices() {
    container.registerSingleton(TOKENS.IHashService, BcryptHashService);
    container.registerSingleton(TOKENS.IEmailService, NodemailerEmailService);
    container.registerSingleton(TOKENS.IJwtService, JwtService);
    container.registerSingleton(TOKENS.IStorageService, AwsS3StorageService);
    container.registerSingleton(TOKENS.IAIService, LangChainService);
    container.registerSingleton(TOKENS.ILogger, WinstonLogger);
}
