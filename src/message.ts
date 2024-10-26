interface MState {
    pending_fetch: { imageUrl?: string }
    pending_background: { imageBlobStr: string; mimeType: string }
    finished: { success: boolean; messageText: string }
}

export interface IMessage<K extends keyof MState> {
    contentType: "image" | "page"
    state: K
    data?: MState[K]
}

export interface IServerResponse {
    id: string
    status: string
}

export const PORT_NAME = "saving-page-port"
export const MENU_SAVING_IMAGE = "menu-saving-image"
export const MENU_SAVING_PAGE = "menu-saving-page"
export const APP_NAME = "Saving Content"
export const CONFIG = {
    serverAddress: "http://localhost:3000",
    apiKey: "",
    albumId: "",
}
