export function openLogin(){
    return {
        type: "SHOW_LOGIN",
    }
}

export function openRegister(){
    return {
        type: "SHOW_REGISTER",
    }
}

export function closeAll(){
    return {
        type: "CLOSE_MODALS",
    }
}