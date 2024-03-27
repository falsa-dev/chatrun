# chatrun

Use any CLI with natural language.

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
