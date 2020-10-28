/* eslint-disable @typescript-eslint/camelcase */
import { retry } from '@lifeomic/attempt';
import nodeFetch, { Request } from 'node-fetch';

import { retryableRequestError, fatalRequestError } from './error';
import { URLSearchParams } from 'url';

export interface ServicesClientInput {
  getLatestScanFindings?: boolean;
  apiKey: string;
}

interface QueryParam {
  [param: string]: string | string[];
}

const BASE_URL = 'https://api.detectify.com/rest/v2/';

/**
 * Services Api
 * https://developer.detectify.com/
 */
export class ServicesClient {
  readonly baseUrl: string;
  readonly authHeader: { [key: string]: string };

  constructor(config: ServicesClientInput) {
    this.baseUrl = BASE_URL;
    this.authHeader = {
      'X-Detectify-Key': config.apiKey,
    };
  }

  test(): Promise<any[]> {
    return this.fetch('domains/');
  }

  getRootDomains(): Promise<any[]> {
    return this.fetch('domains/');
  }

  getSubDomains(token: string): Promise<any[]> {
    return this.fetch(`domains/${token}/subdomains/`);
  }

  getDomainFindings(token: string, params?: QueryParam): Promise<any[]> {
    return this.fetch(`domains/${token}/findings/`, params);
  }

  getScanProfiles(token: string): Promise<any[]> {
    return this.fetch(`profiles/${token}/`);
  }

  getLatestFullReport(token: string): Promise<any> {
    return this.fetch(`fullreports/${token}/latest/`);
  }

  fetch<T = object>(
    endpoint: string,
    queryParams: QueryParam = {},
    request?: Omit<Request, 'url'>,
  ): Promise<T> {
    return retry(
      async () => {
        const qs = new URLSearchParams(queryParams).toString();
        const url = `${BASE_URL}${endpoint}${qs ? '?' + qs : ''}`;
        const response = await nodeFetch(url, {
          ...request,
          headers: {
            ...this.authHeader,
            ...request?.headers,
          },
        });

        /**
         * We are working with a json api, so just return the parsed data.
         */
        if (response.ok) {
          return response.json() as Promise<T>;
        }

        let errorInformation;
        try {
          errorInformation = await response.json();
        } catch (err) {
          // pass
        }

        if (isRetryableRequest(response)) {
          throw retryableRequestError(response, errorInformation, url);
        } else {
          throw fatalRequestError(response, errorInformation, url);
        }
      },
      {
        maxAttempts: 10,
        delay: 200,
        factor: 2,
        jitter: true,
        handleError: (err, context) => {
          // On node-fetch errors with code='ECONNRESET', retry request
          if (err.code === 'ECONNRESET') {
            err.retryable = true;
          }

          if (!err.retryable) {
            // can't retry this? just abort
            context.abort();
          }
        },
      },
    );
  }
}

/**
 * Function for determining if a request is retryable
 * based on the returned status.
 */
function isRetryableRequest({ status }: Response): boolean {
  return (
    // 5xx error from provider (their fault, might be retryable)
    // 429 === too many requests, we got rate limited so safe to try again
    status >= 500 || status === 429
  );
}
