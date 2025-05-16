# LogisTracker

A real-time logistics tracking application built with Next.js that allows dispatchers to track vehicle locations, assign jobs to drivers, and manage driver statuses in real-time.

## Features

- Real-time vehicle tracking on an interactive map
- Driver status management (Active, Idle, Offline) with status filtering
- Job assignment and completion tracking
- Optimistic UI updates with server confirmation
- Driver search functionality
- Responsive layout with split-screen view

## Tech Stack

- **Frontend**: Next.js 15.x, React 19.x, TypeScript
- **UI Components**: Custom shadcn/ui-inspired components with Tailwind CSS
- **State Management**: Zustand for global state with optimistic updates
- **Map**: Leaflet with react-leaflet for interactive mapping
- **Mock Backend**: Express.js REST API + WebSocket server for real-time updates
- **Data Synchronization**: Shared data module between servers

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://your-repository-url/logis-tracker.git
   cd logis-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

The application requires three processes to run simultaneously:

1. The Next.js frontend application
2. The mock REST API server
3. The mock WebSocket server for real-time updates

### 1. Compile the Mock Servers

Before running the mock servers, you need to compile the TypeScript files to JavaScript:

```bash
npx tsc -p tsconfig.mocks.json
```

This will compile the TypeScript files in the `mocks` directory to JavaScript in the `mocks-dist` directory.

### 2. Start the Mock Servers

In separate terminal windows/tabs, run:

**Terminal 1 - Mock REST API Server:**

```bash
node mocks-dist/server.js
```

This will start the REST API server at http://localhost:3002

**Terminal 2 - Mock WebSocket Server:**

```bash
node mocks-dist/websocket.js
```

This will start the WebSocket server at ws://localhost:3001

### 3. Start the Next.js Application

**Terminal 3 - Frontend application:**

```bash
npm run dev
# or
yarn dev
```

### Running All Services (Optional)

For convenience, you can use a tool like `concurrently` to run all services with a single command. First, install concurrently:

```bash
npm install --save-dev concurrently
```

Then add this script to your package.json:

```json
"scripts": {
  ...
  "start:all": "concurrently \"npm run dev\" \"node mocks-dist/server.js\" \"node mocks-dist/websocket.js\"",
  "build:mocks": "tsc -p tsconfig.mocks.json"
}
```

Now you can run everything with:

```bash
npm run build:mocks && npm run start:all
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Development Workflow

### Modifying the Mock Servers

1. Edit the TypeScript files in the `mocks` directory:

   - `server.ts` - REST API endpoints
   - `websocket.ts` - WebSocket server for real-time vehicle updates
   - `shared-data.ts` - Shared data types and instances using the `JobManager` class

2. Compile the TypeScript files:

```bash
npx tsc -p tsconfig.mocks.json
```

3. Restart the relevant server:

```bash
node mocks-dist/server.js
# or
node mocks-dist/websocket.js
```

### Using the Application

1. **View Drivers**: All drivers are displayed in the sidebar on the left, with their current status indicated by colored badges (Active, Idle, Offline)

2. **Filter Drivers**: Use the status tabs at the top of the driver list to filter by status

3. **Search Drivers**: Use the search box to find drivers by name

4. **Track Vehicles**: All active vehicles are displayed on the map with their current location updated in real-time

5. **Assign Jobs**:

   - Click on a driver in the list
   - Use the Dispatch Panel to assign a job
   - The driver's status will update to "Active" and the job will be displayed

6. **Complete Jobs**:

   - Select a driver with an active job
   - Click "Complete Job" in the Dispatch Panel
   - The driver's status will change to "Idle"

7. **Pause/Resume Drivers**:
   - Select a driver
   - Click "Pause Driver" to set them to Offline status
   - Click "Resume Driver" to make them Active again

**Important Note:** The mock servers share data through the `shared-data.js` module. This ensures that changes made through the REST API (like job assignments) are correctly reflected in the WebSocket updates.

### Testing

Run the tests with:

```bash
npm run test
# or
yarn test
```

## Architecture Overview

### Frontend Application Structure

- `/src/features` - Feature-based component modules:
  - `/drivers` - Driver list, cards, and dashboard UI
  - `/dispatch` - Job assignment and driver management
  - `/map` - Interactive map with vehicle markers
- `/src/lib/store` - Zustand store for global state management with optimistic updates
- `/src/lib/hooks` - Custom hooks for data fetching and WebSocket connection:
  - `useDrivers` - Fetches driver data from REST API
  - `useRealTimeVehicles` - Manages WebSocket connection for vehicle updates
  - `useDispatchActions` - Handles job assignment and driver status changes
- `/src/lib/types` - TypeScript interfaces for the application
- `/src/components/ui` - Reusable UI components

### Backend Mock Servers

- `/mocks` - Mock server TypeScript source files:
  - `server.ts` - REST API endpoints for driver and job management
  - `websocket.ts` - WebSocket server for real-time vehicle updates
  - `shared-data.ts` - Shared data module used by both servers
- `/mocks-dist` - Compiled JavaScript mock server files

### Project Structure Diagram

```
logis-tracker/
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   │
│   ├── components/            # Shared components
│   │   └── ui/                # UI component library
│   │
│   ├── features/              # Feature modules
│   │   ├── dispatch/          # Job management
│   │   ├── drivers/           # Driver management
│   │   └── map/               # Map visualization
│   │
│   └── lib/                   # Application logic
│       ├── hooks/             # Custom React hooks
│       ├── store/             # Zustand store
│       └── types/             # TypeScript interfaces
│
├── mocks/                     # Mock server source code
│   ├── server.ts              # REST API server
│   ├── websocket.ts           # WebSocket server
│   └── shared-data.ts         # Shared data module
│
└── mocks-dist/                # Compiled mock servers
```

### Data Synchronization

The application implements optimistic updates to provide immediate feedback to users while ensuring data consistency:

1. When a user takes an action (like assigning a job), the UI updates immediately
2. The action is sent to the REST API server
3. The WebSocket server receives the updated data through the shared data module
4. The frontend confirms the update when it receives matching data from the server

**Data Flow Diagram:**

```
┌─────────────┐     ┌───────────────┐     ┌───────────────┐
│ User Action │────▶│ Optimistic UI │────▶│ Redux Store   │
│             │     │ Update        │     │ Update        │
└─────────────┘     └───────────────┘     └───────────────┘
                           │                      │
                           ▼                      │
                    ┌──────────────┐              │
                    │ REST API Call │              │
                    └──────────────┘              │
                           │                      │
                           ▼                      │
┌────────────────┐   ┌────────────┐        ┌─────────────┐
│ WebSocket      │◀──┤ Shared Data │       │ Confirmation │
│ Server Update  │   │ Module      │       │ Check        │
└────────────────┘   └────────────┘       └─────────────┘
       │                   ▲                     ▲
       │                   │                     │
       ▼                   │                     │
┌──────────────────┐       │                     │
│ Real-time Update │───────┴─────────────────────┘
│ to Client        │
└──────────────────┘
```

## Troubleshooting

- **Driver status not updating**: Ensure both the REST API and WebSocket servers are running
- **WebSocket connection errors**: Check that the WebSocket server is running on port 3001
- **Changes not reflected in real-time**: Verify that both servers are using the shared data module correctly
- **Offline drivers not becoming Active after job assignment**: This issue has been fixed by ensuring the REST API and WebSocket server share the same data instance
- **Status filters not working**: Ensure you're using the latest version with filter functionality implemented

## Recent Fixes

1. **Status Tab Filtering**: Fixed filtering in the driver list to properly filter based on driver status.
2. **Job Assignment for Offline Drivers**: Fixed issue where offline drivers would remain in "Offline" state after job assignment by:
   - Creating a shared data module between REST API and WebSocket servers
   - Implementing proper status updates in both servers
   - Adding better optimistic update handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Improvements

- Add authentication and user management
- Implement persistent storage with a database
- Add route planning and optimization
- Develop mobile companion app for drivers
- Add detailed analytics and reporting

## License

This project is licensed under the MIT License.
