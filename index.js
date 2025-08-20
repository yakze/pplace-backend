import express from "express";
// ====== HTTP API ======
app.get("/meta", (req, res) => {
res.json({ width: WIDTH, height: HEIGHT, palette: PALETTE });
});

// ArrayBuffer で全体ダンプを返す
app.get("/dump", (req, res) => {
const buf = storage.dump();
res.set("Content-Type", "application/octet-stream");
res.set("Content-Length", String(buf.length));
res.end(Buffer.from(buf));
});

app.post("/admin/clear", async (req, res) => {
await storage.clear();
io.emit("clear");
res.json({ ok: true });
});

// ヘルスチェック
app.get("/health", (req, res) => res.send("ok"));

// ====== Socket.IO ======
io.on("connection", (socket) => {
// クライアントから: { x, y, c } c=palette index
socket.on("place", async ({ x, y, c }) => {
if (
typeof x !== "number" || typeof y !== "number" || typeof c !== "number" ||
x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT ||
c < 0 || c >= PALETTE.length
) {
return; // 不正は無視
}
await storage.set(x, y, c);
io.emit("u", { x, y, c }); // 全員へ更新をブロードキャスト
});
});

httpServer.listen(PORT, () => {
console.log(`Server listening on :${PORT} size=${WIDTH}x${HEIGHT} redis=${USE_REDIS}`);
});
