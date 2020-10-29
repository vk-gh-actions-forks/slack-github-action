const core = require('@actions/core');
const github = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const flatten = require('flat');
const axios = require('axios');

try {
    const botToken = process.env.SLACK_BOT_TOKEN;
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    console.log('botToken', botToken)
    console.log('webhookUrl', webhookUrl)

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = github.context.payload;
    // console.log(`The event payload: ${JSON.stringify(payload, undefined, 2)}`);

    if (botToken === undefined && webhookUrl === undefined) {
        throw 'Need to provide at least one botToken or webhookUrl'
    }

    if (botToken) {
        const message = core.getInput('slack-message');
        const channelId = core.getInput('channel-id');
        console.log('message', message)
        console.log('channelId', channelId)

        const web = new WebClient(botToken);

        if(channelId !== undefined && message !== undefined) {
            // post message
            web.chat.postMessage({text: message, channel: channelId});
        } else {
            console.log('missing either channel-id or slack-message! Did not send a message via chat.postMessage with botToken');
        }
    } 
    
    if (webhookUrl) {
        // send flat payload to webhookUrl
        const flatPayload = flatten(payload);

        // workflow builder requires values to be strings
        // iterate over every value and convert it to string
        Object.keys(flatPayload).forEach((key) => {
            flatPayload[key] = '' + flatPayload[key];
        })

        console.log(flatPayload);

        axios.post(webhookUrl, flatPayload)
    }

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    } catch (error) {
    core.setFailed(error.message);
}