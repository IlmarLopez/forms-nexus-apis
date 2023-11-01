import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { StackProperties } from './types/StackProperties';
import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Roles } from './roles';

const path = require('path');

export class Lambdas extends Construct {
  private config: any;
  public sendEmail: lambda.Function;

  constructor(scope: Construct, id: string, props: StackProperties, roles: Roles) {
    super(scope, id);

    this.config = props?.config;
    this.config = this.config[props?.environment!];

    this.sendEmail = new lambda.Function(scope, 'send-email-lambda', {
      description: '',
      functionName: `${props.stackName}-send-email-${props.environment}`,
      runtime: lambda.Runtime.PROVIDED_AL2,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../cmd/send-email')
      ),
      handler: 'bootstrap',
      timeout: Duration.minutes(2),
      memorySize: 128,
      role: roles.sendEmailRole,
      logRetentionRole: roles.sendEmailRole,
      logRetention: RetentionDays.ONE_MONTH,
    });
  }
}

module.exports = { Lambdas };
