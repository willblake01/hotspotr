const SIGNUP = 'SIGNUP';
const LOGIN = 'LOGIN';
const SET_USER = 'SET_USER';
const LOGOUT = 'LOGOUT';

// A reducer takes in two things:

// 1. The action (info about what happened)
// 2. A copy of current state
export const profile = (state = null, action) => {
    switch (action.type) {
        case SIGNUP:
        case LOGIN:
        case SET_USER:
            return {
                ...state,
                email: action.payload.email,
                firstName: action.payload.firstName || null,
                lastName: action.payload.lastName || null,
                // Never store password in Redux state for security
            }
        case LOGOUT:
            return null;
        default:
            return state;
    }
}
