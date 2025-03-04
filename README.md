# Astro Starter Template with Keystatic CMS, Tailwind CSS, and DaisyUI

Welcome to your new project! This starter template is built using Astro, Keystatic CMS, Tailwind CSS, and DaisyUI, offering a powerful yet simple foundation for creating fast and beautiful static sites.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Astro**: Build fast, modern websites with Astro's powerful static site generator.
- **Keystatic CMS**: Manage your site's content with an easy-to-use CMS.
- **Tailwind CSS**: Rapidly build and style your site with Tailwind CSS.
- **DaisyUI**: Use beautiful, pre-designed components with DaisyUI.


## Server
- make bare git
- add post_receive hook
- export keys :
```
export PERIGON_API_KEY=abc123
export OPENAI_API_KEY=abc123
```


## Node setup
```
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

nvm install node
nvm use 23.9.0

npm install -g typescript ts-node

```

## GIT Setup
```
git config --bool core.bare true

DO server
git remote add origin ssh://myuser@1.2.3.4:/home/myuser/repos/easypoliticalnews.git

GitHub
git remote add gh git@github.com:Adrenaline89/easypoliticalnews.git
cd /home/pjebreo/repos/easypoliticalnews.git


post_receive hook
/home/myuser/repos/easypoliticalnews.git/.git/hooks
```


## Installation

### Materials
- local machine
- DO droplet - remote repo should be bare. create worktree
- GitHub repo
- CloudFlare

## Deployment
- push to DO server (origin)
- goto depoyed maketree dir
- push to github
- cloudflare will watch for github repo changes on main branch
- cloudflare will buils for pages

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v14.x or later)
- [npm](https://www.npmjs.com/) (v6.x or later) or [yarn](https://yarnpkg.com/) (v1.x or later)


### Install Dependencies

Using npm:

```sh
npm install
```

Or using yarn:

```sh
yarn install
```

## Usage

### Development

To start the development server, run:

```sh
npm run dev
```

Or with yarn:

```sh
yarn dev
```

Admin UI: [http://127.0.0.1:4321/keystatic](http://127.0.0.1:4321/keystatic)

Homepage: [http://localhost:4321](http://localhost:4321)

### Build

```sh
npm run build
```

Or with yarn:

```sh
yarn build
```

### Preview

To preview the production build locally, run:

```sh
npm run preview
```

Or with yarn:

```sh
yarn preview
```

## Project Structure

```text
/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and styles etc
│   ├── cms/                # Schema for Keystatic content
│   ├── components/         # Astro components
│   ├── content/            # Astro content managed by Keystatic
│   ├── layouts/            # Astro layouts
│   ├── pages/              # Astro pages
├── keystatic.config.ts     # Keystatic CMS configuration
├── keystatic.page.ts       # Keystatic CMS configuration for Singleton pages
├── tailwind.config.js      # Tailwind CSS configuration
├── astro.config.mjs        # Astro configuration
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```


## News JSON
```
data = {
    "table": {
        "headers": ["Distraction", "Important"],
        "rows": [
            {
                "Distraction": [
                    {
                    "Title": "Understanding AI",
                    "Author": "John Doe",
                    "DateTime": "2025-03-01T12:00:00Z",
                    "Link": "https://example.com/understanding-ai",
                    "Publication": "Tech Weekly"
                    }
                ]
                "Important": [
                    {
                    "Title": "Quantum Computing Breakthrough",
                    "Author": "Jane Smith",
                    "DateTime": "2025-03-01T14:30:00Z",
                    "Link": "https://example.com/quantum-computing",
                    "Publication": "Science Daily"
                    },
                    {
                    "Title": "Lorem ipsum",
                    "Author": "Foo Bar",
                    "DateTime": "2025-03-01T14:30:00Z",
                    "Link": "https://example.com/quantum-computing",
                    "Publication": "Science Daily"
                    }
                ]
            },
            {
                "Distraction": [
                    {
                    "Title": "Web3 and the Future",
                    "Author": "Alice Johnson",
                    "DateTime": "2025-03-01T16:45:00Z",
                    "Link": "https://example.com/web3-future",
                    "Publication": "Blockchain Insider"
                    },
                    {
                        "Title": "Lorem Ipsum",
                        "Author": "Alice Johnson",
                        "DateTime": "2025-03-01T16:45:00Z",
                        "Link": "https://example.com/web3-future",
                        "Publication": "Blockchain Insider"
                    }

                ],
                "Important": [
                    {
                    "Title": "Cybersecurity Trends",
                    "Author": "Bob Lee",
                    "DateTime": "2025-03-01T18:10:00Z",
                    "Link": "https://example.com/cybersecurity-trends",
                    "Publication": "Security Watch"
                    }
                ]
            }
        ]
    }
}
```
