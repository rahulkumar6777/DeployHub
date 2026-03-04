import { makeQueue } from "./makeQueue.js";

const buildqueue = makeQueue("buildqueue");
const deploymentQueue = makeQueue("deploymentQueue");
const reDeploymentQueue = makeQueue('redeployment');
const subscriptionStart = makeQueue("deployhub-subscriptionstart")
const subscriptionExpire = makeQueue("deployhub-subscriptionend")
const isBeforeExpiryNotify = makeQueue("deployhub-isBeforeExpiryQueue")
const recreateContainer = makeQueue("deployhub-recreate-container")
const deleteproject = makeQueue("deployhub-deleteproject")

export { buildqueue, deleteproject ,recreateContainer, deploymentQueue, reDeploymentQueue, isBeforeExpiryNotify, subscriptionExpire, subscriptionStart }