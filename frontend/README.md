# GTM Repository - Frontend

React-based frontend for the GTM (Go-to-Market) Repository portal.

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000
```

## Running the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- Browse GTM resources with header, description, tags, and videos
- Filter resources by tags
- Watch product demo videos in a modal player
- Responsive design for all devices
- Real-time tag extraction from backend

## Project Structure

```
src/
├── components/
│   ├── Header.js           # Portal header
│   ├── FilterBar.js        # Tag filter component
│   ├── ResourceGrid.js     # Resource grid layout
│   ├── ResourceCard.js     # Individual resource card
│   └── VideoModal.js       # Video player modal
├── App.js                  # Main app component
├── index.js               # React entry point
└── index.css              # Global styles
```
