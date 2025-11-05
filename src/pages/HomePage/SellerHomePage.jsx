import { BookText, ChartArea, Star, UserRound } from "lucide-react";
import "./SellerHomePage.css";
import { useEffect, useRef, useState } from "react";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";

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

const SellerHomePage = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: "React Cơ Bản", students: 120, revenue: 3000000 },
    { id: 2, name: "Java Nâng Cao", students: 200, revenue: 5000000 },
    { id: 3, name: "Python AI", students: 180, revenue: 4000000 },
    { id: 4, name: "Kotlin Android", students: 90, revenue: 2500000 },
  ]);

  const topCourses = [...courses]
    .sort((a, b) => b.students - a.students)
    .slice(0, 3);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const [lineRef, lineWidth] = useElementWidth();
  const [pieRef, pieWidth] = useElementWidth();
  const [barRef, barWidth] = useElementWidth();

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1>📊 Thống kê</h1>
          <p>Thống kê thông tin giao dịch khóa học của bạn</p>
        </div>
      </section>

      <div className="text-chart">
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

        <div className="text-chart-item">
          <div className="text-chart-stats">
            <div className="text-chart-text">Đánh giá trung bình</div>
            <div className="text-chart-number">4.8</div>
          </div>

          <div
            className="text-chart-icon-wrapper"
            style={{ background: "#f3e8ff" }}
          >
            <Star className="text-chart-icon" style={{ color: "#9333ea" }} />
          </div>
        </div>
      </div>

      <div className="chart">
        <div className="chart-item">
          <h3>Doanh thu theo tháng</h3>

          <div ref={lineRef} style={{ width: "100%" }}>
          <LineChart
            xAxis={[
              {
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                valueFormatter: (value) => `Tháng ${value}`,
              },
            ]}
            series={[
              {
                data: [
                  2.4, 3.1, 4.0, 3.7, 5.2, 6.0, 5.7, 7.1, 6.8, 8.0, 7.4, 9.1,
                ],
                color: "#2563eb",
                label: "Doanh thu: ",
                valueFormatter: (v) => `${v} triệu đồng`,
                area: true,
                areaOpacity: 0.15,
                curve: "monotoneX",
                showMark: true,
                markSize: 4,
                lineWidth: 3,
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: 10,
                tickNumber: 11,
                tickMinStep: 1,
                valueFormatter: (v) => `${v} triệu`,
              },
            ]}
            grid={{ horizontal: true }}
            width={lineWidth}
            height={300}
            margin={{ left: 0 }}
            sx={{
              "& .MuiAreaElement-root": { fillOpacity: 0.15 },
            }}
          />
          </div>
        </div>

        <div className="chart-item">
          <h3>Phân bố khóa học theo doanh mục</h3>

          <div ref={pieRef} style={{ width: "100%" }}>
          <PieChart
            series={[
              {
                innerRadius: 70,
                data: [
                  { id: 0, value: 10, label: "Lập trình" },
                  { id: 1, value: 15, label: "Thiết kế" },
                  { id: 2, value: 20, label: "Marketing" },
                  { id: 3, value: 25, label: "Kinh doanh" },
                ],
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
            margin={{ right: 5 }}
            slotProps={{
              legend: {
                direction: "column",
                position: { vertical: "middle", horizontal: "right" },
                itemMarkWidth: 12,
                itemMarkHeight: 12,
                itemGap: 12,
                labelStyle: { fontSize: 14 },
              },
            }}
            sx={{
              "& .MuiChartsLegend-root": { paddingLeft: 8 },
              "& .MuiChartsLegend-series": { alignItems: "center" },
            }}
            width={pieWidth}
            height={300}
          />
          </div>
        </div>

        <div className="chart-item">
          <h3>Xu hướng đăng kí theo học viên</h3>

          <div ref={barRef} style={{ width: "100%" }}>
          <BarChart
            xAxis={[
              {
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                valueFormatter: (value) => `Tháng ${value}`,
              },
            ]}
            series={[
              {
                data: [44, 62, 78, 55, 89, 102, 95, 117, 134, 155, 142, 175],
                color: "#14b8a6",
                label: "Số học viên: ",
              },
            ]}
            yAxis={[
              {
                max: 200,
              },
            ]}
            grid={{ horizontal: true }}
            width={barWidth}
            height={300}
            margin={{ left: 0 }}
          />
          </div>
        </div>

        <div className="chart-item">
          <h3>Top khóa học bán chạy</h3>

          <div className="top-courses">
            {topCourses.map((item, index) => (
              <div className="top-courses-item">
                <div className={`top-courses-index index-${index + 1}`}>
                  {index + 1}
                </div>

                <div className="top-courses-main">
                  <div className="top-courses-name">{item.name}</div>
                  <div className="top-courses-students">
                    {item.students + " "} học viên
                  </div>
                </div>

                <div className="top-courses-revenue">
                  {formatPrice(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerHomePage;
