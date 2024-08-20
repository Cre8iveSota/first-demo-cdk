import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
export class FirstDemoCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this,"HelloHandler",{
        runtime: lambda.Runtime.NODEJS_20_X,  // excution environment
        code: lambda.Code.fromAsset('lambda'), // code loaded from "lambda" directory
        handler: "hello.handler", // files is "hello", funcition is "handler"
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this,'Endpoint',{
      handler: hello
    })
  }
}
