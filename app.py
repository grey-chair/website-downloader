#!/usr/bin/env python3
"""
Site Mirror Tool - Flask API for frontend integration
Downloads websites using wget and generates a markdown site map
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import subprocess
import shutil
from pathlib import Path
from urllib.parse import urlparse
import time
import threading
import uuid
# Add Playwright imports
from playwright.sync_api import sync_playwright
from urllib.parse import urljoin
import urllib.request
import json

app = Flask(__name__)
CORS(app)

# Configuration
DOWNLOAD_DIR = 'downloads'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Global variables for tracking downloads
download_status = {}
download_lock = threading.Lock()

def validate_url(url):
    """Validate URL format"""
    if not url:
        return False, "URL cannot be empty"
    
    if not url.startswith(('http://', 'https://')):
        return False, "URL must start with http:// or https://"
    
    try:
        parsed = urlparse(url)
        if not parsed.netloc:
            return False, "Invalid URL: no domain found"
        return True, None
    except Exception as e:
        return False, f"Invalid URL format: {str(e)}"

def check_wget_installed():
    """Check if wget is installed"""
    if shutil.which('wget') is None:
        return False, "wget is not installed. Please install wget to use this tool."
    return True, None

def download_images_with_playwright(url, output_dir):
    """Download all images from the given URL using Playwright into output_dirimages"""
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    image_data = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        images = page.query_selector_all("img")
        
        for img in images:
            src = img.get_attribute("src")
            if src:
                full_url = urljoin(url, src)
                try:
                    filename = os.path.basename(src)
                    filepath = os.path.join(images_dir, filename)
                    urllib.request.urlretrieve(full_url, filepath)
                    
                    # Get image metadata
                    alt = img.get_attribute("alt") or ""
                    class_name = img.get_attribute("class") or ""
                    width = img.get_attribute("width")
                    height = img.get_attribute("height")
                    
                    # Convert width/height to integers if they exist
                    width = int(width) if width and width.isdigit() else None
                    height = int(height) if height and height.isdigit() else None
                    
                    # Dynamic tag assignment
                    tag = "gallery"  # default fallback
                    
                    # Tag as "logo" if filename or class_name includes "logo"
                    if "logo" in filename.lower() or "logo" in class_name.lower():
                        tag = "logo"
                    # Tag as "hero" if width >= 1000 and height >= 300
                    elif width and height and width >= 1000 and height >= 300:
                        tag = "hero"
                    # Tag as "banner" if alt or class_name contains "header", "banner", or "hero"
                    elif any(keyword in alt.lower() or keyword in class_name.lower() 
                           for keyword in ["header", "banner", "hero"]):
                        tag = "banner"
                    # Tag as "icon" if width < 100 && height < 100
                    elif width and height and width < 100 and height < 100:
                        tag = "icon"
                    # Tag as "product" if alt or filename includes "product", "cover", "item", or "feature"
                    elif any(keyword in alt.lower() or keyword in filename.lower() 
                           for keyword in ["product", "cover", "item", "feature"]):
                        tag = "product"
                    
                    # Add image data entry
                    image_data.append({
                        "filename": filename,
                        "alt": alt,
                        "width": width,
                        "height": height,
                        "src": full_url,
                        "tag": tag
                    })
                    
                except Exception as e:
                    print(f"Failed to download {full_url}: {e}")
        
        browser.close()
    
    # Save image metadata to a JSON file
    image_metadata_path = os.path.join(output_dir, "image_metadata.json")
    with open(image_metadata_path, "w", encoding="utf-8") as f:
        json.dump(image_data, f, indent=2, ensure_ascii=False)
    
    return image_data

def download_site_worker(url, download_id, output_dir):
    """Worker function to download site in background"""
    try:
        # Update status to starting
        with download_lock:
            download_status[download_id] = {
                'status': 'starting',
                'progress': 0,
                'message': 'Initializing download...',
                'url': url,
                'output_dir': output_dir
            }
        
        print(f"🔄 Starting wget site mirror of {url}...")
        
        # wget command with same options as shell script
        wget_cmd = [
            'wget',
            '-r',                    # recursive download
            '-p',                    # download all files needed to display HTML page
            '-k',                    # convert links to work locally
            '-e', 'robots=off',      # ignore robots.txt
            '--html-extension',      # save files with .html extension
            '--convert-links',       # convert links to work locally
            '--restrict-file-names=windows',  # use Windows-compatible filenames
            '--no-parent',           # don't follow links to parent directory
            '--directory-prefix', output_dir,  # output directory
            '-A', 'jpeg,jpg,bmp,gif,png,webp,svg,ico,css,js,html,htm,txt,pdf,doc,docx,xls,xlsx,ppt,pptx,mp3,mp4,wav,ogg,webm,zip,tar,gz,bz2,rar,7z,txt,csv,json,xml,yaml,yml,ini,conf,log,sql,sqlite,db,db3,db4,db5,db6,db7,db8,db9,db10,db11,db12,db13,db14,db15,db16,db17,db18,db19,db20',
            '-U', 'Mozilla',         # user agent
            # Limit to 1 page
            '-l', '1',               # limit recursion to 1 level (1 page)
            url
        ]
        
        # Update status to downloading
        with download_lock:
            download_status[download_id].update({
                'status': 'downloading',
                'progress': 10,
                'message': 'Downloading site with wget...'
            })
        
        # Run wget
        result = subprocess.run(wget_cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            # Update status to processing
            with download_lock:
                download_status[download_id].update({
                    'status': 'processing',
                    'progress': 80,
                    'message': 'Download complete. Generating site map...'
                })
            
            # Generate site map
            site_map_path = os.path.join(output_dir, "site_map.md")
            success, error_msg = generate_site_map(output_dir, site_map_path)
            
            # Download images with Playwright
            try:
                download_images_with_playwright(url, output_dir)
            except Exception as e:
                print(f"Image scraping failed: {e}")

            if success:
                # Update status to completed
                with download_lock:
                    download_status[download_id].update({
                        'status': 'completed',
                        'progress': 100,
                        'message': 'Site mirror complete!',
                        'site_map': site_map_path
                    })
            else:
                # Update status to completed with warning
                with download_lock:
                    download_status[download_id].update({
                        'status': 'completed',
                        'progress': 100,
                        'message': 'Download complete but site map generation failed',
                        'warning': error_msg
                    })
        else:
            error_msg = f"wget failed with return code {result.returncode}"
            if result.stderr:
                error_msg += f"\nError: {result.stderr}"
            
            # Update status to failed
            with download_lock:
                download_status[download_id].update({
                    'status': 'failed',
                    'progress': 0,
                    'message': error_msg
                })
                
    except subprocess.TimeoutExpired:
        with download_lock:
            download_status[download_id].update({
                'status': 'failed',
                'progress': 0,
                'message': 'Download timed out after 5 minutes'
            })
    except Exception as e:
        with download_lock:
            download_status[download_id].update({
                'status': 'failed',
                'progress': 0,
                'message': f'Download failed: {str(e)}'
            })

def generate_site_map(output_dir, site_map_path):
    """Generate markdown site map"""
    try:
        with open(site_map_path, "w", encoding="utf-8") as f:
            f.write(f"# Site Map\n\n")
            f.write(f"Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for dirpath, dirnames, filenames in os.walk(output_dir):
                # Calculate depth for indentation
                depth = dirpath[len(output_dir):].count(os.sep)
                indent = "  " * depth
                
                # Write directory name
                if depth > 0:
                    dir_name = os.path.basename(dirpath)
                    f.write(f"{indent}- **{dir_name}/**\n")
                
                # Write files
                subindent = "  " * (depth + 1)
                for filename in sorted(filenames):
                    if filename != "site_map.md":
                        f.write(f"{subindent}- `{filename}`\n")
        
        return True, None
        
    except Exception as e:
        return False, f"Failed to generate site map: {str(e)}"

@app.route('/api/download', methods=['POST'])
def start_download():
    """Start a new site download"""
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({
            'error': 'URL is required',
            'usage': 'Send JSON with {"url": "https://example.com"}'
        }), 400
    
    url = data['url']
    
    # Validate URL
    is_valid, error_msg = validate_url(url)
    if not is_valid:
        return jsonify({
            'error': 'Invalid URL',
            'message': error_msg
        }), 400
    
    # Check if wget is installed
    wget_ok, error_msg = check_wget_installed()
    if not wget_ok:
        return jsonify({
            'error': 'System requirement not met',
            'message': error_msg
        }), 500
    
    # Generate unique download ID and output directory
    download_id = str(uuid.uuid4())
    output_dir = os.path.join(DOWNLOAD_DIR, download_id)
    
    # Start download in background thread
    thread = threading.Thread(
        target=download_site_worker, 
        args=(url, download_id, output_dir)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'download_id': download_id,
        'message': 'Download started',
        'url': url,
        'status_endpoint': f'/api/status/{download_id}',
        'files_endpoint': f'/api/files/{download_id}'
    })

@app.route('/api/status/<download_id>')
def get_status(download_id):
    """Get download status"""
    with download_lock:
        if download_id not in download_status:
            return jsonify({'error': 'Download not found'}), 404
        
        return jsonify(download_status[download_id])

@app.route('/api/downloads')
def list_downloads():
    """List all downloads"""
    with download_lock:
        downloads = []
        for download_id, status in download_status.items():
            downloads.append({
                'id': download_id,
                'url': status.get('url'),
                'status': status.get('status'),
                'progress': status.get('progress', 0),
                'message': status.get('message')
            })
        return jsonify(downloads)

@app.route('/api/files/<download_id>')
@app.route('/api/files/<download_id>/<path:filename>')
def serve_files(download_id, filename='index.html'):
    """Serve downloaded files"""
    with download_lock:
        if download_id not in download_status:
            return jsonify({'error': 'Download not found'}), 404
        
        status = download_status[download_id]
        if status['status'] != 'completed':
            return jsonify({'error': 'Download not completed'}), 400
    
    output_dir = status.get('output_dir')
    if not output_dir or not os.path.exists(output_dir):
        return jsonify({'error': 'Files not found'}), 404
    
    return send_from_directory(output_dir, filename)

@app.route('/api/sitemap/<download_id>')
def get_sitemap(download_id):
    """Get site map for a download"""
    with download_lock:
        if download_id not in download_status:
            return jsonify({'error': 'Download not found'}), 404
        
        status = download_status[download_id]
        if status['status'] != 'completed':
            return jsonify({'error': 'Download not completed'}), 400
    
    site_map_path = status.get('site_map')
    if not site_map_path or not os.path.exists(site_map_path):
        return jsonify({'error': 'Site map not found'}), 404
    
    try:
        with open(site_map_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({'content': content})
    except Exception as e:
        return jsonify({'error': f'Failed to read site map: {str(e)}'}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    wget_ok, error_msg = check_wget_installed()
    return jsonify({
        'status': 'healthy' if wget_ok else 'unhealthy',
        'wget_installed': wget_ok,
        'wget_error': error_msg if not wget_ok else None
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 