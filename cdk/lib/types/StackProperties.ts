import { StackProps } from 'aws-cdk-lib';

interface stackProperties extends StackProps {
  environment?: string,
  config?: object,
  stackName: string
}

export type StackProperties = stackProperties;