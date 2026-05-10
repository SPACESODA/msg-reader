# Messages Reader

A simple, high-performance messages reader designed to view exported chat histories quickly and easily.

## How to Edit / Load a Message Source

To load your own messages into the viewer, you need to provide a data source file. By default, the application looks for a file named `messages.js` in the project directory.

### Data Format
Your data source must strictly follow the format shown in the provided demo files (`messages.js` or `messages.json`). Ensure your exported or manually created messages adhere to this structure so the application can parse and display them correctly.

### Try Drag & Drop !!
A easy way to view your messages locally is to simply drag and drop your `.js` or `.json` file directly anywhere into the open browser window. This bypasses all local security restrictions instantly.

### Note: Local vs. Web Server Usage
*   **Running Locally:** If you are opening the `index.html` file directly in your browser without a web server (i.e., using the `file://` protocol), **ONLY `.js` files can be used** as the data source due to browser security restrictions (CORS) that prevent loading local `.json` files via AJAX/Fetch.
*   **Running on a Web Server:** If you are viewing files here, or hosting the reader on a server, you can use either `.js` or `.json` files.
<br><br>

---
<br><br>

# Messages Reader (日本語)

エクスポートしたチャット履歴をすばやく手軽に閲覧できる、シンプルかつ高性能なメッセージリーダーです。

## メッセージソースの編集・読み込み方法

ご自身のメッセージデータをリーダーに読み込むには、データソースファイルを用意する必要があります。デフォルトでは、プロジェクトディレクトリ内の `messages.js` というファイルが読み込まれます。

### データフォーマット
データソースは、付属のデモファイル（`messages.js` または `messages.json`）のフォーマットと完全に一致している必要があります。エクスポートしたメッセージや自作のメッセージがこの構造に沿っているか確認してください。正しくフォーマットされていれば、アプリが正常にデータを解析して表示できます。

### 試してみよう：ドラッグ＆ドロップ !!
ローカル環境でメッセージを閲覧する最も簡単な方法は、開いているブラウザウィンドウのどこかに直接 `.js` または `.json` ファイルをドラッグ＆ドロップすることです。これにより、ローカルのセキュリティ制限を瞬時に回避できます。

### 注意：ローカルとWebサーバーでの実行について
*   **ローカル環境:** Webサーバーを使わずに、ブラウザで直接 `index.html` を開く場合（`file://` プロトコル）、ブラウザのセキュリティ制限（CORS）によりローカルの `.json` ファイルは読み込めません。そのため、データソースには **必ず `.js` ファイルを使用してください**。
*   **Webサーバー環境:** このリポジトリ上で直接閲覧する場合や、ご自身のサーバー上でホストする場合は、`.js` と `.json` のどちらでも使用可能です。
<br><br>

---
<br><br>

# Messages Reader (中文)

這是一款簡約且高效能的訊息閱讀器，專為快速、輕鬆地檢視匯出的聊天紀錄而設計。

## 如何編輯與載入訊息來源

若要載入您自己的訊息，您需要準備一個資料來源檔案。預設情況下，應用程式會讀取專案目錄中的 `messages.js` 檔案。

### 資料格式
資料來源必須嚴格遵守內附範例檔案（`messages.js` 或 `messages.json`）的格式。請確保您匯出或手動建立的訊息符合該結構，應用程式才能正確解析並顯示內容。

### 試試拖放載入 !!
在本地端檢視訊息最簡單的方式，就是直接將您的 `.js` 或 `.json` 檔案拖放到開啟的瀏覽器視窗中。這個方法能讓您立即繞過所有本地端的安全限制。

### 注意：本地端與網頁伺服器環境
*   **本地端執行：** 若不透過網頁伺服器，直接在瀏覽器中開啟 `index.html` 檔案（即使用 `file://` 協定），受限於瀏覽器的安全政策（CORS），無法透過 AJAX/Fetch 載入本地的 `.json` 檔案。因此，資料來源**只能使用 `.js` 檔案**。
*   **網頁伺服器執行：** 如果您直接在線上檢視檔案，或將閱讀器架設於伺服器上，則 `.js` 與 `.json` 檔案皆可使用。
