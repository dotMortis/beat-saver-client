# Changelog

## [0.10.0-beta] - 14.10.2021

### Added
- paginated/infinite switch to settings
- paginated/infinite home
- paginated/infinite installed songs
- paginated/infinite mapper songs

### Updated
- settings rearranged

### Fixed
- isDeleted status for song cards

## [0.9.0-beta] - 02.10.2021

### Added
- mappers paginated table
- mapper detail view (paginated song cards!)
- mapper playlist download
- mapper tabs to navigation bar

### Updated
- navigation bar (responsive update)
- mapper detail view opens on mapper name click
- download sequence

## [0.8.4-beta] - 30.09.2021

### Updated
- #42 performance on update installed songs cache

### Fixed
- #42 hash computing for installed songs change detection

## [0.8.3-beta] - 25.09.2021

### Added
- Corrupted song file handling (Thanks to Spryte)

### Fixed
- typo

## [0.8.2-beta] - 25.09.2021

### Added
- Challange Community Discord

### Fixed
- missing db.sqlite3 after installation

## [0.8.1-beta] - 25.09.2021

### Updated
- splash screen
- start up sequence

## [0.8.0-beta] - 23.09.2021

### Added
- search by song id function
- BeatSaver to community sites

### Updated
- detail tab style

## [0.7.0-beta] - 22.09.2021

### Added
- move to beta versions
- local songs search page
- local songs filter
- local songs counter
- detail page tabs
- persistent pages on navigate (quality of life)
- sqlite local songs cache
- BeatSaver community discord
- detail page is unloaded if not selected for 60 seconds
- custom install script

### Updated
- rewritten song cards
- rewritten difficulty card 
- rewritten navigation
- detail page tweaks
- tour
- on success, remove single installtion from queue
- setting sidebar not closebale on missing settings
- angular 12
- primeng 11 (primeng 12 is a buggy hell)

### Fixed
- a bunch of visual tweaks
- error handling

## [0.6.0-alpha] - 09.09.2021

### Added
- song detail page
- song leaderboard
- persistent filter (on navigate)

## [0.5.0-alpha] - 29.08.2021

### Added
- community menu button
- add version to about panel

### Fixed
- default settings not loaded on first start

## [0.4.0-alpha] - 29.08.2021
### Added
- daily rotate logs
- Changelog panel
- About panel
- auto app updater
- lazy loaded dashboard
- visual tweaks

### Fixed
- property changed wasn't called on ipc events

## [0.3.0-alpha] - 25.08.2021
### Added
- Functions tour
- Custom splash screen
- Lazy loading
- Expandable song cards
- Persistent window status
- Default search on client startup
- Persistent download queue
- Menu
- Settings
- Download queue system
- BeatSaber installtion folder reader
- BeatSaber player stats reader
- BeatSaver map search functionality

### Fixed
- Filter player stats with 0 counters
- Error on unzip maps with subfolders
- Date range not selectable
