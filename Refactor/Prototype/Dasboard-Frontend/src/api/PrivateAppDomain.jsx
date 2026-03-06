const NodeEnv = 'production'

const localhostURl = 'http://localhost:5173'

const DeploymentUrl = 'https://deployhub.cloud'


export const privateAppDomain = NodeEnv === 'production' ? DeploymentUrl : localhostURl;