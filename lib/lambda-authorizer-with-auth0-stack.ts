import {
  Stack,
  StackProps,
  aws_apigateway,
  Duration,
  aws_logs,
} from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class LambdaAuthorizerWithAuth0Stack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Define IAM role for the Lambda function
    const lambdaInvokeRole = new aws_iam.Role(this, 'LambdaInvokeRole', {
      assumedBy: new aws_iam.CompositePrincipal(
        new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        new aws_iam.ServicePrincipal('apigateway.amazonaws.com')
      ),
    });

    lambdaInvokeRole.addToPolicy(new aws_iam.PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction'],
    }));

    // Define the JWT RSA Custom Authorizer Lambda function
    const nameJwtRsaCustomAuthorizer = "jwt-rsa-custom-authorizer"; // 名前に space が使えないので注意
    const jwtRsaCustomAuthorizer = new lambda.Function(
      this,
      nameJwtRsaCustomAuthorizer,
      {
        functionName: nameJwtRsaCustomAuthorizer, // 明示的に Lambda 関数の名前を設定
        runtime: lambda.Runtime.NODEJS_20_X,  // 実行環境
        code: lambda.Code.fromAsset('./lambda/handlers'), // コードを "lambda/handlers" ディレクトリから読み込み
        handler: "lambda-authroizer.js", // トランスパイル後のファイルと関数を指定
        timeout: Duration.seconds(25),
        logRetention: aws_logs.RetentionDays.ONE_DAY,
        role: lambdaInvokeRole,
      },
    );

    const hello = new lambda.Function(
      this,
      "HelloHandler",
      {
      runtime: lambda.Runtime.NODEJS_20_X,  // excution environment
      code: lambda.Code.fromAsset('lambda/handlers'), // code loaded from "lambda" directory
      handler: "hello.handler", // files is "hello", funcition is "handler"
      }
    );

    // Create the POST Lambda function
    const namePostPetFunc = "Post_Pet_func";
    const postPetFunc = new lambda.Function(
      this,
      namePostPetFunc,
      {
        functionName: namePostPetFunc,
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./lambda/handlers'), // コードを "lambda/handlers" ディレクトリから読み込み
        handler: "post-pet-func.handler",
        timeout: Duration.seconds(25),
        logRetention: aws_logs.RetentionDays.ONE_DAY,
      },
    );

    // API Gateway RestAPIの作成
    const nameRestApi = "Rest API with Lambda auth";
    const restApi = new aws_apigateway.RestApi(this, nameRestApi, {
      restApiName: `Rest_API_with_Lambda_auth`,
      deployOptions: {
        stageName: 'v1',
      },
    });

    // Define the API Gateway Custom Authorizer
    const customAuthorizer = new aws_apigateway.TokenAuthorizer(this, 'JwtRsaCustomAuthorizer', {
      authorizerName: 'jwt-rsa-custom-authorizer',
      handler: jwtRsaCustomAuthorizer,
      identitySource: aws_apigateway.IdentitySource.header('Authorization'),
      resultsCacheTtl: Duration.seconds(3600),
      validationRegex: '^Bearer [-0-9a-zA-Z\\\.]*$',
    });

    // API Gateway にリクエスト先のリソースを追加
    const petsResource = restApi.root.addResource('pets');

    // リソースに GET メソッド、Lambda 統合プロキシを指定
    petsResource.addMethod(
      'GET',
      new aws_apigateway.LambdaIntegration(hello), {
        authorizer: customAuthorizer,
        authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
      }
    );

    // // Add POST method to the resource, with Lambda integration
    // petsResource.addMethod(
    //   'POST',
    //   new aws_apigateway.LambdaIntegration(postPetFunc)
    // );

    // CORS の設定
    const options = petsResource.addMethod('OPTIONS', new aws_apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
        },
      }],
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Headers': true,
        },
      }],
    });
  }
}
