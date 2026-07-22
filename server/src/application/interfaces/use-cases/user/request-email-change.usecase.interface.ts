import { RequestEmailChangeDto } from "../../../dtos/user/request/request-email-change.dto";

export interface IRequestEmailChangeUseCase {
    execute(payload: RequestEmailChangeDto): Promise<void>;
}
