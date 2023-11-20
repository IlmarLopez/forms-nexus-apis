import { Stack, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { StackProperties } from './types/StackProperties';
import { Lambdas } from './lambdas';
import { APIGatewayModule } from './api-gateway';

import config from './system/config.json';
import { Roles } from './roles';

export class FormsNexusApisStack extends Stack {
  private config: any;

  constructor(scope: Construct, id: string, props: StackProperties) {
    super(scope, id, props);

    props.environment = process.env.NODE_ENV ?? 'dev';

    props.config = config.environment;
    this.config = props?.config;
    this.config = this.config[props.environment];

    const roles = new Roles(this, 'Roles', props);
    
    new Lambdas(this, 'Lambdas', props, roles);
    new APIGatewayModule(this, 'APIGateway', props);

    Tags.of(scope).add('repository', 'forms-nexus-apis');
  }
}
