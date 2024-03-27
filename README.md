# chatrun

Use any CLI with natural language.

![cover](https://github.com/falsa-dev/chatrun/assets/3000809/f4a24585-ed95-4974-bffe-cf4968713fad)


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
