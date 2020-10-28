import { Response } from 'node-fetch';
import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';

export class RetryableError extends IntegrationProviderAPIError {
  retryable = true;
}

export function retryableRequestError(
  response: Response,
  responseJson: object | undefined,
  url: string,
): RetryableError {
  const err = new IntegrationProviderAPIError(
    getErrorOptions(response, responseJson, url),
  );
  return Object.assign(err, { retryable: true });
}

export function fatalRequestError(
  response: Response,
  responseJson: object | undefined,
  url: string,
): Error {
  const errorOptions = getErrorOptions(response, responseJson, url);
  if ([401, 403].includes(response.status)) {
    return new IntegrationProviderAuthorizationError(errorOptions);
  } else {
    return new IntegrationProviderAPIError(errorOptions);
  }
}

function getErrorOptions(
  response: Response,
  responseJson: object | undefined,
  url: string,
) {
  return {
    cause: new Error(JSON.stringify(responseJson)),
    endpoint: url,
    status: response.status,
    statusText: response.statusText,
  };
}
