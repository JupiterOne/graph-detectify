# JupiterOne Managed Integration for Detectify

## Overview

JupiterOne provides a managed integration for Detectify. The integration
connects directly to [Detectify REST API][1] to obtain application scan assets,
reports, and findings.

Configure the integration by providing an API Key from your Detectify account.
JupiterOne by default ingests findings from the past 30 days. The configuration
can be changed to ingest findings from the latest scan reports (this option
requires Enterprise Plan from Detectify).

JupiterOne vulnerability management and scanner integration is built on this
high level data model:

```text
Vendor   - HOSTS    ->       Account
Account  - PROVIDES ->       Service (*)
Service  - SCANS or TESTS -> <Entity> (*)
<Entity> - HAS      ->       Finding
```

> (\*) Examples:
>
> - `Service` (e.g. SAST, DAST, IAST, MAST, PenTest, etc.)
> - `<Entity>` (e.g. Application or Host or Device)

Optionally, the following is added when each scan/assessment/report is also
tracked by the integration:

```text
Service    - PERFORMS   -> Assessment
Assessment - IDENTIFIED -> Finding
```

[1]: https://developer.detectify.com/

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/master/docs/integrations/development.md
********************************************************************************
-->

## Data Model

### Entities

The following entities are created:

| Resources         | Entity `_type`           | Entity `_class`       |
| ----------------- | ------------------------ | --------------------- |
| Account           | `detectify_account`      | `Account`             |
| Asset (Domain)    | `web_app_domain`         | `Application`         |
| Asset (Subdomain) | `web_app_endpoint`       | `ApplicationEndpoint` |
| Finding           | `detectify_finding`      | `Finding`             |
| Scan Profile      | `detectify_scan_profile` | `Configuration`       |
| Scan Report       | `detectify_scan`         | `Assessment`          |
| Service           | `detectify_service`      | `Service`             |

### Relationships

The following relationships are created/mapped:

| Source Entity `_type` | Relationship `_class` | Target Entity `_type`    |
| --------------------- | --------------------- | ------------------------ |
| `detectify_account`   | **HAS**               | `detectify_scan`         |
| `detectify_account`   | **HAS**               | `web_app_domain`         |
| `detectify_account`   | **PROVIDES**          | `detectify_service`      |
| `detectify_scan`      | **IDENTIFIED**        | `detectify_finding`      |
| `detectify_service`   | **PERFORMED**         | `detectify_scan`         |
| `detectify_service`   | **SCANS**             | `web_app_domain`         |
| `web_app_domain`      | **HAS**               | `detectify_scan_profile` |
| `web_app_domain`      | **HAS**               | `web_app_endpoint`       |
| `web_app_endpoint`    | **HAS**               | `detectify_finding`      |

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->

The following relationships are mapped:

| From     | Relationship | To               |
| -------- | ------------ | ---------------- |
| `<ROOT>` | **DEVELOPS** | `web_app_domain` |
