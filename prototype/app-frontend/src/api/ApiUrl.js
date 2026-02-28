const NodeEnv = 'production'

const localhostURl = 'http://localhost:5000/api'

const DeploymentUrl = 'https://api.deployhub.cloud/api'

export const BaseUrl = NodeEnv === 'production' ? DeploymentUrl : localhostURl