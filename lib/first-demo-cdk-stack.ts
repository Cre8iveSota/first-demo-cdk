import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class FirstDemoCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'FirstDemoCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const myFunction = new lambda.Function(this,"HelloMorldFunction",{
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromInline(`
          exports.handler = async function(event){
          return { 
            statusCode: 200,
            body: JSON.stringify('Hello CDK!')
            };
          };
      `),
    });

    // Define the Lambda function URL resource
    const myFunctionUrl = myFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    })

    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this,"myFunctionUrlOutput",{
      value: myFunctionUrl.url,
    })
  }
}
