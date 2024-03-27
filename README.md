# chatrun

Use any CLI with natural language.

<img src="https://github.com/falsa-dev/chatrun/assets/3000809/f4a24585-ed95-4974-bffe-cf4968713fad" width="200" alt="cover image showing a keyboard and a chat bubble"/>

`chatrun` is a CLI tool that allows you to interact with any CLI using natural language. It uses OpenAI's GPT to convert your natural language query into a CLI command. It uses CLI man pages or help text to generate the command, so it is not limited to its implicit knowledge. This makes it useful for novel or less popular CLIs.

## Pre-requisites

Export `OPENAI_API_KEY` in your environment.

```sh
export OPENAI_API_KEY=sk-...
```

## Installation

```sh
npm install -g chatrun
```

## Usage examples

List all packages installed with `brew`.

```sh
chatrun --run "brew" --chat "list all packages"
```

Find all commits from yesterday.

```sh
chatrun --run "git" --chat "find all commits from yesterday"
```
