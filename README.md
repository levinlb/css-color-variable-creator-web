# CSS Color Variable Creator

A modern web application that helps you transform your CSS color values into organized CSS variables. Upload your stylesheets and get instant color variable suggestions with an intelligent color management tool.

![CSS Color Variable Creator](public/og-image.jpg)

## Features

- 🎨 **Smart Color Detection**: Automatically detects and extracts all color values from your CSS files

  - Supports HEX, RGB, RGBA, and HSL formats
  - Identifies existing CSS variables
  - Suggests meaningful variable names

- 🔄 **Batch Processing**

  - Process multiple CSS files simultaneously
  - Organize colors with consistent naming conventions
  - Maintain color relationships across files

- 📋 **Easy Export**

  - Export color variables in various formats
  - One-click clipboard copy
  - Preview modified CSS with variables

- 🎯 **Modern UI/UX**
  - Real-time color preview
  - Interactive color picker
  - Responsive design
  - Beautiful animations
  - Dark mode support

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/levinspiekermann/css-color-variable-creator-web.git
cd css-color-variable-creator-web
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Files**

   - Drag and drop your CSS files onto the upload area
   - Supports CSS, SCSS, SASS, LESS, and Stylus files

2. **Manage Colors**

   - View all detected colors grouped by file
   - Edit variable names by clicking the edit icon
   - Modify colors using the built-in color picker
   - Toggle file visibility using the file filters

3. **Export**
   - Copy the generated CSS variables
   - Preview the modified CSS with variables applied
   - Use the variables in your project

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Styling**:
  - [Tailwind CSS](https://tailwindcss.com)
  - [Shadcn UI](https://ui.shadcn.com)
  - [Radix UI](https://www.radix-ui.com)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)
- **Animations**: [Framer Motion](https://www.framer.com/motion)
- **Color Manipulation**: [react-colorful](https://github.com/omgovich/react-colorful)
- **Development**:
  - [TypeScript](https://www.typescriptlang.org)
  - [Bun](https://bun.sh)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Shadcn UI](https://ui.shadcn.com) for the beautiful component system
- [Vercel](https://vercel.com) for hosting and deployment
- [Geist Font](https://vercel.com/font) for the typography

---

Made with ❤️ by [Levin Spiekermann](https://github.com/levinspiekermann)
