import {
  BookText,
  ChartArea,
  Check,
  CircleX,
  Clock,
  UserRound,
  UsersRound,
} from "lucide-react";
import "./AdminHomePage.css";
import { useNavigate } from "react-router-dom";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { useEffect, useRef, useState } from "react";
import CoursesSection from "./CoursesSection";
import Filter from "../../components/Filter/Filter";
import PurchasedCourseCard from "../../components/PurchasedCourseCard/PurchasedCourseCard";
import { useAppDispatch } from "../../contexts/AppContext";

// Simple hook to observe an element's width for responsive charts
function useElementWidth(initialWidth = 500) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initialWidth);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setWidth(Math.max(300, Math.floor(rect.width)));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export default function AdminHomePage() {
  const navigate = useNavigate();
  const { dispatch, actionTypes } = useAppDispatch();

  const handleViewDetails = (course) => {
    // Lưu lịch sử xem
    dispatch({
      type: actionTypes.ADD_TO_VIEW_HISTORY,
      payload: course.id,
    });

    // Sau đó điều hướng sang trang chi tiết
    navigate(`/course/${course.id}`);
  };
  const [lineRef, lineWidth] = useElementWidth();
  const [pieRef, pieWidth] = useElementWidth();
  const [barRef, barWidth] = useElementWidth();

  const pieChartData = [
    { id: 0, value: 372, label: "Lập trình", color: "#a855f7" },
    { id: 1, value: 247, label: "Thiết kế", color: "#3b82f6" },
    { id: 2, value: 222, label: "Marketing", color: "#ec4899" },
    { id: 3, value: 222, label: "Kinh doanh", color: "#14b8a6" },
    { id: 4, value: 171, label: "Khác", color: "#22c55e" },
  ];
  const pieChartColors = [
    "#a855f7",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
    "#22c55e",
  ];
  const totalCourses = 1234;

  // Revenue chart data
  const revenue7DaysData = [2.5, 3.2, 2.8, 3.5, 4.1, 3.9, 4.5];
  const revenueMonthlyData = [
    2.4, 3.1, 4.0, 3.7, 5.2, 6.0, 5.7, 7.1, 6.8, 8.0, 7.4, 9.1,
  ];
  const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const days7 = [1, 2, 3, 4, 5, 6, 7];

  // Chart colors
  const revenueBarColor = "#14b8a6";
  const revenueLineColor = "#2563eb";

  const [revenuePeriod, setRevenuePeriod] = useState("monthly");

  const [course, setCourse] = useState([
    {
      name: "Nguyễn Văn An",
      date: "11/9/2025",
      revenue: 299000,
      status: "done",
    },
    {
      name: "Trần Thị Bình",
      date: "10/9/2025",
      revenue: 450000,
      status: "done",
    },
    {
      name: "Lê Hoàng Cường",
      date: "9/9/2025",
      revenue: 350000,
      status: "pending",
    },
    {
      name: "Phạm Minh Đức",
      date: "8/9/2025",
      revenue: 199000,
      status: "done",
    },
  ]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1>Quản lý EduMart</h1>
          <p>
            Đây là trung tâm quản lý toàn diện, nơi bạn có thể kiểm soát người
            dùng, khóa học,...
          </p>
        </div>
      </section>

      <div className="text-chart admin-text-chart">
        <div className="text-chart-item">
          <div className="text-chart-stats">
            <div className="text-chart-text">Tổng khóa học</div>
            <div className="text-chart-number">3</div>
          </div>

          <div
            className="text-chart-icon-wrapper"
            style={{ background: "#dbeafe" }}
          >
            <BookText
              className="text-chart-icon"
              style={{ color: "#2563eb" }}
            />
          </div>
        </div>

        <div className="text-chart-item">
          <div className="text-chart-stats">
            <div className="text-chart-text">Học viên</div>
            <div className="text-chart-number">1247</div>
          </div>

          <div
            className="text-chart-icon-wrapper"
            style={{ background: "#dcfce7" }}
          >
            <UserRound
              className="text-chart-icon"
              style={{ color: "#16a34a" }}
            />
          </div>
        </div>

        <div className="text-chart-item">
          <div className="text-chart-stats">
            <div className="text-chart-text">Doanh thu</div>
            <div className="text-chart-number">{formatPrice(45200000)}</div>
          </div>

          <div
            className="text-chart-icon-wrapper"
            style={{ background: "#fef9c3" }}
          >
            <ChartArea
              className="text-chart-icon"
              style={{ color: "#ca8a04" }}
            />
          </div>
        </div>
      </div>

      <div className="chart admin-chart">
        <div className="chart-item">
          <h3>Khóa học theo doanh mục</h3>

          <div ref={pieRef} className="pie-chart-container">
            <div
              className="pie-chart-wrapper"
              style={{ width: `${pieWidth * 0.6}px` }}
            >
              <PieChart
                series={[
                  {
                    innerRadius: 70,
                    data: pieChartData.map(({ id, value, label }) => ({
                      id,
                      value,
                      label,
                    })),
                    highlightScope: {
                      fade: "global",
                      highlight: "item",
                    },
                    highlighted: {
                      innerRadius: 0,
                    },
                    faded: {
                      innerRadius: 0,
                      additionalRadius: -30,
                      color: "gray",
                    },
                  },
                ]}
                colors={pieChartColors}
                margin={{ right: 0, top: 0, bottom: 0, left: 0 }}
                slotProps={{
                  legend: {
                    hidden: true,
                  },
                }}
                sx={{
                  "& .MuiChartsLegend-root": {
                    display: "none !important",
                  },
                }}
                width={pieWidth * 0.6}
                height={300}
              />
              <div className="pie-chart-center">
                <div className="pie-chart-total-number">
                  {totalCourses.toLocaleString()}
                </div>
                <div className="pie-chart-total-label">Tổng khóa học</div>
              </div>
            </div>
            <div className="pie-chart-legend">
              {pieChartData.map((item) => {
                const percentage = ((item.value / totalCourses) * 100).toFixed(
                  1
                );
                return (
                  <div key={item.id} className="pie-chart-legend-item">
                    <div
                      className="pie-chart-legend-dot"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="pie-chart-legend-text">
                      <span className="pie-chart-legend-label">
                        {item.label}
                      </span>
                      <span className="pie-chart-legend-value">
                        {item.value} khóa • {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="chart-item">
          <h3>Thống kê người dùng</h3>

          <div className="user-statistic">
            <div className="user-statistic-image">
              <UsersRound
                style={{
                  color: "white",
                  width: "62px",
                  height: "62px",
                  textAlign: "center",
                }}
              />
            </div>

            <div
              className="text-chart-number"
              style={{
                textAlign: "center",
                fontSize: "2rem",
              }}
            >
              2845
            </div>
            <div
              className="text-chart-text"
              style={{
                textAlign: "center",
              }}
            >
              Tổng người dùng
            </div>

            <div className="user-statistic-role">
              <div className="circle" style={{ background: "#3b82f6" }} />

              <div className="user-statistic-role-text">Người mua</div>

              <div style={{ textAlign: "right" }}>
                <div
                  className="text-chart-number"
                  style={{ fontSize: "1.25rem" }}
                >
                  2456
                </div>
                <div className="text-chart-text">86.3%</div>
              </div>
            </div>
            <div className="user-statistic-role">
              <div className="circle" style={{ background: "#22c55e" }} />

              <div className="user-statistic-role-text">Người bán</div>

              <div style={{ textAlign: "right" }}>
                <div
                  className="text-chart-number"
                  style={{ fontSize: "1.25rem" }}
                >
                  389
                </div>
                <div className="text-chart-text">13.7%</div>
              </div>
            </div>
            <div className="user-statistic-role">
              <div className="circle" style={{ background: "#a855f7" }} />

              <div className="user-statistic-role-text">admin</div>

              <div style={{ textAlign: "right" }}>
                <div
                  className="text-chart-number"
                  style={{ fontSize: "1.25rem" }}
                >
                  2
                </div>
                <div className="text-chart-text">0.1%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-item">
          <div className="chart-item-header">
            <h3 style={{ marginBottom: "0" }}>
              {revenuePeriod === "7days"
                ? "Doanh thu 7 ngày qua"
                : "Doanh thu theo tháng"}
            </h3>
            <select
              className="chart-item-select"
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
            >
              <option value="7days">7 ngày qua</option>
              <option value="monthly">Theo tháng</option>
            </select>
          </div>

          {revenuePeriod === "7days" ? (
            <div ref={barRef} style={{ width: "100%" }}>
              <BarChart
                xAxis={[
                  {
                    data: days7,
                    valueFormatter: (value) => {
                      const today = new Date();
                      const date = new Date(today);
                      date.setDate(today.getDate() - (7 - value));
                      const dayName = dayNames[date.getDay()];
                      const day = date.getDate();
                      const month = date.getMonth() + 1;
                      return `${dayName}, ${day}/${month}`;
                    },
                  },
                ]}
                series={[
                  {
                    data: revenue7DaysData,
                    color: revenueBarColor,
                    label: "Doanh thu: ",
                    valueFormatter: (v) => `${v} triệu đồng`,
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: 5,
                    tickNumber: 6,
                    tickMinStep: 0.5,
                    valueFormatter: (v) => `${v} triệu`,
                  },
                ]}
                grid={{ horizontal: true }}
                width={barWidth}
                height={300}
                margin={{ left: 0 }}
              />
            </div>
          ) : (
            <div ref={lineRef} style={{ width: "100%", overflow: "hidden" }}>
              {lineWidth > 0 && (
                <LineChart
                  xAxis={[
                    {
                      data: months,
                      valueFormatter: (v) => `Tháng ${v}`,
                      tickLabelInterval: (index) => index % 2 !== 0,
                      tickLabelStyle: { fontSize: 12, fontWeight: 500 },
                      scaleType: "point",
                    },
                  ]}
                  series={[
                    {
                      data: revenueMonthlyData,
                      color: revenueLineColor,
                      label: "Doanh thu: ",
                      valueFormatter: (v) => `${v} triệu đồng`,
                      area: true,
                      areaOpacity: 0.2,
                      curve: "monotoneX",
                      showMark: true,
                      markSize: 6,
                      lineWidth: 3,
                    },
                  ]}
                  yAxis={[
                    {
                      min: 2,
                      max: 10,
                      tickNumber: 9,
                      tickMinStep: 1,
                      valueFormatter: (v) => `${v} triệu`,
                    },
                  ]}
                  grid={{ horizontal: true }}
                  width={lineWidth}
                  height={350}
                  margin={{ left: 50, right: 20, top: 20, bottom: 40 }}
                  sx={{
                    "& .MuiAreaElement-root": { fillOpacity: 0.2 },
                    "& .MuiMarkElement-root": {
                      fill: revenueLineColor,
                      stroke: "white",
                      strokeWidth: 2,
                    },
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="chart-item">
          <div className="chart-item-header">
            <h3 style={{ marginBottom: "0" }}>Giao dịch gần đây</h3>
            <button
              className="chart-item-button"
              onClick={() => navigate("/transactions")}
            >
              Xem tất cả
            </button>
          </div>

          {course.map((item) => (
            <div className="revenue-item">
              <div
                className={`revenue-item-icon-wrapper ${
                  item.status === "done"
                    ? "done-wrapper"
                    : item.status === "pending"
                    ? "pending-wrapper"
                    : "error-wrapper"
                }`}
              >
                {item.status === "done" ? (
                  <Check className="revenue-item-icon done" />
                ) : item.status === "pending" ? (
                  <Clock className="revenue-item-icon pending" />
                ) : (
                  <CircleX className="revenue-item-icon error" />
                )}
              </div>

              <div>
                <div className="text-chart-number" style={{ fontSize: "1rem" }}>
                  {item.name}
                </div>
                <div
                  className="text-chart-text"
                  style={{ fontSize: "0.75rem" }}
                >
                  {item.date}
                </div>
              </div>

              <div
                className={`revenue-item-price ${
                  item.status === "done"
                    ? "done"
                    : item.status === "pending"
                    ? "pending"
                    : "error"
                }`}
              >
                {formatPrice(item.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Filter></Filter>
      <CoursesSection
        onViewDetails={handleViewDetails}
        CardComponent={PurchasedCourseCard}
      />
    </>
  );
}
