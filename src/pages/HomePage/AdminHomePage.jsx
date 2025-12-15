import {
  BookText,
  ChartArea,
  Check,
  CircleX,
  Clock,
  UserRound,
  UsersRound,
  GraduationCap,
  Receipt,
  FolderTree,
  Users,
} from "lucide-react";
import "./AdminHomePage.css";
import { useNavigate } from "react-router-dom";
import { BarChart, LineChart, PieChart } from "@mui/x-charts";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { dashboardAPI } from "../../services/dashboardAPI";
import CoursesSection from "./CoursesSection";
import Filter from "../../components/Filter/Filter";
import PurchasedCourseCard from "../../components/PurchasedCourseCard/PurchasedCourseCard";
import { useAppDispatch } from "../../contexts/AppContext";
import AdminManagementCard from "../../components/AdminManagementCard/AdminManagementCard";

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
  const { showSuccess, showError } = useToast();

  const handleViewDetails = (course) => {
    // Lưu lịch sử xem
    dispatch({
      type: actionTypes.ADD_TO_VIEW_HISTORY,
      payload: course.id,
    });

    // Sau đó điều hướng sang trang chi tiết
    navigate(`/course/${course.id}`);
  };

  const [revenueChartRef, revenueChartWidth] = useElementWidth();
  const [pieRef, pieWidth] = useElementWidth();

  const [totalCourses, setTotalCourses] = useState(0);
  const [newUser, setNewUser] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [totalUser, setTotalUser] = useState(0);
  const [userRole, setUserRole] = useState([]);
  const [transaction, setTransaction] = useState([]);

  const buyerCount = userRole[0]?.count || 0;
  const sellerCount = userRole[2]?.count || 0;
  const adminCount = userRole[1]?.count || 0;

  const [dataPieChart, setDataPieChart] = useState([]);
  const [dataLineChart, setDataLineChart] = useState([]);
  const [dataBarChart, setDataBarChart] = useState([]);

  const pieChartColors = [
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

  // Chart colors
  const revenueBarColor = "#14b8a6";
  const revenueLineColor = "#2563eb";

  const [revenuePeriod, setRevenuePeriod] = useState("monthly");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          totalCoursesAPI,
          userStats,
          revenue,
          userRoleAPI,
          recentTransaction,
          monthlyRevenue,
          days7Revenue,
        ] = await Promise.all([
          dashboardAPI.getCourseCategoryStats(),
          dashboardAPI.getUserStats(),
          dashboardAPI.getGlobalTotalRevenue(),
          dashboardAPI.getRoleCountStats(),
          dashboardAPI.getRecentTransactions(),
          dashboardAPI.getGlobalRevenueLast12Months(),
          dashboardAPI.getCourse7daysRevenue(),
        ]);

        const total = totalCoursesAPI.reduce((sum, category) => {
          return sum + category.courseCount;
        }, 0);

        setTotalCourses(total);
        setNewUser(userStats.newUsersToday);
        setTotalRevenue(revenue.totalRevenue);

        setUserRole(userRoleAPI);
        setTotalUser(userStats.totalUsers);
        setTransaction(
          recentTransaction
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4)
            .map((item) => {
              const d = new Date(item.createdAt);
              const dateStr = d.toLocaleDateString("vi-VN");

              return {
                id: item.id,
                revenue: item.totalAmount,
                name: item.buyerName,
                date: dateStr,
              };
            })
        );

        setDataPieChart(
          totalCoursesAPI.map((item, index) => {
            return {
              id: item.categoryId,
              value: item.courseCount,
              label: item.categoryName,
              color: pieChartColors[index % pieChartColors.length],
            };
          })
        );
        setDataLineChart(
          monthlyRevenue.map((i) => ({
            date: i.year + "-" + i.month,
            revenue: i.totalRevenue,
          }))
        );
        setDataBarChart(
          (Array.isArray(days7Revenue) ? days7Revenue : []).map((item) => ({
            date: new Date(item.date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            }),
            revenue: item.revenue || 0,
          }))
        );

        console.log(days7Revenue);
        console.log(dataBarChart);
      } catch (err) {
        showError("Lỗi: " + err);
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

  const managementCards = [
    {
      icon: <GraduationCap size={32} />,
      title: "📚 Quản lý khóa học",
      description: "Duyệt và quản lý tất cả khóa học trên nền tảng của bạn",
      route: "/admin-courses",
      color: { main: "#2563eb", light: "#dbeafe" },
    },
    {
      icon: <Receipt size={32} />,
      title: "📚 Quản lý giao dịch",
      description:
        "Theo dõi và xem chi tiết tất cả các giao dịch trên hệ thống",
      route: "/transactions",
      color: { main: "#16a34a", light: "#dcfce7" },
    },
    {
      icon: <FolderTree size={32} />,
      title: "📚 Quản lý danh mục",
      description: "Thêm, chỉnh sửa và xóa các danh mục khóa học",
      route: "/admin-categories",
      color: { main: "#ca8a04", light: "#fef9c3" },
    },
    {
      icon: <Users size={32} />,
      title: "Quản lý Người dùng",
      description: "Quản lý tất cả người dùng trong hệ thống",
      route: "/admin-users",
      color: { main: "#7258b5", light: "#ede9fe" },
    },
  ];

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
      }}
    >
      <FolderTree size={48} style={{ opacity: 0.5, marginBottom: "1rem" }} />
      <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
    </div>
  );

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

      <div className="admin-management-grid">
        {managementCards.map((card, index) => (
          <AdminManagementCard key={index} {...card} />
        ))}
      </div>

      <div className="text-chart admin-text-chart">
        <div className="text-chart-item">
          <div className="text-chart-stats">
            <div className="text-chart-text">Tổng khóa học</div>
            <div className="text-chart-number">{totalCourses}</div>
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
            <div className="text-chart-text">Người dùng mới hôm nay</div>
            <div className="text-chart-number">{newUser}</div>
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
            <div className="text-chart-number">{formatPrice(totalRevenue)}</div>
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
            {totalCourses > 0 ? (
              <div
                className="pie-chart-wrapper"
                style={{ width: `${pieWidth * 0.6}px` }}
              >
                <PieChart
                  series={[
                    {
                      innerRadius: 70,
                      data: dataPieChart.map(({ id, value, label }) => ({
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
            ) : (
              <div style={{ width: "100%" }}>
                <EmptyState message="Chưa có khóa học nào" />
              </div>
            )}
            <div className="pie-chart-legend">
              {dataPieChart.length > 0 ? (
                dataPieChart.map((item) => {
                  const percentage =
                    totalCourses > 0
                      ? ((item.value / totalCourses) * 100).toFixed(1)
                      : "0.0";

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
                })
              ) : (
                <p
                  style={{
                    color: "#999",
                    fontSize: "0.9rem",
                    fontStyle: "italic",
                  }}
                >
                  Chưa có danh mục
                </p>
              )}
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
              {totalUser}
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
                  {buyerCount}
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
                  {sellerCount}
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
                  {adminCount}
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

          <div
            ref={revenueChartRef}
            style={{ width: "100%", overflow: "hidden" }}
          >
            {console.log(dataBarChart)}
            {(revenuePeriod === "7days" ? dataBarChart : dataLineChart).some(
              (i) => i.revenue > 0
            ) ? (
              revenuePeriod === "7days" ? (
                <BarChart
                  xAxis={[
                    {
                      data: dataBarChart.map((i) => i.date),
                      scaleType: "band",
                    },
                  ]}
                  series={[
                    {
                      data: dataBarChart.map((i) => i.revenue || 0),
                      color: revenueBarColor,
                      label: "Doanh thu: ",
                      valueFormatter: (v) => `${v?.toLocaleString("vi-VN")} đ`,
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      valueFormatter: (v) => `${v / 1000000} tr`,
                    },
                  ]}
                  grid={{ horizontal: true }}
                  width={revenueChartWidth}
                  height={300}
                  margin={{ left: 45, right: 10, top: 10, bottom: 30 }}
                />
              ) : (
                <LineChart
                  xAxis={[
                    {
                      data: dataLineChart.map((i) => i.date),
                      tickLabelInterval: (index) => index % 2 !== 0,
                      tickLabelStyle: { fontSize: 12, fontWeight: 500 },
                      scaleType: "point",
                    },
                  ]}
                  series={[
                    {
                      data: dataLineChart.map((i) => i.revenue),
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
                      valueFormatter: (v) => `${v / 1000000} triệu`,
                      min: 0,
                    },
                  ]}
                  grid={{ horizontal: true }}
                  width={revenueChartWidth}
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
              )
            ) : (
              <EmptyState message="Chưa có dữ liệu doanh thu" />
            )}
          </div>
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

          {transaction && transaction.length > 0 ? (
            transaction.map((item) => (
              <div className="revenue-item">
                <div className="revenue-item-icon-wrapper done-wrapper">
                  <Check className="revenue-item-icon done" />
                </div>

                <div>
                  <div
                    className="text-chart-number"
                    style={{ fontSize: "1rem" }}
                  >
                    {item.name}
                  </div>
                  <div
                    className="text-chart-text"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {item.date}
                  </div>
                </div>

                <div className="revenue-item-price done">
                  {formatPrice(item.revenue)}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#94a3b8",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Receipt size={40} style={{ opacity: 0.5 }} />
              <span>Chưa có giao dịch nào phát sinh</span>
            </div>
          )}
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
