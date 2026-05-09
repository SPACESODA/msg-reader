# Messages Reader

A simple, high-performance messages reader designed to view exported chat histories quickly and easily.

## How to Edit / Load a Message Source

To load your own messages into the viewer, you need to provide a data source file. By default, the application looks for a file named `messages.js` in the project directory.

### Data Format
Your data source must strictly follow the format shown in the provided demo files (`messages.js` or `messages.json`). Ensure your exported or manually created messages adhere to this structure so the application can parse and display them correctly.

### Local vs. Web Server Usage
*   **Running Locally:** If you are opening the `index.html` file directly in your browser without a web server (i.e., using the `file://` protocol), **ONLY `.js` files can be used** as the data source due to browser security restrictions (CORS) that prevent loading local `.json` files via AJAX/Fetch.
*   **Running on a Web Server:** If you are viewing files here, or hosting the reader on a server, you can use either `.js` or `.json` files.
