# Test Monitoring Dashboard

A demo project for a metamorphic test monitoring dashboard.

## Deployment

Live URL:
[Vercel Live Link](https://metamorphic-demo.vercel.app)

## How to Run Locally

### Prerequisites

You need **Node.js** installed to use **npm** or **pnpm**.

### Steps to Run Locally

1. **Install dependencies:**
    
    ```bash
    npm install
    # or
    pnpm install
    # If there is a dependency conflict:
    # npm install --legacy-peer-deps
    ```
    
2. **Run the development server:**
    
    ```bash
    npm run dev
    # or
    pnpm run dev
    ```
    
3. **Access the application:**
    - Open your browser and navigate to:
    - http://localhost:3000

### To Update Data

Currently, all initial data and test results displayed in the application are loaded from JSON files in the `data/` directory:

- **`data/seed-tests.json`** - Contains the initial seed test cases shown in the "Test Info" tab
- **`data/test-suites.json`** - Contains pre-configured test suites shown in "Saved Test Suites"
- **`data/test-results.json`** - Contains test execution results
- **`data/execution-history.json`** - Contains execution history data for the "Test Execution" tab

To update the initial data and test results with actual data:

1. Locate the JSON file you want to update in the `data/` directory
2. Edit or replace the file with your actual test data, following the existing structure
3. Save the file
4. Restart the development server to see the changes

**Note:** Any data added or modified through the UI (such as adding new seed tests or saving test suites) is stored in the browser's `localStorage`.