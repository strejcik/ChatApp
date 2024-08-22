export interface ProcessedChatMessage {
    id: string
    address: string
    from: string
    timestamp: number
    body: string
}
export interface ChatSession {
    remoteUsername: string
    messages: ProcessedChatMessage[]
}