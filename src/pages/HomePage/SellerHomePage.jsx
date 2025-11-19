import { BookText, ChartArea, Star, UserRound } from "lucide-react";
import "./SellerHomePage.css";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import SellerStatsSummary from "../../components/Seller/SellerStatsSummary";
import { dashboardAPI } from "../../services/dashboardAPI";

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
  const { showSuccess, showError } = useToast();

  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rating, setRating] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [dataLineChart, setDataLineChart] = useState([]);
  const [dataPieChart, setDataPieChart] = useState([]);
  const [dataBarChart, setDataBarChart] = useState([]);

  const COLORS = [
    "#4254fb",
    "#fa4f58",
    "#4CAF50",
    "#0dbeff",
    "#FFD100",
    "#00ACC1",
    "#D81B60",
    "#3F51B5",
    "#E53935",
    "#6D4C41",
    "#29B6F6",
    "#ffb452",
    "#757575",
    "#5C6BC0",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          categoryStats,
          totalStudentsnRating,
          revenue,
          monthlyRevenue,
          montlyBuyer,
        ] = await Promise.all([
          dashboardAPI.getCourseStatsByCategory(),
          dashboardAPI.getSellerStats(),
          dashboardAPI.getSellerTotalRevenue(),
          dashboardAPI.getSellerRevenue(),
          dashboardAPI.getMonthlyBuyerStats(),
        ]);

        const total = categoryStats.reduce((sum, category) => {
          return sum + category.courseCount;
        }, 0);

        setTotalCourses(total);
        setTotalStudents(totalStudentsnRating.totalStudents);
        setRating(totalStudentsnRating.averageRating);
        setTotalRevenue(revenue.totalRevenue);

        setDataLineChart(
          monthlyRevenue.map((i) => ({
            date: i.year + "-" + i.month,
            revenue: i.totalRevenue,
          }))
        );
        setDataPieChart(
          categoryStats.map((item) => {
            return {
              id: item.categoryId,
              value: item.courseCount,
              label: item.categoryName,
            };
          })
        );
        setDataBarChart(montlyBuyer);
      } catch (err) {
        showError("Lỗi: " + err);
      }
    };

    fetchData();
  }, []);

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
      <SellerStatsHeader
        title="📊 Thống kê"
        subtitle="Thống kê thông tin giao dịch khóa học của bạn"
      />

      <SellerStatsSummary
        totalCourses={totalCourses}
        totalStudents={totalStudents}
        totalRevenue={totalRevenue}
        averageRating={rating}
      />

      <div className="chart">
        <div className="chart-item">
          <h3>Doanh thu theo tháng</h3>

          <div ref={lineRef} style={{ width: "100%" }}>
            <LineChart
              xAxis={[
                {
                  data: dataLineChart.map((i) => i.date),
                  scaleType: "point",
                },
              ]}
              series={[
                {
                  data: dataLineChart.map((i) => i.revenue),
                  color: "#2563eb",
                  label: "Doanh thu: ",
                  valueFormatter: (v) => `${v.toLocaleString("vi-VN")} VNĐ`,
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
                  valueFormatter: (v) => `${v / 1000000} triệu`,
                  min: 0,
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
                  data: dataPieChart,
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
              colors={COLORS}
            />
          </div>
        </div>

        <div className="chart-item">
          <h3>Xu hướng đăng kí theo học viên</h3>

          <div ref={barRef} style={{ width: "100%" }}>
            <BarChart
              xAxis={[
                {
                  data: dataBarChart.map((i) => i.month),
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  data: dataBarChart.map((i) => i.buyerCount),
                  color: "#14b8a6",
                  label: "Số học viên: ",
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
