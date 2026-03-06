import { Queue } from "bullmq";
import { connection } from "../Utils/connection.js"

const makeQueue = (queueName) => {
    return new Queue(queueName, {
        connection,
    });
};


// make queues
const welcomeMessageQueue = makeQueue("deployhub-WelcomeMessage");
const buildqueue = makeQueue("buildqueue");
const deploymentQueue = makeQueue("deploymentQueue");
const reDeploymentQueue = makeQueue('redeployment');
const subscriptionStart = makeQueue("deployhub-subscriptionstart")
const subscriptionExpire = makeQueue("deployhub-subscriptionend")
const isBeforeExpiryNotify = makeQueue("deployhub-isBeforeExpiryQueue")
const recreateContainer = makeQueue("deployhub-recreate-container")
const deleteproject = makeQueue("deployhub-deleteproject")

export { welcomeMessageQueue, buildqueue, deleteproject, recreateContainer, deploymentQueue, reDeploymentQueue, isBeforeExpiryNotify, subscriptionExpire, subscriptionStart }