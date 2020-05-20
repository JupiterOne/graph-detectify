# JupiterOne Managed Integration for Detectify

## Overview

JupiterOne provides a managed integration for Detectify. The integration
connects directly to [Detectify REST API][1] to obtain application scan assets,
reports, and findings.

Configure the integration by providing an API Key from your Detectify account.
JupiterOne by default ingests findings from the past 30 days. The configuration
can be changed to ingest findings from the latest scan reports (this option
requires Enterprise Plan from Detectify).

## Entities

The following entity resources are ingested when the integration runs.

| Detectify Resources | \_type of the Entity     | \_class of the Entity |
| ------------------- | ------------------------ | --------------------- |
| Account             | `detectify_account`      | `Account`             |
| Asset (Domain)      | `detectify_asset`        | `Application`         |
| Asset (Subdomain)   | `detectify_endpoint`     | `ApplicationEndpoint` |
| Scan Profile        | `detectify_scan_profile` | `Configuration`       |
| Finding             | `detectify_finding`      | `Finding`             |

The following relationships are created:

| From                 | Relationship | To                       |
| -------------------- | ------------ | ------------------------ |
| `detectify_asset`    | **HAS**      | `detectify_scan_profile` |
| `detectify_asset`    | **HAS**      | `detectify_endpoint`     |
| `detectify_endpoint` | **HAS**      | `detectify_finding`      |

The following relationships are mapped:

| From     | Relationship | To                         |
| -------- | ------------ | -------------------------- |
| `<ROOT>` | **HAS**      | `detectify_asset` (Domain) |

[1]: https://developer.detectify.com/
