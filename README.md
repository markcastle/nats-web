# NATS Web Client

A simple web application for interacting with NATS messaging systems using the official NATS.ws client. This application allows you to:

- Connect to a NATS server using WebSocket (WSS)
- Create topics
- Publish messages to topics
- Subscribe to topics and receive messages in real-time

## Features

- **Official NATS.ws Client**: Uses the official NATS WebSocket client for reliable connections
- **Connection Management**: Connect to any NATS server that supports WebSocket connections
- **Authentication Support**: Connect using embedded credentials in the URL or a separate token
- **Topic Creation**: Create new topics on the NATS server
- **Message Publishing**: Send messages to any topic
- **Topic Subscription**: Subscribe to topics and view messages in real-time
- **Responsive Design**: Works on desktop and mobile devices

## Important: WebSocket Requirements

Since this is a browser-based application, your NATS server must be configured to support WebSocket connections:

1. **WebSocket URLs**: Always use URLs that start with `ws://` or `wss://` (secure)
2. **Server Configuration**: Your NATS server must be configured to accept WebSocket connections
3. **WebSocket Port**: The WebSocket port is often different from the standard NATS port (4222)
4. **Common Ports**: WebSocket connections typically use port 8080 (ws://) or 8443 (wss://)
5. **Authentication**: For authenticated connections, you can use:
   - Embedded credentials: `wss://username:password@nats.example.com:8443`
   - Separate token field in the connection form

## NATS Server WebSocket Configuration

To use this client, your NATS server must be configured to support WebSocket connections. Here's how to enable WebSocket support in your NATS server:

### Using NATS Server v2.2.0+

Add the following to your NATS server configuration file:

```
websocket {
  port: 8080
  no_tls: true
}

# For secure WebSocket (wss://)
websocket {
  port: 8443
  tls {
    cert_file: "/path/to/cert.pem"
    key_file: "/path/to/key.pem"
  }
}
```

### Using NATS Server with Docker

```bash
docker run -p 4222:4222 -p 8080:8080 nats:latest -js -m 8222 --websocket_port 8080
```

## Getting Started

### Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

1. Build the application:
   ```
   npm run build
   ```
2. The built files will be in the `dist` directory, ready to be deployed to any static hosting service like Cloudflare Pages.

## Deploying to Cloudflare Pages

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Log in to your Cloudflare account and go to the Pages section
3. Create a new project and connect it to your Git repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy the site

## Usage

1. **Connect to NATS**:
   - Enter the WebSocket URL of your NATS server (e.g., `wss://sandbox.nats.io:8443`)
   - For authenticated connections, you can either:
     - Use the format `wss://username:password@nats.example.com:8443`
     - Or provide a separate authentication token

2. **Create a Topic**:
   - Enter a topic name and click "Create Topic"

3. **Publish Messages**:
   - Enter a topic name
   - Type your message
   - Click "Publish Message"

4. **Subscribe to Topics**:
   - Enter a topic name
   - Click "Subscribe"
   - Messages will appear in the "Received Messages" section

## Advanced Features

The application includes several advanced features to help with troubleshooting:

1. **URL Encoding**: Special characters in credentials are automatically URL-encoded
2. **Direct WebSocket Testing**: Test basic WebSocket connectivity separate from the NATS protocol
3. **Advanced Options**: Toggle additional connection options and debugging tools
4. **Server Configuration Examples**: View examples of how to configure your NATS server for WebSocket support

## Troubleshooting Connection Issues

If you encounter connection issues:

### Connection Refused

**Solutions:**
- Ensure your NATS server is running and accessible
- Verify the server URL and port are correct
- Check if your server has WebSocket support enabled
- Check for firewall or network restrictions

### Authentication Errors

**Solutions:**
- Verify your credentials or token are correct
- Special characters in credentials should be URL-encoded (the app does this automatically)
- Check your NATS server's authentication configuration

### SSL/TLS Errors

**Solutions:**
- For `wss://` connections, ensure your server has a valid SSL certificate
- If using a self-signed certificate, your browser may block the connection
- Try using `ws://` for local testing (not secure for production)

## About the NATS.ws Client

This application uses the official [NATS.ws client](https://github.com/nats-io/nats.ws#readme) for browser-based WebSocket connections to NATS servers. The NATS.ws client is maintained by the NATS team and provides reliable WebSocket connectivity.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- NATS.ws (Official NATS WebSocket client)
- Vite

## License

MIT
