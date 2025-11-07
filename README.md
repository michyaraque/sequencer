**Disclaimer**: Some features and code contributions in this project were co-created with the assistance of Claude. The editor, logic flow patterns, and documentation may include AI-generated or AI-refined parts. All code has been reviewed and adjusted by human developers before use.

# Game Dialog for Wired

A visual branching dialogue editor for Habbo using node-based flow. Built with **React** and **React-Flow**, this tool allows creating complex NPC dialog systems without placing endless WIRED boxes in a room.

Inspired by traditional game dialogue tools like Dialogue Designer, but adapted to how **bots**, **text connectors**, and **captured values** work inside Habbo.

## Purpose

Design and manage conversations as **nodes**.  
Each node represents part of a dialog and contains:
- Text spoken by the bot
- Player choices
- Optional conditions
- Optional effects (such as variable changes, giving items, etc.)
- Next node references

All logic is represented visually in a flow graph.

## Core Idea

Instead of building logic entirely through WIRED, the editor generates structured numeric command strings that bots can parse. Each action follows a compact format:

```

ACTIONID|VALUE1|VALUE2|VALUE3

```

Meaning depends on the action type.

### Example Actions

| Action Example | Meaning |
|---|---|
| `1004|variableId|amount` | Modify a variable (coins, reputation, etc.) |
| `nodeId|nextNodeId` | Go to next dialogue node |
| `passNode|failNode` | Conditional branching |

Bots can also include identifiers to handle multi-user interactions without flood issues:

```

BOTID|USERID|SPEECHID|ACTIONID|VALUE
30583|37191283|281114|1003|5

````

Multiple bots can be used to distribute load.

## Node Structure Example

```json
{
  "id": 2372,
  "text": "What would you like to do?",
  "options": [
    {
      "text": "Buy",
      "conditions": ["coins>=5"],
      "effects": ["1004|coins|subtract|5"],
      "next": 2373
    },
    {
      "text": "Sell",
      "conditions": [],
      "effects": [],
      "next": 2375
    }
  ]
}
````

## Workflow

1. Create nodes visually using React-Flow.
2. Add conditions and effects to each option.
3. Export the node graph into a compact command list.
4. Bot interprets and triggers dialog responses inside the room.
5. Player interacts without requiring complex WIRED setups.

## Features

* Node-based visual editor
* Multi-option branching dialogs
* Conditional checks
* Stackable condition chains
* Multiple effects per option
* Export to bot-readable instruction sets
* Optional node storage inside furnis for room persistence

## Installation

```bash
git clone https://github.com/michyaraque/sequencer.git
cd sequencer
pnpm install
pnpm dev
```

## Tech Stack

* Nextjs 16
* React-Flow
* Tailwind V4
* Zustand
* Optional JSON or DB persistence layer

## License

Open for creative use in Habbo-related or custom game projects.