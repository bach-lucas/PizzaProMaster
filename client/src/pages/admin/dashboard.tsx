import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Users,
  Link,
  BarChart3 
} from "lucide-react";
import { Order } from "@shared/schema";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatsCard({ title, value, description, icon, colorClass }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
            <p className="text-green-500 text-sm mt-2">{description}</p>
          </div>
          <div className={`${colorClass} bg-opacity-10 p-3 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // Fetch admin stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  const orderColumns = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (row: Order) => <span className="font-medium">#{row.id}</span>,
    },
    {
      header: "Customer",
      accessorKey: (row: Order) => row.userId ? `User #${row.userId}` : "Guest",
    },
    {
      header: "Items",
      accessorKey: (row: Order) => {
        const items = row.items as any[];
        return items.map(item => `${item.quantity}x ${item.name}`).join(", ");
      },
    },
    {
      header: "Total",
      accessorKey: (row: Order) => formatCurrency(row.total),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Order) => {
        let statusClasses = "";
        
        switch (row.status) {
          case "pending":
            statusClasses = "bg-yellow-100 text-yellow-800";
            break;
          case "preparing":
            statusClasses = "bg-blue-100 text-blue-800";
            break;
          case "in_transit":
            statusClasses = "bg-indigo-100 text-indigo-800";
            break;
          case "delivered":
            statusClasses = "bg-green-100 text-green-800";
            break;
          case "cancelled":
            statusClasses = "bg-red-100 text-red-800";
            break;
          default:
            statusClasses = "bg-gray-100 text-gray-800";
        }
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1).replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: "Time",
      accessorKey: (row: Order) => {
        const date = new Date(row.createdAt);
        return date.toLocaleString();
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: Order) => (
        <a href={`/admin/orders?id=${row.id}`} className="text-primary hover:text-red-700">
          View
        </a>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-gray-600">Overview of your restaurant's performance</p>
        </div>

        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array(4).fill(0).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="animate-pulse flex justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-7 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Orders"
              value={stats.totalOrders}
              description="12% from last week"
              icon={<ShoppingBag className="text-primary text-xl" />}
              colorClass="bg-primary"
            />
            
            <StatsCard
              title="Revenue"
              value={formatCurrency(stats.totalRevenue)}
              description="8% from last week"
              icon={<DollarSign className="text-[#FFA41B] text-xl" />}
              colorClass="bg-[#FFA41B]"
            />
            
            <StatsCard
              title="Active Orders"
              value={stats.activeOrders}
              description="5% from yesterday"
              icon={<Clock className="text-green-500 text-xl" />}
              colorClass="bg-green-500"
            />
            
            <StatsCard
              title="Customers"
              value={stats.totalCustomers}
              description="15% from last month"
              icon={<Users className="text-[#2C5530] text-xl" />}
              colorClass="bg-[#2C5530]"
            />
          </div>
        ) : null}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Sales Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ) : stats ? (
                <div className="h-64 flex items-end justify-between space-x-2 pb-4 border-b border-gray-200">
                  {stats.monthlyStats.map((stat: any, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary rounded-t" 
                        style={{ height: `${(stat.sales / Math.max(...stats.monthlyStats.map((s: any) => s.sales))) * 100}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{stat.month}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="animate-pulse space-y-6">
                  {Array(4).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats && stats.topSellingItems ? (
                <div className="space-y-4">
                  {stats.topSellingItems.map((item: any, index: number) => {
                    let bgColor;
                    switch (index) {
                      case 0: bgColor = "bg-primary"; break;
                      case 1: bgColor = "bg-[#FFA41B]"; break;
                      case 2: bgColor = "bg-[#2C5530]"; break;
                      default: bgColor = "bg-gray-500";
                    }
                    
                    const maxQuantity = stats.topSellingItems[0].quantity;
                    const percentage = (item.quantity / maxQuantity) * 100;
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className={`w-10 h-10 ${bgColor} text-white rounded-full flex items-center justify-center mr-3`}>
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-bold">{item.quantity} sold</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                {Array(5).fill(0).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : stats && stats.recentOrders ? (
              <DataTable 
                data={stats.recentOrders}
                columns={orderColumns}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent orders available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
