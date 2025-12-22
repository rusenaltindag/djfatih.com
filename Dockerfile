# Build for linux/amd64 to ensure compatibility with x86_64 servers
# Use: docker buildx build --platform linux/amd64 -t djfatih-website .

FROM --platform=linux/amd64 nginx:alpine

# Copy website files to nginx html directory
COPY . /usr/share/nginx/html

# Remove any unnecessary files
RUN rm -f /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/.dockerignore \
    /usr/share/nginx/html/.DS_Store \
    /usr/share/nginx/html/.gitignore 2>/dev/null || true

# Create custom nginx config for SPA routing
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|mp3|mp4|webp|woff|woff2|ttf|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # HTML files - no cache for fresh content
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # JSON data files
    location ~* \.json$ {
        expires 1h;
        add_header Cache-Control "public";
    }

    # Main location - serve index.html for SPA routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
