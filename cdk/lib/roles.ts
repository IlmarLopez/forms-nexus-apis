import { Role, ServicePrincipal, ManagedPolicy, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { StackProperties } from './types/StackProperties';

export class Roles extends Construct {
  private config: any;
  public sendEmailRole: Role;
  public apiGatewayRequestAuthorizerRole: Role;

  constructor(scope: Construct, id: string, props: StackProperties) {
    super(scope, id);

    this.config = props?.config;
    this.config = this.config[props?.environment!];

    const sendEmailRole = new Role(this, 'send-email-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    sendEmailRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    sendEmailRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream'],
        resources: ['*'],
      })
    );

    const apiGatewayRequestAuthorizerRole = new Role(this, 'send-email-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    apiGatewayRequestAuthorizerRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    apiGatewayRequestAuthorizerRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream'],
        resources: ['*'],
      })
    );
  }
}

module.exports = { Roles };
