# 🎨 Kintsugi Code

> *Repair broken code with gold—finding beauty in imperfection*

A modern React + Vite project template designed to help you build high-performance web applications with a focus on code quality, performance, and best practices.

## 🚀 Features

- **React 19** - Latest React library with modern features
- **Vite** - Lightning-fast build tool and dev server with Hot Module Replacement (HMR)
- **TypeScript Ready** - Full TypeScript support for type-safe development
- **ESLint Configured** - Includes ESLint rules for code quality and consistency
- **Optimized Build** - Fast development and production builds

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React** | UI library |
| **Vite** | Build tool and dev server |
| **JavaScript** | Primary language |
| **ESLint** | Code linting and quality |

## 📦 Available Plugins

This template includes support for two official Vite React plugins:

1. **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)**
   - Uses [Oxc](https://oxc.rs) for fast JSX transformation
   - Default plugin choice

2. **[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react)**
   - Uses [SWC](https://swc.rs/) for ultra-fast transpilation
   - Great for projects requiring maximum performance

## ⚙️ Getting Started

### Prerequisites
- Node.js 16+ or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Shravya-GS/Kintsugi-Code.git
cd Kintsugi-Code

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The app will open at `http://localhost:5173` with HMR enabled.

### Build for Production

```bash
# Create an optimized production build
npm run build
# or
yarn build
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
# or
yarn preview
```

## 📝 ESLint Configuration

This project includes ESLint configuration for code quality. For production applications, we recommend extending the configuration with TypeScript-aware rules.

### Expanding ESLint Rules

To enhance the ESLint configuration for TypeScript projects:

1. Install TypeScript plugin:
   ```bash
   npm install --save-dev eslint-plugin-react-hooks
   ```

2. Reference the [TypeScript Vite template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for best practices

3. Add type-aware linting rules to `.eslintrc.cjs` or `.eslintrc.json`

## 🚫 React Compiler Status

The **React Compiler** is currently **not enabled** on this template due to its impact on development and build performance. 

To enable it in your project:
- See [React Compiler Installation Guide](https://react.dev/learn/react-compiler/installation)
- Review the performance implications before enabling

## 📂 Project Structure

```
Kintsugi-Code/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── index.html
├── vite.config.js
├── package.json
└── ...
```

## 🔗 Useful Links

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [ESLint Documentation](https://eslint.org)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Questions or Issues?

Feel free to open an [issue](https://github.com/Shravya-GS/Kintsugi-Code/issues) on GitHub if you have any questions or encounter any problems.

---

**Made with ✨ by [Shravya-GS](https://github.com/Shravya-GS)**
