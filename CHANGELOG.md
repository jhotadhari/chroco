# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.2.4] - 2023-08-18
### Fixed
- Failed to build the app.

## [0.2.3] - 2023-08-18
### Fixed
- App didn't start on Ubuntu when started by launcher, but was able to start via cli command.

## [0.2.2] - 2023-08-18
### Fixed
- Missing release notes.

## [0.2.1] - 2023-08-18
### Changed
- Remove `electron-forge publish` command from publish script. Since gh actions builds are triggered by pushing the version tag

### Fixed
- README.md not existing in app bundle.
- Ensure single instance. If chroco gets executed multiple times, the additional instances will be closed directly.

## [0.2.0] - 2023-08-18
### Added
- About page. See `help` -> `about`.

### Changed
- Added some info to `README.md`. Now it is not empty anymore.
- Changed license to `CC-BY-NC-SA-4.0`.

### Fixed
- Default boolean value does not get applied when starting a record.

## [0.1.0] - 2023-08-07
Customizable fields.

### Added
- Feature to customize the fields.
- New field type `bool`.
- The project does have a `CHANGELOG.md` now. The publish script automatically updates the `CHANGELOG.md`.

### Removed
- Feature `hideFields`. Because the fields itself are customizable now.

## [0.0.4] - 2023-07-23
Change github actions release

### Changed
- Change github actions to run when a tag `v**` is pushed.

### Fixed
- Fix github actions permissions. Use `${{ secrets.GITHUB_TOKEN }}`.

## [0.0.3] - 2023-07-23
Fix github actions release

### Fixed
- Fix github actions: remove prerelease, release directly instead.

## [0.0.2] - 2023-07-23
Add github publisher and actions. To build the releases for all platforms with github actions

### Added
- Add publisher-github, github actions, and change npm publish script.

## [0.0.1] - 2023-07-23
First version

[0.2.4]: https://github.com/jhotadhari/chroco/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/jhotadhari/chroco/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/jhotadhari/chroco/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/jhotadhari/chroco/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/jhotadhari/chroco/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jhotadhari/chroco/compare/v0.0.4...v0.1.0
[0.0.4]: https://github.com/jhotadhari/chroco/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/jhotadhari/chroco/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/jhotadhari/chroco/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/jhotadhari/chroco/releases/tag/v0.0.1
