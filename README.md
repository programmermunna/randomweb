# Browse Any

<div align="center">

**Discover Curated Websites Across the Internet**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://browseany.xyz)
[![Open Source](https://img.shields.io/badge/Open-Source-blue)](LICENSE)
[![Contributors](https://img.shields.io/badge/Contributors-Welcome-green)](CONTRIBUTING.md)

</div>

Browse Any is a curated website discovery tool that lets users explore interesting corners of the internet across various categories including tools, games, art, news, and more. Press a button and discover something new!

## ✨ Features

- **🎲 Random Discovery**: Explore curated websites from our database with a single click
- **📂 Categories**: Browse by category (General, Tools, Games, Art, Funny, Sports, News)
- **⭐ Favorites**: Save your favorite websites for quick access
- **📜 History**: Navigate back and forth through your browsing history
- **⌨️ Keyboard Shortcuts**: Power user controls for efficient navigation
- **⏱️ Auto-Click Timer**: Set automatic website discovery intervals (5s, 10s, 15s, 30s, 1m)
- **🌍 Multi-language**: Built-in Google Translate support for 100+ languages
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful glass-morphism design with smooth animations

## 🚀 Quick Setup

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Option 1: Direct File Opening (Simplest)

1. Clone the repository:
   ```bash
   git clone https://github.com/programmermunna/browseany.git
   cd browseany
   ```

2. Open `index.html` in your web browser
   - Double-click `index.html` or
   - Right-click and "Open with" your browser

### Option 2: Using a Local Server (Recommended)

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 🛠️ Development Setup

### Project Structure

```
browseany/
├── index.html          # Main HTML file
├── app.js              # Core JavaScript application logic
├── style.css           # Custom styles and design tokens
├── filter.py           # Python script to filter iframe-blocked URLs
├── DB/                 # Database files with curated URLs
│   ├── general.js
│   ├── tools.js
│   ├── games.js
│   ├── art.js
│   ├── funny.js
│   ├── sports.js
│   └── news.js
├── Assets/             # Static assets (images, favicon)
│   ├── bg.webp
│   ├── browseany-favicon.png
│   └── thumbnail.webp
└── README.md           # This file
```

### Adding New Websites

1. Open the appropriate category file in the `DB/` directory
2. Add URLs to the array following the existing format:
   ```javascript
   const DB_GENERAL = [
     "https://example.com",
     "https://another-site.com",
     // Add more URLs here
   ];
   ```

3. Save the file and refresh your browser

### Filtering Blocked URLs

Some websites block iframe embedding. Use the provided Python script to filter these out:

```bash
# Install dependencies
pip install requests

# Filter all DB files
python filter.py

# Filter specific files
python filter.py general.js tools.js
```

This script checks each URL for `X-Frame-Options` or `Content-Security-Policy` headers that would block iframe embedding and removes them from the database.

## 🤝 Contributing

We welcome contributions from everyone! Here's how you can help:

### Ways to Contribute

1. **🌐 Add New Websites**: Find interesting websites and add them to the appropriate category in the `DB/` directory
2. **🐛 Report Bugs**: Open an issue describing the problem and steps to reproduce it
3. **💡 Suggest Features**: Share your ideas for new features or improvements
4. **📝 Improve Documentation**: Help make this README and other documentation clearer
5. **🎨 Design Improvements**: Contribute UI/UX enhancements
6. **🔧 Code Contributions**: Fix bugs or implement new features

### Getting Started

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test thoroughly on different browsers and devices
5. Commit your changes:
   ```bash
   git commit -m "Add: brief description of your changes"
   ```
6. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

### Commit Message Guidelines

Use clear, descriptive commit messages:
- `Add: new category for music websites`
- `Fix: mobile responsive issues on favorites drawer`
- `Update: improved keyboard shortcuts documentation`
- `Refactor: optimized database loading logic`

### Code Style

- **JavaScript**: Follow existing patterns in `app.js`
- **CSS**: Use existing design tokens in `style.css`
- **HTML**: Maintain semantic structure and accessibility
- **Comments**: Add clear comments for complex logic

### Testing Checklist

Before submitting a PR, ensure:
- [ ] Works on Chrome, Firefox, Safari, and Edge
- [ ] Responsive on mobile and desktop
- [ ] No console errors
- [ ] Keyboard shortcuts function correctly
- [ ] Favorites system works
- [ ] History navigation works
- [ ] Auto-click timer functions properly

### Adding New Categories

1. Create a new file in `DB/` (e.g., `music.js`)
2. Follow the existing format:
   ```javascript
   const DB_MUSIC = [
     "https://example-music-site.com",
     // Add more URLs
   ];
   ```
3. Register the category in `app.js`:
   ```javascript
   const DB_DATA = {
     // ... existing categories
     music: { urls: DB_MUSIC, label: 'Music' }
   };
   ```
4. Add the script tag in `index.html`:
   ```html
   <script src="DB/music.js"></script>
   ```

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Load random website |
| `←` | Go back in history |
| `→` | Go forward in history |
| `F` | Toggle favorite |
| `O` | Open current site in new tab |
| `Esc` | Close favorites drawer |
| `0` | Reset to home |
| `?` | Show keyboard shortcuts help |

## 🌐 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS (via CDN) + Custom CSS
- **Fonts**: Space Grotesk, Inter, JetBrains Mono
- **Icons**: Inline SVG icons
- **Translation**: Google Translate API
- **URL Filtering**: Python with requests library

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- All the creators of the amazing websites featured in our database
- The open-source community for tools and libraries used
- Contributors who help improve this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/programmermunna/browseany/issues)
- **Discussions**: [GitHub Discussions](https://github.com/programmermunna/browseany/discussions)
- **Email**: [Open an issue](https://github.com/programmermunna/browseany/issues) for direct contact

## 🔮 Roadmap

- [ ] User accounts and cloud sync for favorites
- [ ] Advanced filtering and search
- [ ] Website rating system
- [ ] Dark/Light mode toggle
- [ ] Browser extension
- [ ] API for developers

---

<div align="center">

**Made with ❤️ by the Open Source Community**

[⭐ Star this repo](https://github.com/programmermunna/browseany) • [🐛 Report issues](https://github.com/programmermunna/browseany/issues) • [🚀 Contribute](CONTRIBUTING.md)

</div>
