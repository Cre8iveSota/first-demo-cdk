import { APIGatewayTokenAuthorizerEvent, Context, Callback } from 'aws-lambda';

// A simple request-based authorizer example to demonstrate how to use request 
// parameters to allow or deny a request. In this example, a request is  
// authorized if the client-supplied token matches a specified value.

exports.handler = function(event: APIGatewayTokenAuthorizerEvent, context: Context, callback: Callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Parse the input for the parameter values
    const tmp = event.methodArn.split(':');
    const apiGatewayArnTmp = tmp[5].split('/');
    const awsAccountId = tmp[4];
    const region = tmp[3];
    const restApiId = apiGatewayArnTmp[0];
    const stage = apiGatewayArnTmp[1];
    const method = apiGatewayArnTmp[2];
    let resource = '/'; // root resource
    if (apiGatewayArnTmp[3]) {
        resource += apiGatewayArnTmp[3];
    }

    // Perform authorization to return the Allow policy for correct parameters and 
    // the 'Unauthorized' error, otherwise.
    let token = event.authorizationToken;
    token = token.replace('Bearer ', '');
    const expectedToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkROWTRYZlotNk40NkVjRVdrMzk3cCJ9.eyJpc3MiOiJodHRwczovL2Rldi1laDBzZW0xZm9jdGpocHQ2LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJaQWxGRFBVU2ZqT0VYbXppRGp4ZTVsaGUxRU81RzdLdUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly92aWMxbzJhNmo0LmV4ZWN1dGUtYXBpLmFwLW5vcnRoZWFzdC0xLmFtYXpvbmF3cy5jb20iLCJpYXQiOjE3MjI2MDEwNTQsImV4cCI6MTcyMjY4NzQ1NCwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiWkFsRkRQVVNmak9FWG16aURqeGU1bGhlMUVPNUc3S3UifQ.cL-3gJYujd_jJLYqw6A1s-jm2h5_w7MfDk1AsILwzpKNnUiaUqpKtBgJydqaZkhOhrbcROjPGANSMi0_U1Sqb-uxH_EOrzBgThEbN-cv7NHHjq7sLQgiQaO9FeUj4Ho8-apwa15-yHUVARKYfcfYoIusNnPOZm07AW9ETIPholBP4qzQHfbgIDWg6CqBrrdmEqEcsx5zahy-odYZ4RBmiv4nm43uHpEXD64QPaZmqEFr_YAFlhr9_b1tF6hyg0TZmH5nBfVlYY1dOzLUdBo5BZ8kKgb5Nd0cjOIqVYWs97vvAfzQql9AwlhgH-gAcTbpfpIQE_JNgMFuWixQLQloUQ"; // Set this to the expected token value

    if (token === expectedToken) {
        callback(null, generateAllow('me', event.methodArn));
    } else {
        callback("Unauthorized");
    }
}

// Help function to generate an IAM policy
const generatePolicy = function(principalId: string, effect: string, resource: string) {
    // Required output:
    const authResponse: any = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument: any = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        const statementOne: any = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };
    return authResponse;
}

const generateAllow = function(principalId: string, resource: string) {
    return generatePolicy(principalId, 'Allow', resource);
}

const generateDeny = function(principalId: string, resource: string) {
    return generatePolicy(principalId, 'Deny', resource);
}
