export const BLOCKED_DOMAINS = [
    'deployhub.cloud',
    'deployhub.online',
    'cloudcoderhub.in',
    /\.deployhub\.cloud$/,
    /\.deployhub\.online$/,
    /\.cloudcoderhub\.in$/,
]

const INTERNAL_IPS = [
    /^localhost$/i,
    /^127\./,
    /^0\.0\.0\.0$/,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./,   
    /^::1$/,       
]

export function isBlockedDomain(domain) {
    const lower = domain.toLowerCase().trim()

    
    if (BLOCKED_DOMAINS.some(b =>
        typeof b === 'string' ? lower === b : b.test(lower)
    )) return true

    
    if (INTERNAL_IPS.some(r => r.test(lower))) return true

    if (!/^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$/.test(lower)) return true

    return false
}