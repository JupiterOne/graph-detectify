import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';
import { invocationConfig } from '../src';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_API_KEY = 'dummy-api-key';
const DEFAULT_GET_LATEST_SCAN_FINDINGS = true;

export const integrationConfig: IntegrationConfig = {
  apiKey: process.env.API_KEY || DEFAULT_API_KEY,
  getLatestScanFindings: process.env.GET_LATEST_SCAN_FINDINGS
    ? process.env.GET_LATEST_SCAN_FINDINGS === 'true'
    : DEFAULT_GET_LATEST_SCAN_FINDINGS,
};

export function buildStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: integrationConfig,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}
