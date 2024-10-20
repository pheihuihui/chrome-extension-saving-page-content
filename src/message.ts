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

export const PORT_NAME = "saving-page-port"
export const MENU_SAVING_CONTENT = "menu-saving-content"
export const APP_NAME = "Saving Content"
export const CONFIG = {
    serverAddress: "http://localhost:3000",
    apiKey: "",
}
