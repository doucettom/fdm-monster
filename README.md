# FDM Monster [![GitHub stars](https://img.shields.io/github/stars/fdm-monster/fdmonster)](https://github.com/fdm-monster/fdm-monster/stargazers) [![GitHub issues](https://img.shields.io/github/issues/fdm-monster/fdm-monster?color=green)](https://github.com/fdm-monster/fdm-monster/issues) [![GitHub forks](https://img.shields.io/github/forks/fdm-monster/fdm-monster)](https://github.com/fdm-monster/fdm-monster/network/members) [![Latest Release](https://img.shields.io/github/release/fdm-monster/fdm-monster)](https://github.com/fdm-monster/fdm-monster/releases/latest) [![Coverage](https://codecov.io/gh/fdm-monster/fdm-monster/branch/develop/graph/badge.svg?flag=server-nodejs&precision=2)](https://app.codecov.io/gh/fdm-monster/fdm-monster)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

**_The server for managing 3D printers with great overview_**

FDM Monster is a bulk OctoPrint manager and dashboard written in Vue with Typescript meant to be accessed local, remote, offline or online. This project has a different approach to farm management than normal - it actually scales for bigger farms (50-100). We therefore aim 🚀 for high code quality 😎 and robustness all around 💪. The goals are to deliver a smooth initial setup and 100% clear user experience to ensure you can smash those printing records 🖨️!

Note: our aim is to support all kinds of 3D Printer (FDM, resin) API's with a plugin system and documentation for extensibility - in the future. Read more about this in the roadmap section below.

**What we dont aim for**
We dont aim to provide webcam support right now as this is one of the big bottlenecks for stable server performance. This might change once the developers of FDM Monster have the plugin system tested and working.

<!--  ![Docker Pulls](https://img.shields.io/docker/pulls/fdm-monster/fdm-monster) -->
<!-- ![GitHub release (latest by date)](https://img.shields.io/github/downloads/fdm-monster/fdm-monster/latest/total) -->

## Stability

This server is currently freshly released, so give it a star ⭐and be the first to experience it! 

#### Last finished features: 
- Print material/color/assignee parser and tile border color
- Optional Auto-clean old OctoPrint files with different settings
- Dependency updates using Renovate (thanks to @mkevenaar for the tips)
- Quick copy and paste of a FDM Monster printer
- Firmware update plugin service
- Printer Floors (like departments) and Printer Groups improvements
- Printer completion/failure tracking (with statistics page)
#### Current work:
- BedTemp override (default true and 50 deg) to reduce farm power consumption 
- Preparation migration work to NestJS
- Client in Vue3, waiting for Vuetify 3.0 and 3.1 release (https://github.com/fdm-monster/fdm-monster-client)

## Development [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://gitHub.com/fdm-monster/fdm-monster/graphs/commit-activity) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/fdm-monster/fdm-monster/Node.js%20CI?query=branch%3Adevelop)](https://github.com/fdm-monster/fdm-monster/actions/workflows/nodejs.yml?query=branch%3Adevelop) [![GitHub license](https://img.shields.io/github/license/fdm-monster/fdm-monster)](https://github.com/fdm-monster/fdm-monster/blob/master/LICENSE.txt)
This work is under active development with cutting edge tech and open-source standards. 

Have you spotted something wrong or do you have ideas for improvement? Please do create an issue, create a pull-request, send an email, or open a discussion!
Feel like joining in as a developer or do you have a quick fix? Great! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Roadmap

- [x] :rocket: Vue app core and distribution setup on NPM completed
- [x] :rocket: Client for basic management of OctoPrint printers (file storage, print upload and printer management)
- [x] 🌟 Printer Location Map based on 2x2 groups
- [x] 🛡️ Server resilient against database connection failures with automatic retry of 5 seconds
- [x] 🔌 FDM Monster Connector (OctoPrint Plugin) prerelease 0.1.0 ([find it here](https://gitHub.com/fdm-monster/fdm-connector/releases))
- [x] 🛡️ Better authentication and authorization mechanisms
- [x] :rocket: Docker amd64 image (sadly arm/v7 has become intractable)
- [x] :rocket: Printer Group management
- [x] 🛡️ MongoDB 5 support
- [x] :rocket: First core release tested in the field
- [x] Server restart capability using PM2 and nodemon (for Linux, Windows)
- [x] :rocket: Quick copy paste of OctoPrint credentials
- [x] 🛡️ Complete API test coverage >80% (now at 80.5%)
- [x] 🛡️ NodeJS Server legacy-free (history, alerts, custom gcode and filament)
- [x] :rocket: Printer Floor management (departments)
- [ ] Client with Vuetify 3.0
- [ ] Client with Vuetify 3.1 (datatable!)
- [ ] :rocket: Documentation
- [ ] 🛡️ Frontend user and basic role management
- [ ] 🛡️ Client test coverage
- [ ] 🔌 FDM Connector - filament tracker 
- [ ] 🔌 Raspberry Pi image and prebuilt customized OctoPi image
- [ ] :rocket: Chocolatey package (Windows install)
- [ ] :rocket: Plugin system (preparation work is ready)
- [ ] :rocket: Docker overlay as service management (daemonized restart & auto-updates)
- [ ] Support for OctoPrint 2.0.0 (when it comes out)
- [ ] More to be found here https://github.com/fdm-monster/fdm-monster/discussions/48

There are a lot of plans in the making (f.e. tunneling, auto-discovery, plugin system,  etc.), which will be announced as we go!

## Contributors ✨

These awesome people involved in the project ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/davidzwa"><img src="https://avatars.githubusercontent.com/u/6005355?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David Zwart</b></sub></a><br /><a href="https://github.com/fdm-monster/fdm-monster/issues?q=author%3Adavidzwa" title="Bug reports">🐛</a> <a href="https://github.com/fdm-monster/fdm-monster/commits?author=davidzwa" title="Code">💻</a> <a href="#maintenance-davidzwa" title="Maintenance">🚧</a> <a href="#userTesting-davidzwa" title="User Testing">📓</a></td>
    <td align="center"><a href="https://kevenaar.name"><img src="https://avatars.githubusercontent.com/u/834643?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maurice Kevenaar</b></sub></a><br /><a href="#security-mkevenaar" title="Security">🛡️</a> <a href="#maintenance-mkevenaar" title="Maintenance">🚧</a> <a href="#ideas-mkevenaar" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Tobikisss"><img src="https://avatars.githubusercontent.com/u/45754890?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tobias</b></sub></a><br /><a href="#ideas-Tobikisss" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-Tobikisss" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<table></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

FDM Power is licensed with [LGPL-3.0](LICENSE). This means in essence that you may use it commercially, but it must be in FOSS fashion.
Any changes should be publicly available through Github forks or repositories. For details, please consult the LICENSE file.

## Contact
- Main repository: [https://github.com/fdm-monster/fdm-monster](https://github.com/fdm-monster/fdm-monster)
- Discord: [FDM Monster - Discord server](https://discord.gg/mwA8uP8CMc)

Please join the discord, but stay professional and proactive!
> "You give some, you take some."

## Historical Note

This project has been forked from OctoFarm at September 2021 when I ended as a contributor to this project. 
FDM Monster is not intending to compete with OctoFarm, we're just another project with a different vision.
