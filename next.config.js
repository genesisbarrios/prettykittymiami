/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This project lives on a network-mounted volume where macOS writes
    // AppleDouble shadow files (._logo.jpg etc) alongside every asset. The
    // built-in image optimizer has been observed reading the wrong file on
    // this filesystem, so we bypass it and serve /public images as-is.
    unoptimized: true,
  },
};

module.exports = nextConfig;
