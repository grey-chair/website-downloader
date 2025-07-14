# Enhanced Web Scraper

A powerful web scraping tool that combines **wget** for HTML content and **Playwright** for intelligent image extraction with automatic tagging.

## 🚀 Features

- **Dual Scraping Engine**: wget for HTML + Playwright for images
- **Intelligent Image Tagging**: Automatic categorization (logo, hero, banner, icon, product, gallery)
- **RESTful API**: Flask-based backend with comprehensive endpoints
- **React Frontend**: Modern UI for managing downloads
- **Metadata Generation**: Detailed image information and site maps
- **Background Processing**: Non-blocking downloads with progress tracking

## 🏗️ Architecture

```
├── app.py                 # Flask backend API
├── frontend/             # React frontend application
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies
├── start.sh             # Startup script
└── test.py              # Standalone image scraper
```

## 🛠️ Installation

### Prerequisites
- Python 3.7+
- Node.js 14+
- wget

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd python_web_extractor
   ```

2. **Install Python dependencies**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   playwright install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

## 🚀 Quick Start

### Option 1: Use the startup script (recommended)
```bash
./start.sh
```

### Option 2: Run components individually
```bash
# Backend (Flask API)
source venv/bin/activate
python app.py

# Frontend (React)
npm start
```

## 📡 API Endpoints

### Start Download
```bash
POST /api/download
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Check Status
```bash
GET /api/status/{download_id}
```

### List Downloads
```bash
GET /api/downloads
```

### Serve Files
```bash
GET /api/files/{download_id}/{filename}
```

### Get Site Map
```bash
GET /api/sitemap/{download_id}
```

### Get Image Metadata
```bash
GET /api/images/{download_id}
```

### Download Complete Content (ZIP)
```bash
GET /api/download-zip/{download_id}
```

### Download Images Only (ZIP)
```bash
GET /api/download-images/{download_id}
```

### Download HTML Content Only (ZIP)
```bash
GET /api/download-html/{download_id}
```

### Health Check
```bash
GET /api/health
```

## 🏷️ Image Tagging System

Images are automatically categorized based on:

- **logo**: filename or class contains "logo"
- **hero**: width ≥ 1000 and height ≥ 300
- **banner**: alt/class contains "header", "banner", or "hero"
- **icon**: width < 100 and height < 100
- **product**: alt/filename contains "product", "cover", "item", or "feature"
- **gallery**: default fallback

## 📁 Output Structure

```
downloads/
└── {download_id}/
    ├── {domain}/
    │   ├── index.html
    │   └── ... (other HTML files)
    ├── images/
    │   ├── image1.jpg
    │   ├── image2.png
    │   └── ... (downloaded images)
    ├── site_map.md
    └── image_metadata.json
```

## 🎯 Usage Examples

### Download a website
```bash
curl -X POST http://localhost:5001/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com"}'
```

### Check download status
```bash
curl http://localhost:5001/api/status/{download_id}
```

### Download scraped content to your local machine
```bash
# Download complete scraped content (HTML + Images + Metadata)
curl -O -J http://localhost:5001/api/download-zip/{download_id}

# Download images only
curl -O -J http://localhost:5001/api/download-images/{download_id}

# Download HTML content only
curl -O -J http://localhost:5001/api/download-html/{download_id}

# Or simply visit these URLs in your browser to download directly
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to "development" for debug mode
- `PORT`: Backend port (default: 5001)

### Customization
- Modify `download_images_with_playwright()` for custom image tagging rules
- Adjust wget parameters in `download_site_worker()` for different scraping behavior
- Update frontend proxy settings in `package.json` if changing backend port

## 🧪 Testing

### Standalone Image Scraper
```bash
source venv/bin/activate
python test.py
```

### API Testing
```bash
# Health check
curl http://localhost:5001/api/health

# List downloads
curl http://localhost:5001/api/downloads
```

## 📊 Performance

- **Concurrent Downloads**: Multiple downloads can run simultaneously
- **Background Processing**: Non-blocking downloads with progress tracking
- **Memory Efficient**: Downloads are processed in chunks
- **Timeout Protection**: 5-minute timeout per download

## 🔒 Security

- CORS enabled for frontend integration
- Input validation for URLs
- Error handling for failed downloads
- No sensitive data logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**wget not found**
```bash
# macOS
brew install wget

# Ubuntu/Debian
sudo apt-get install wget
```

**Playwright browsers not installed**
```bash
source venv/bin/activate
playwright install
```

**Port already in use**
```bash
# Find process using port
lsof -ti:5001

# Kill process
kill {process_id}
```

### Debug Mode
```bash
export FLASK_ENV=development
python app.py
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Open an issue on GitHub

---

**Happy Scraping! 🕷️✨** 