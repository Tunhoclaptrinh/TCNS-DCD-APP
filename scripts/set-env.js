/**
 * set-env.js
 * Tự động phát hiện IP LAN của máy tính và ghi vào file .env
 * Chạy script này trước khi khởi động app: npm run start
 */

const os = require("os");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ENV_FILE = path.resolve(__dirname, "../.env");

/**
 * Lấy địa chỉ IPv4 LAN (ưu tiên 192.168.x.x, 10.x.x.x, 172.x.x.x)
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Bỏ qua loopback và IPv6
      if (iface.family !== "IPv4" || iface.internal) continue;

      const ip = iface.address;
      // Ưu tiên các dải mạng nội bộ phổ biến
      if (ip.startsWith("192.168.")) candidates.unshift(ip); // ưu tiên cao nhất
      else if (ip.startsWith("10.")) candidates.push(ip);
      else if (ip.startsWith("172.")) candidates.push(ip);
    }
  }

  return candidates[0] || null;
}

const ip = getLocalIp();

if (!ip) {
  console.warn(
    "⚠️  Không tìm thấy IP LAN. Giữ nguyên .env hoặc kiểm tra kết nối mạng."
  );
  process.exit(0);
}

const apiUrl = `http://${ip}:${PORT}/api`;
const envContent = `# Tự động tạo bởi scripts/set-env.js — KHÔNG COMMIT FILE NÀY
EXPO_PUBLIC_API_URL=${apiUrl}
`;

fs.writeFileSync(ENV_FILE, envContent, "utf-8");

console.log(`✅ .env đã được cập nhật:`);
console.log(`   EXPO_PUBLIC_API_URL=${apiUrl}`);
