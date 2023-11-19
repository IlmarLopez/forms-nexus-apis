import { RestApi, CfnMethod, BasePathMapping, DomainName, LogGroupLogDestination, AccessLogFormat, Cors, LambdaIntegration, RequestAuthorizer, IdentitySource } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'; 
import {Construct } from 'constructs';
import { StackProperties } from './types/StackProperties';
import { DockerImageFunction, Function } from 'aws-cdk-lib/aws-lambda';
import { Lambdas } from './lambdas';

export interface ApiGatewayConstructProps {
  stackProps: StackProperties;
  name: string;
  description: string;
}

export class APIGatewayModule extends Construct {
  private scopeStack: Construct;
  private API: RestApi;
  private config: any;
  private lambdas: Lambdas;

  constructor(scope: Construct, id: string, props: StackProperties, lambdas: Lambdas) {
    super(scope, id);
    this.scopeStack = scope;
    this.API = this.build(props);
    this.lambdas = lambdas;
  }

  private build(props?: StackProperties): RestApi {
    this.config = props?.config;
    this.config = this.config[props?.environment!];

    const ID = `${props?.stackName}-forms-nexu-api-${props?.environment}`;

    const sendEmailLambdaIntegration = new LambdaIntegration(this.lambdas.sendEmail);
    const authLambdaFuntion = Function.fromFunctionName(
      this,
      'lambda-authorizer',
      `${props?.stackName}-api-gateway-request-authorizer-${props?.environment}`
    );

    const lambdaAuthorizer = new RequestAuthorizer(this, 'lambda-authorizer', {
      handler: authLambdaFuntion,
      identitySources: [IdentitySource.header("Authorization")]
    })

    let logGroup = new LogGroup(this, 'forms-nexu-api-logs', {
      logGroupName: `${props?.stackName}-forms-nexu-api-gw-${props?.environment}`,
      retention: RetentionDays.ONE_MONTH,
    });

    const api = new RestApi(this, ID, {
      deployOptions: {
        stageName: this.config.stage,
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowMethods: Cors.ALL_METHODS
      },
      deploy: true,
    });

    const v1 = api.root.addResource('v1');

    v1.addResource('test').addMethod('GET', sendEmailLambdaIntegration, {
      authorizer: lambdaAuthorizer,
      apiKeyRequired: false,
    });

    const corsMethods = api.methods.filter(
      (method: { httpMethod: string }) => method.httpMethod === 'OPTIONS'
    );

    corsMethods.forEach((method) => {
      const cfnMethod = method.node.defaultChild as CfnMethod;
      cfnMethod.addPropertyOverride('ApiKeyRequired', false);
      cfnMethod.addPropertyOverride('AuthorizationType', 'NONE');
      cfnMethod.addPropertyDeletionOverride('AuthorizerId');
    });

    const domainName = DomainName.fromDomainNameAttributes(this, 'domain-name-forms-nexus', {
      domainName: this.config.domain.name,
      domainNameAliasHostedZoneId: '',
      domainNameAliasTarget: '',
    });

    new BasePathMapping(this, 'forms-nexus-apis', {
      domainName: domainName,
      restApi: api,
      basePath: 'forms'
    });

    return api;
  }
}
