
const user = import.meta.env.VITE_BASIC_AUTH_USER;
const pass = import.meta.env.VITE_BASIC_AUTH_PASS;

const basicAuthValue = `Basic ${btoa(user + ':' + pass)}`

export const credentialHeaders = Object.freeze({
    'Authorization': basicAuthValue
})

export const credentialKeyPair = Object.freeze({
    auth: {
        username: user,
        password: pass
    }
})
