# Base App Starter

A clean, generic foundation for mobile applications built with Expo and React Native.

## Features

- **Authentication**: Pre-configured login and register screens with `useAuth` hook.
- **Navigation**: Tab-based navigation setup with `Home` and `Profile` stacks.
- **State Management**: Redux Toolkit integration for global state.
- **Styling**: Consistent color palette and reusable UI components.
- **Structure**: Modular organization of screens, services, and hooks.

## Getting Started

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npx expo start
    ```

## Project Structure

- `src/components`: Reusable UI components.
- `src/navigation`: Navigation configuration and stack definitions.
- `src/screens`: Application screens organized by feature.
- `src/services`: API client and data service layers.
- `src/store`: Redux store and slices.
- `src/hooks`: Custom React hooks.
- `src/utils`: Utility functions and helpers.
- `src/styles`: Theme and global styling constants.
