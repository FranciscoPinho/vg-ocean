const initialState = {
    openReg: false,
    openLogin: false
  };

export default function reducer(state=initialState, action){
    switch (action.type){
        case "SHOW_REGISTER": {
            return {...state, openReg: true, openLogin: false}
        }
        case "SHOW_LOGIN": {
            return {...state, openReg: false, openLogin: true}
        }
        case "CLOSE_MODALS": {
            return {...state, openReg: false, openLogin: false}
        }
    }
    return state;
}