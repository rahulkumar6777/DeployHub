const getDeploymentRefreshTokenOption = () => ({
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: "api.deployhub.cloud",
    maxAge: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
});

const getLocalHostRefreshTokenOption = () => ({
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
});

const getDeploymentAccessTokenOption = () => ({
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: "api.deployhub.cloud",
    maxAge: new Date(Date.now() + 2 * 60 * 60 * 1000)
});

const getLocalHostAccessTokenOption = () => ({
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: new Date(Date.now() + 10 * 60 * 60 * 1000)
});


export const RefreshtokenOption = () =>
    process.env.NODE_ENV === 'production'
        ? getDeploymentRefreshTokenOption()
        : getLocalHostRefreshTokenOption();

export const AccesstokenOption = () =>
    process.env.NODE_ENV === 'production'
        ? getDeploymentAccessTokenOption()
        : getLocalHostAccessTokenOption();
