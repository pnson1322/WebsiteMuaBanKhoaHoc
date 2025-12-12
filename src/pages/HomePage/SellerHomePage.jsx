import { BookText, ChartArea, Star, UserRound, FolderTree } from "lucide-react";
import "./SellerHomePage.css";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import SellerStatsHeader from "../../components/Seller/SellerStatsHeader";
import SellerStatsSummary from "../../components/Seller/SellerStatsSummary";
import { dashboardAPI } from "../../services/dashboardAPI";
import { courseAPI } from "../../services/courseAPI";

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

const EmptyState = ({ message, height = 300 }) => (
  <div
    style={{
      height: height,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      border: "1px dashed #cbd5e1",
      color: "#64748b",
      width: "100%",
    }}
  >
    <FolderTree size={48} style={{ opacity: 0.5, marginBottom: "1rem" }} />
    <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
  </div>
);

const SellerHomePage = () => {
  const { showError } = useToast();

  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rating, setRating] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [dataLineChart, setDataLineChart] = useState([]);
  const [dataPieChart, setDataPieChart] = useState([]);
  const [dataBarChart, setDataBarChart] = useState([]);
  const [topCourses, setTopCourses] = useState([]);

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
          sellerStats,
          revenue,
          monthlyRevenue,
          monthlyBuyer,
          topCourseAPI,
        ] = await Promise.all([
          dashboardAPI.getCourseStatsByCategory(),
          dashboardAPI.getSellerStats(),
          dashboardAPI.getSellerTotalRevenue(),
          dashboardAPI.getSellerRevenue(),
          dashboardAPI.getMonthlyBuyerStats(),
          courseAPI.getTopCourse(1, 4),
        ]);

        const safeCategoryStats = Array.isArray(categoryStats)
          ? categoryStats
          : [];
        const total = safeCategoryStats.reduce(
          (sum, category) => sum + category.courseCount,
          0
        );
        setTotalCourses(total);

        setTotalStudents(sellerStats?.totalStudents || 0);
        setRating(sellerStats?.averageRating || 0);
        setTotalRevenue(revenue?.totalRevenue || 0);
        setDataLineChart(
          (Array.isArray(monthlyRevenue) ? monthlyRevenue : []).map((i) => ({
            date: `${i.year}-${i.month}`,
            revenue: i.totalRevenue,
          }))
        );
        setDataPieChart(
          safeCategoryStats.map((item) => ({
            id: item.categoryId || Math.random(),
            value: item.courseCount,
            label: item.categoryName,
          }))
        );
        setDataBarChart(Array.isArray(monthlyBuyer) ? monthlyBuyer : []);
        setTopCourses(
          topCourseAPI?.items && Array.isArray(topCourseAPI.items)
            ? topCourseAPI.items
            : []
        );
      } catch (err) {
        showError("Seller dashboard error:" + err);
      }
    };

    fetchData();
  }, []);

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
            {dataLineChart.some((i) => i.revenue >= 0) ? (
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
                  { valueFormatter: (v) => `${v / 1000000} triệu`, min: 0 },
                ]}
                grid={{ horizontal: true }}
                width={lineWidth}
                height={300}
                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                sx={{ "& .MuiAreaElement-root": { fillOpacity: 0.15 } }}
              />
            ) : (
              <EmptyState message="Chưa có dữ liệu doanh thu" />
            )}
          </div>
        </div>

        <div className="chart-item">
          <h3>Phân bố khóa học theo doanh mục</h3>

          <div ref={pieRef} style={{ width: "100%" }}>
            {totalCourses > 0 ? (
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
                margin={{ right: 0 }}
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
            ) : (
              <EmptyState message="Chưa có khóa học nào" />
            )}
          </div>
        </div>

        <div className="chart-item">
          <h3>Xu hướng đăng kí theo học viên</h3>
          <div ref={barRef} style={{ width: "100%" }}>
            {dataBarChart.length > 0 ? (
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
            ) : (
              <EmptyState message="Chưa có dữ liệu học viên" />
            )}
          </div>
        </div>

        <div className="chart-item">
          <h3>Top khóa học bán chạy</h3>
          <div className="top-courses">
            {topCourses.length > 0 ? (
              topCourses.map((item, index) => (
                <div className="top-courses-item" key={item.id || index}>
                  <div className={`top-courses-index index-${index + 1}`}>
                    {index + 1}
                  </div>
                  <div className="top-courses-main">
                    <div className="top-courses-name">{item.title}</div>
                    <div className="top-courses-students">
                      {item.totalPurchased} học viên
                    </div>
                  </div>
                  <div className="top-courses-revenue">
                    {formatPrice(item.price)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                message="Chưa có khóa học nào được bán"
                height={200}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerHomePage;
