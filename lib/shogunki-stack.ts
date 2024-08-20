import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HttpRouteIntegration } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class ShogunkiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const nameHelloLambda= "HelloHandler";
    const hello = new lambda.Function(
        this,
        nameHelloLambda,
        {
            runtime: lambda.Runtime.NODEJS_20_X,  // excution environment
            code: lambda.Code.fromAsset('lambda/handlers'), // code loaded from "lambda" directory
            handler: "hello-world-func.handler", // files is "hello", funcition is "handler"
        }
    );

    const nameShogunkiHttpApi = "Shogunki Http Api";
    const shogunkiHttpApi= new cdk.aws_apigatewayv2.HttpApi(
        this,
        nameShogunkiHttpApi,
        {
            apiName: nameShogunkiHttpApi,
        }
     )

    const shogunkiIntegration = new HttpLambdaIntegration(nameHelloLambda, hello,{});
    const helloResource = shogunkiHttpApi.addRoutes(
        {  
            path: '/hello',
            methods: [ cdk.aws_apigatewayv2.HttpMethod.GET ],
            integration: shogunkiIntegration
        }
    )
  }
}
