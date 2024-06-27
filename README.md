# CamViewer.ai

CamViewer.ai is a web application built with Next.js, TypeScript, and Tailwind CSS that allows users to interact with their computer's camera and utilize AI to detect and identify elements on the screen. The application highlights detected persons in red and other objects (like chairs, dogs, etc.) in green using a canvas overlay. 

## Features

- **AI Detection**: Utilizes models from [TensorFlow](https://www.tensorflow.org) to detect persons and other elements.
- **Dynamic Styling**: Styled using [Shadecn](https://ui.shadcn.com/) for a modern and responsive design.
- **Iconography**: Icons provided by [Radix Icons](https://www.radix-ui.com/icons) and [Lucide Icons](https://lucide.dev/icons).
- **Recording**: Ability to record video and take screenshots.
- **Auto-Record**: Automatically starts recording when a person is detected.

## Installation

You can use either `yarn` or `npm` to install and run the project.

### Using Yarn

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/CamViewer.ai.git
    ```
2. Navigate to the project directory:
    ```sh
    cd CamViewer.ai
    ```
3. Install the dependencies:
    ```sh
    yarn install
    ```
4. Start the development server:
    ```sh
    yarn dev
    ```

### Using npm

1. Clone the repository:
    ```sh
    git clone https://github.com/malvarez88/camviewer-ai.git
    ```
2. Navigate to the project directory:
    ```sh
    cd camviewer-ai
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```
4. Start the development server:
    ```sh
    npm run dev
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Allow camera access when prompted.
3. Use the interface to start detecting elements, recording videos, and taking screenshots.
4. Enable auto-record to start recording automatically when a person is detected.

## Dependencies

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TensorFlow](https://www.tensorflow.org)
- [ShadeUI](https://ui.shadcn.com/)
- [Radix Icons](https://www.radix-ui.com/icons)
- [Lucide Icons](https://lucide.dev/icons)

## Contribution

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
