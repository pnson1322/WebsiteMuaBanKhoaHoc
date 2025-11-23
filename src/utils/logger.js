// 📝 Logger Utility for Debugging Auth Flow
// Created: 23/11/2025
// Purpose: Centralized logging system với color coding và filtering

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

class Logger {
  constructor() {
    this.isProduction = import.meta.env.MODE === "production";
    this.minLevel = this.isProduction ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
    this.logs = [];
    this.maxLogs = 500; // Giữ tối đa 500 logs trong memory
  }

  // 🎨 Color codes cho console
  colors = {
    DEBUG: "color: #888; font-weight: normal;",
    INFO: "color: #00BFFF; font-weight: bold;",
    WARN: "color: #FFA500; font-weight: bold;",
    ERROR: "color: #FF4444; font-weight: bold;",
    CRITICAL:
      "color: #fff; background: #FF0000; font-weight: bold; padding: 2px 6px;",
  };

  // 📊 Lưu log vào memory
  saveLog(level, category, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      url: window.location.href,
    };

    this.logs.push(logEntry);

    // Giới hạn số lượng logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Lưu vào localStorage (chỉ lưu 100 logs gần nhất)
    try {
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem("debug_logs", JSON.stringify(recentLogs));
    } catch (e) {
      console.warn("Cannot save logs to localStorage:", e);
    }
  }

  // 🔍 Log với level DEBUG
  debug(category, message, data = null) {
    if (LOG_LEVELS.DEBUG < this.minLevel) return;

    console.log(
      `%c[DEBUG] [${category}] ${message}`,
      this.colors.DEBUG,
      data || ""
    );

    this.saveLog("DEBUG", category, message, data);
  }

  // ℹ️ Log với level INFO
  info(category, message, data = null) {
    if (LOG_LEVELS.INFO < this.minLevel) return;

    console.log(
      `%c[INFO] [${category}] ${message}`,
      this.colors.INFO,
      data || ""
    );

    this.saveLog("INFO", category, message, data);
  }

  // ⚠️ Log với level WARN
  warn(category, message, data = null) {
    if (LOG_LEVELS.WARN < this.minLevel) return;

    console.warn(
      `%c[WARN] [${category}] ${message}`,
      this.colors.WARN,
      data || ""
    );

    this.saveLog("WARN", category, message, data);
  }

  // ❌ Log với level ERROR
  error(category, message, data = null) {
    if (LOG_LEVELS.ERROR < this.minLevel) return;

    console.error(
      `%c[ERROR] [${category}] ${message}`,
      this.colors.ERROR,
      data || ""
    );

    this.saveLog("ERROR", category, message, data);
  }

  // 🚨 Log với level CRITICAL
  critical(category, message, data = null) {
    console.error(
      `%c[CRITICAL] [${category}] ${message}`,
      this.colors.CRITICAL,
      data || ""
    );

    this.saveLog("CRITICAL", category, message, data);

    // 🔧 Tắt alert popup vì gây phiền toái khi debug
    // Alert cho critical errors trong development
    // if (!this.isProduction) {
    //   alert(`CRITICAL ERROR [${category}]: ${message}`);
    // }
  }

  // 📥 Export logs ra file
  exportLogs() {
    const logsText = this.logs
      .map((log) => {
        return `[${log.timestamp}] [${log.level}] [${log.category}] ${
          log.message
        }\nData: ${JSON.stringify(log.data, null, 2)}\nURL: ${
          log.url
        }\n${"=".repeat(80)}`;
      })
      .join("\n\n");

    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("📥 Logs exported successfully!");
  }

  // 🗑️ Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem("debug_logs");
    console.log("🗑️ All logs cleared!");
  }

  // 📊 Get logs by category
  getLogsByCategory(category) {
    return this.logs.filter((log) => log.category === category);
  }

  // 📊 Get logs by level
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level);
  }

  // 📊 Get recent logs
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  // 🔍 Search logs
  searchLogs(query) {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(
      (log) =>
        log.message.toLowerCase().includes(lowerQuery) ||
        log.category.toLowerCase().includes(lowerQuery) ||
        JSON.stringify(log.data).toLowerCase().includes(lowerQuery)
    );
  }

  // 📊 Print log statistics
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byCategory: {},
    };

    this.logs.forEach((log) => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by category
      stats.byCategory[log.category] =
        (stats.byCategory[log.category] || 0) + 1;
    });

    console.table(stats.byLevel);
    console.table(stats.byCategory);

    return stats;
  }
}

// 🌍 Export singleton instance
const logger = new Logger();

// 🔧 Make logger available in console for debugging
if (typeof window !== "undefined") {
  window.__logger = logger;
  console.log(
    "%c🔍 Logger initialized! Use window.__logger to access logging functions.",
    "color: #00FF00; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%cAvailable commands:\n" +
      "  __logger.exportLogs() - Export logs to file\n" +
      "  __logger.clearLogs() - Clear all logs\n" +
      "  __logger.getStats() - View statistics\n" +
      "  __logger.searchLogs('keyword') - Search logs\n" +
      "  __logger.getRecentLogs(50) - Get recent logs",
    "color: #888;"
  );
}

export default logger;
