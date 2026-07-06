export interface IAIService{
    processMessage(input:string,context:{workspaceId:string,channelId:string,userId:string}):Promise<string>
}