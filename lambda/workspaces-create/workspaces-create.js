var AWS = require('aws-sdk');

var workspaces = new AWS.WorkSpaces({
    apiVersion: '2015-04-08'
});
var config = {
    Directory: process.env.DIRECTORY_ID || 'd-90672a878e',
    Mode: 'AUTO_STOP',
    UsageTimeout: 60
}
exports.handler = (event, context, callback) => {
    var originURL = process.env.ORIGIN_URL || '*';

    console.log("Received event: " + event);

    var requesterEmail = event.split(",")[0];
    var requesterUsername = event.split(",")[1];
    var requesterBundle = event.split(",")[2];

    console.log("Requester email: " + requesterEmail);
    console.log("Requester username: " + requesterUsername);
    console.log("Requester bundle: " + requesterBundle);

    var params = {
        Workspaces: [{
            BundleId: requesterBundle,
            DirectoryId: config.Directory,
            UserName: requesterUsername,
            Tags: [{
                Key: 'SelfServiceManaged',
                Value: requesterEmail
            }, ],
            WorkspaceProperties: {
                RunningMode: config.Mode,
                RunningModeAutoStopTimeoutInMinutes: config.UsageTimeout
            }
        }]
    };
    workspaces.createWorkspaces(params, function (err, data) {
        if (err) {
            console.log("Error: " + err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    Error: err,
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } else {
            console.log("Result: " + JSON.stringify(data));
            callback(null, {
                "statusCode": 200,
                "body": JSON.stringify({
                    "action": "put",
                    "requesterEmailAddress": requesterEmail,
                    "requesterUsername": requesterUsername,
                    "ws_status": "Approved"
                })});}});};