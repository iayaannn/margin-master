# Margin Master

Margin Master is a comprehensive, local-first mobile application designed to help creators, makers, and small businesses accurately calculate their product costs and determine optimal profit margins. Built with React Native and Expo, it provides an intuitive interface to track everything from raw materials to electricity usage.

## Features

- 📦 **Material Management**: Track bulk materials, their costs, and units of measurement.
- ⚡️ **Appliance & Electricity Tracking**: Add appliances with their wattage to calculate precise electricity costs based on usage hours.
- 👷 **Labor & Overhead**: Factor in labor hours, hourly rates, packaging costs, and overhead percentages.
- 💰 **Advanced Profit Calculation**: A built-in cost engine automatically calculates total cost, desired profit margins, and the final selling price.
- 🔒 **Local-First & Secure**: All data (Materials, Appliances, Products) is stored locally on your device using `AsyncStorage`. User profiles and sensitive data are secured using Expo `SecureStore` and cryptographic hashing.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 54)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing
- **Storage**: `@react-native-async-storage/async-storage` for general data, `expo-secure-store` for sensitive profile data
- **Styling**: React Native StyleSheet (with custom theme tokens)
- **Language**: TypeScript

## Project Structure

```
├── app/                  # Expo Router file-based screens (tabs, onboarding, etc.)
│   ├── (tabs)/           # Main tab navigation
│   ├── appliances/       # Appliance management screens
│   ├── material/         # Material management screens
│   └── product/          # Product and margin calculation screens
├── assets/               # Static assets (images, icons, fonts)
├── src/                  # Core application logic and state
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── store.ts          # Local database, cost engine, and state management
│   └── theme.ts          # Application theme and styling tokens
└── package.json          # Project dependencies and scripts
```

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed, as well as the Expo Go app on your physical device, or an iOS Simulator/Android Emulator set up on your machine.

### Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npx expo start
```

In the terminal output, you'll find a QR code.
- **Physical Device**: Scan the QR code with the Expo Go app (Android) or the default Camera app (iOS).
- **Simulator/Emulator**: Press `i` to open in iOS simulator, or `a` to open in Android emulator.

## How the Cost Engine Works

The core of Margin Master is its local cost engine (`src/store.ts`). When calculating a product's price, it considers:

1. **Material Cost**: `(Bulk Cost / Bulk Quantity) * Quantity Used`
2. **Electricity Cost**: `((Appliance Wattage * Hours Used) / 1000) * Cost per kWh`
3. **Labor Cost**: `Labor Hours * Labor Rate`
4. **Overhead**: `(Material + Electricity + Labor + Packaging) * Overhead Percentage`

It then applies your desired profit margin percentage to give you a final recommended selling price!
