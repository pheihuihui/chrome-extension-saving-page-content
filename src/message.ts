interface MState {
    pending_fetch: { imageUrl: string }
    pending_background: { imageBlobStr: string; mimeType: string }
    finished: { success: boolean; messageText: string }
}

export interface IMessage<K extends keyof MState> {
    contentType: "image" | "page"
    state: K
    data: MState[K]
}
