const URL_PATTERN = /^https?:\/\/([a-zA-Z0-9-_.]+)\/?.*/i;
export function getHostnameFromUrl(url: string): string {
  const match = url.match(URL_PATTERN);
  return match ? match[1] : '';
}

// https://nvd.nist.gov/vuln-metrics/cvss
export function getCVSS2Severity(
  score: number | undefined,
): string | undefined {
  if (score) {
    if (score >= 7) {
      return 'high';
    }
    if (score >= 4) {
      return 'medium';
    }
    if (score >= 0) {
      return 'low';
    }
  }
}

// https://nvd.nist.gov/vuln-metrics/cvss
export function getCVSS3Severity(
  score: number | undefined,
): string | undefined {
  if (score) {
    if (score >= 9) {
      return 'critical';
    }
    if (score >= 7) {
      return 'high';
    }
    if (score >= 4) {
      return 'medium';
    }
    if (score > 0) {
      return 'low';
    }
    return 'info';
  }
}

export function buildReportSummary(data: any): string {
  const findingsCount =
    (data.high_level_findings || 0) +
    (data.medium_level_findings || 0) +
    (data.low_level_findings || 0) +
    (data.information_findings || 0);

  return `Scan identified ${findingsCount} findings with a collective score of ${data.cvss}.`;
}
