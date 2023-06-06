# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2023-06-05

This is a major version release, which includes several improvements, but also several
breaking changes

### Changed
- The `photo_id` field is now simply called `_id`
- Images and Thumbnails are now split into separate lists
- Images are no longer exposed in an object with keys for pixel sizes, but in a list

### Added
- Support is added for gatsby-plugin-image. This is not full support, but does support the
  major features like responsive image sizing and blur-up placeholders. 

## [1.2.0] - 2021-04-19

### Added

- Add two additional sizes to the default request (1600px, 2048px)

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
