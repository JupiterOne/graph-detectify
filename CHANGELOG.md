# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.6.0 - 2020-10-29

### Changed

- Upgraded to SDK v4

## 0.5.2 - 2020-10-28

- Add `fetch-scan-profiles` step to integration config

## 0.5.1 - 2020-10-28

### Fixed

- Add `dependsOn: ['fetch-scan-profiles']` for `fetch-reports` step

## 0.5.0 - 2020-10-28

### Changed

- Separated `fetch-reports` from `fetch-scan-profiles` step

### Fixed

- Throw `IntegrationProviderAPIError` on non-200 responses
- Retry `ECONNRESET` node-fetch errors

## 0.1.0 - 2020-05-20

### Added

- Initial release.
