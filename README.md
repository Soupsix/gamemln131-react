# MLN131 - Trò Chơi Xếp Chữ Triết Học (React Version)

Dự án clone nguyên bản trò chơi xếp chữ Triết học Mác - Lênin từ [gamemln131.netlify.app](https://gamemln131.netlify.app) bằng **React + Vite + Javascript**.

## ✨ Tính năng

- **Giao diện hiện đại**: Tone màu Black & Neon Orange rực rỡ, hiệu ứng Ambient Glow, lưới background, font chữ Be Vietnam Pro & Outfit.
- **10 Câu hỏi Triết học MLN131**:
  - Grid menu 10 câu hỏi với trạng thái "CHƯA MỞ" hoặc "ĐÃ HOÀN THÀNH".
  - Khi đã hoàn thành câu nào, câu đó sẽ bị khóa không cho bấm lại (đúng theo logic website gốc).
- **Màn hình chi tiết câu hỏi**:
  - Thẻ chữ cái xáo trộn (Scrambled letters) hiển thị dạng khối gạch cam phát sáng 3D.
  - Ô đáp án (Answer slots) hiển thị dấu `?` và lật mở sang thẻ xanh ngọc khi bấm hiển thị kết quả.
  - Banner giải thích triết học chi tiết sau khi mở đáp án.
  - Điều hướng: "Quay lại Menu", "Câu tiếp theo" tự động tìm câu chưa làm.
- **Hệ thống âm thanh Web Audio API Synthesizer**: Không cần tải file MP3 bên ngoài, tự sinh âm thanh chọn ô, quay lại, xáo trộn, đúng, sai, fanfare chúc mừng.
- **Hiệu ứng pháo hoa Confetti**: Tự vẽ bằng HTML5 Canvas mượt mà khi trả lời đúng và khi hoàn thành toàn bộ 10 câu.
- **Hộp thoại chiến thắng (Victory Modal)**: Hiện lên với cúp vàng và pháo hoa khi hoàn thành cả 10 câu.
- **Phím tắt**:
  - `Space` hoặc `Enter`: Hiển thị kết quả
  - `Escape`: Quay về menu

## 🚀 Hướng dẫn khởi chạy

```bash
# 1. Chuyển vào thư mục dự án
cd gamemln131-react

# 2. Cài đặt thư viện (nếu chưa cài)
npm install

# 3. Khởi chạy môi trường phát triển (Dev Server)
npm run dev
```

Server sẽ chạy tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

Để build bản chạy production:
```bash
npm run build
npm run preview
```

