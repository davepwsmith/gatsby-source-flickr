# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2021-04-05

### Fixed

- Correct README

## [1.1.1] - 2021-04-05

### Fixed

- Correct Repo URL

## [1.1.0] - 2021-04-05

### Added

- Add some types - not amazing though, since none of the actual API data has any documentation about types!
- Fix additional data (lat/long to number from string)
- Add orientation

### Removed

- Remove some unnecessary/cryptic fields

## [1.0.0] - 2021-03-28

### Added

- Initial Version
- Was originally based on [gatsby-source-flickr](https://github.com/chrissearle/gatsby-source-flickr) by Chris Earle, but has deviated fairly significantly!

### Changed

- Use getPublicPhotos endpoint to start with - might add more configurability later
- Replace standard API calls with flickr-sdk
- Rewrite in typescript
- Refactor to allow for paginated responses
