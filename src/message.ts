interface MState {
    pending_fetch: { imageUrl: string }
    pending_background: { image: Blob }
    pending_save: { success: boolean }
}

export interface IMessage<K extends keyof MState> {
    contentType: "image"
    state: K
    data: MState[K]
}
