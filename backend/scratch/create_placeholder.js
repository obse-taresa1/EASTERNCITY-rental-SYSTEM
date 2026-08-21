const fs = require('fs');
const path = require('path');
// Minimal 1x1 transparent PNG (base64)
const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6YV+8AAAAASUVORK5CYII=';
const placeholderPath = path.join(__dirname, '..', 'uploads', 'listings', 'placeholder.jpg');
fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });
fs.writeFileSync(placeholderPath, Buffer.from(placeholderBase64, 'base64'));
console.log('Placeholder image created at', placeholderPath);
