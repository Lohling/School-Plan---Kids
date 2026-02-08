FROM nginx:alpine

# Nginx Konfiguration kopieren
COPY nginx.conf /etc/nginx/nginx.conf

# Frontend Dateien kopieren
COPY . /usr/share/nginx/html

# Nicht-Root User für Sicherheit
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
