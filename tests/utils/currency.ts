/**
 * Chuyển đổi chuỗi tiền tệ (VD: "1.000.000 ₫") thành số (1000000)
 */
export function parseCurrency(priceString: string): number {
    if (!priceString) return 0;
    // Xóa dấu chấm, ký tự ₫, khoảng trắng không ngắt ( non-breaking space) và khoảng trắng thường
    const cleanString = priceString.replace(/\./g, '').replace(/[₫\s\u00A0]/g, '');
    console.log(`Parsed currency string "${priceString}" to number: ${cleanString}`);
    return parseInt(cleanString, 10);
}