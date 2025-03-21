# HyperBricks VS Code Extension

## Overview

The HyperBricks VS Code Extension provides syntax highlighting, formatting, and IntelliSense support for the HyperBricks.

## Features

- **Syntax Highlighting**: Enhanced syntax highlighting for `.hyperbricks` files.
- **Code Formatting**: Automatic code formatting using Prettier.
- **IntelliSense**: Code completion and suggestions for HyperBricks types and properties.
- **Snippets**: Predefined code snippets for common HyperBricks patterns.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/hyperbricks/hyperbricks-vs-highlighting.git
    ```
2. Navigate to the project directory:
    ```sh
    cd hyperbricks-vs-highlighting
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Compile the TypeScript code:
    ```sh
    npm run compile
    ```
5. Open the project in VS Code:
    ```sh
    code .
    ```
6. Press `F5` to launch the extension in a new VS Code window.

## Usage

- Open a `.hyperbricks` file to see syntax highlighting and IntelliSense in action.
- Use the provided snippets for quick code insertion.
- Format your code using the built-in formatter (right-click and select "Format Document" or use the default shortcut `Shift+Alt+F`).

## Configuration

The extension uses a Prettier configuration defined in `.prettierrc` for formatting. You can customize the settings as needed.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear messages.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [VS Code API](https://code.visualstudio.com/api)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## Contact

For any questions or suggestions, please open an issue or contact the maintainer at [your-email@example.com].