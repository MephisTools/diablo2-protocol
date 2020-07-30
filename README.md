
# diablo2-protocol

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![NPM version](https://img.shields.io/npm/v/diablo2-protocol.svg)](npm-url)
[![Build Status](https://github.com/Mephistools/diablo2-protocol/workflows/CI/badge.svg)](build-url)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](discord-url)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](gitpod-url)

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/Mephistools/diablo2-protocol">
    <img src="docs/images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">diablo2-protocol</h3>

  <p align="center">
    Network protocol for diablo 2 : create client and servers for diablo 1.13 and 1.14.
    <br />
    <a href="https://github.com/MephisTools/diablo2-protocol/wiki"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://www.youtube.com/watch?v=KYPTijLiwMI&feature=youtu.be">View Demo</a>
    ·
    <a href="https://github.com/Mephistools/diablo2-protocol/issues">Report Bug</a>
    ·
    <a href="https://github.com/Mephistools/diablo2-protocol/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Projects using diablo2-protocol](#projects-using-diablo2-protocol)
* [Documentation](#documentation)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Acknowledgements](#acknowledgements)

## Built With

* <https://github.com/ProtoDef-io/node-protodef>
* <https://github.com/ProtoDef-io/ProtoDef/blob/master/doc/datatypes.md>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

```sh
npm install npm@latest -g
```

### Installation

```js
npm install diablo2-protocol
```

<!-- USAGE EXAMPLES -->
## Usage

Follow bot in a few lines

```js
const { createClientDiablo } = require('diablo2-protocol')

async function start () {
  const clientDiablo = await createClientDiablo({
    host: 'battlenetIp',
    username: 'myUser',
    password: 'myPassword',
    version: '1.14',
    keyClassic: 'my16CharsKey',
    keyExtension: 'my16CharsKey'
  })
  clientDiablo.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
    clientDiablo.write('D2GS_RUNTOLOCATION', {
      x: targetX,
      y: targetY
    })
  })

  await clientDiablo.selectCharacter('mycharacter')
  await clientDiablo.createGame('mygame', '', '21', 0)
  console.log('Has joined the game')
}

start()

```

## Projects using diablo2-protocol

* [mephistools-sniffer](https://github.com/MephisTools/mephistools-sniffer) diablo 2 packet sniffing.
* [diablo2-live-viewer](https://github.com/MephisTools/diablo2-live-viewer) web map hack, packets table and inventory.
* [AutoTathamet](https://github.com/MephisTools/AutoTathamet) high level API to build bots for example

## Documentation

* <https://github.com/MephisTools/diablo2-protocol/wiki/Diablo-2-implementations-and-docs>

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/Mephistools/diablo2-protocol/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

* [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
* [Img Shields](https://shields.io)
* [Choose an Open Source License](https://choosealicense.com)
* [GitHub Pages](https://pages.github.com)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Mephistools/diablo2-protocol.svg?style=flat-square
[contributors-url]: https://github.com/Mephistools/diablo2-protocol/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Mephistools/diablo2-protocol.svg?style=flat-square
[forks-url]: https://github.com/Mephistools/diablo2-protocol/network/members
[stars-shield]: https://img.shields.io/github/stars/Mephistools/diablo2-protocol.svg?style=flat-square
[stars-url]: https://github.com/Mephistools/diablo2-protocol/stargazers
[issues-shield]: https://img.shields.io/github/issues/Mephistools/diablo2-protocol.svg?style=flat-square
[issues-url]: https://github.com/Mephistools/diablo2-protocol/issues
[license-shield]: https://img.shields.io/github/license/Mephistools/diablo2-protocol.svg?style=flat-square
[license-url]: https://github.com/Mephistools/diablo2-protocol/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
[npm-shield]: https://img.shields.io/npm/v/diablo2-protocol.svg
[npm-url]: http://npmjs.com/package/diablo2-protocol
[build-shield]: https://github.com/Mephistools/diablo2-protocol/workflows/CI/badge.svg
[build-url]: https://github.com/Mephistools/diablo2-protocol/actions?query=workflow%3A%22CI%22
[discord-shield]: https://img.shields.io/badge/chat-on%20discord-brightgreen.svg
[discord-url]: https://discord.gg/9RqtApv
[gitpod-shield]: https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg
[gitpod-url]: https://gitpod.io/#https://github.com/MephisTools/diablo2-protocol
