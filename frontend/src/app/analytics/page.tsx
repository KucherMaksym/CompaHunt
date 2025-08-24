"use client"

import {DashboardLayout} from "@/components/dashboard-layout"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Badge} from "@/components/ui/badge"
import {Progress} from "@/components/ui/progress"
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Area,
    AreaChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    RadialBar,
    RadialBarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis, Label
} from "recharts"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    Clock,
    DollarSign,
    MapPin,
    Briefcase,
    Calendar,
    Building2,
    ArrowUp,
    ArrowDown,
    Eye,
    Phone,
    UserCheck,
    Trophy,
    XCircle,
    Archive,
    Sparkles,
    Zap,
    Activity,
    Globe,
    Home,
    Shuffle
} from "lucide-react"
import {cn} from "@/lib/utils"
import {useTheme} from "next-themes";

// Status data with proper colors
const statusData = [
    {status: "APPLIED", label: "Applied", count: 45, icon: Briefcase, className: "bg-status-applied/10 text-status-applied border-status-applied/20"},
    {status: "VIEWED", label: "Wishlist", count: 18, icon: Eye, className: "bg-status-viewed/10 text-status-viewed border-status-viewed/20"},
    // {status: "PHONE_SCREEN", label: "Phone Screen", count: 12, icon: Phone, className: "bg-status-phone-screen/10 text-status-phone-screen border-status-phone-screen/20"},
    {status: "INTERVIEW", label: "Interview", count: 8, icon: UserCheck, className: "bg-status-interview/10 text-status-interview border-status-interview/20"},
    {status: "OFFER", label: "Offer", count: 3, icon: Trophy, className: "bg-status-offer/10 text-status-offer border-status-offer/20"},
    {status: "REJECTED", label: "Rejected", count: 28, icon: XCircle, className: "bg-status-rejected/10 text-status-rejected border-status-rejected/20"},
]

const pieChartData = statusData.map(item => ({
    name: item.label,
    value: item.count,
    fill: item.status === "APPLIED" ? "var(--status-applied)" :
        item.status === "VIEWED" ? "var(--status-viewed)" :
            // item.status === "PHONE_SCREEN" ? "hsl(var(--chart-3))" :
            item.status === "INTERVIEW" ? "var(--status-interview)" :
                item.status === "OFFER" ? "var(--status-offer)" :
                    item.status === "REJECTED" ? "var(--status-rejected)" :
                        "hsl(var(--muted))"
}))

const monthlyApplications = [
    {month: "Jan", applied: 12, interviews: 3, offers: 1},
    {month: "Feb", applied: 18, interviews: 4, offers: 0},
    {month: "Mar", applied: 25, interviews: 6, offers: 2},
    {month: "Apr", applied: 22, interviews: 8, offers: 1},
    {month: "May", applied: 28, interviews: 5, offers: 3},
    {month: "Jun", applied: 15, interviews: 2, offers: 0}
]

const salaryData = [
    {range: "50-80k", count: 15, avg: 65},
    {range: "80-120k", count: 28, avg: 100},
    {range: "120-160k", count: 22, avg: 140},
    {range: "160-200k", count: 12, avg: 180},
    {range: "200k+", count: 8, avg: 250}
]

const remoteData = [
    {type: "Remote", label: "Remote", count: 32, icon: Globe, percentage: 37.6},
    {type: "On-site", label: "On-site", count: 28, icon: Building2, percentage: 32.9},
    {type: "Hybrid", label: "Hybrid", count: 25, icon: Shuffle, percentage: 29.4}
]

const topCompanies = [
    {company: "Google", applications: 8, interviews: 2, successRate: 25},
    {company: "Microsoft", applications: 6, interviews: 3, successRate: 50},
    {company: "Apple", applications: 5, interviews: 1, successRate: 20},
    {company: "Meta", applications: 4, interviews: 2, successRate: 50},
    {company: "Netflix", applications: 4, interviews: 1, successRate: 25}
]

const interviewTypes = [
    {type: "Phone Screen", label: "Phone Screen", count: 15, successRate: 60, icon: Phone, color: "text-blue-500"},
    {type: "Technical", label: "Technical", count: 12, successRate: 45, icon: Zap, color: "text-purple-500"},
    {type: "Behavioral", label: "Behavioral", count: 8, successRate: 75, icon: Users, color: "text-green-500"},
    {type: "Final Round", label: "Final Round", count: 6, successRate: 50, icon: Trophy, color: "text-amber-500"}
]

const chartConfig = {
    applied: {
        label: "Applications Submitted",
        color: "var(--status-applied)"
    },
    interviews: {
        label: "Interviews",
        color: "var(--status-interview)"
    },
    offers: {
        label: "Offers",
        color: "var(--status-offer)"
    }
}

// Response time data for radial chart
const responseTimeData = [
    {name: "0-3 days", value: 45, fill: "#10b981"},
    {name: "3-7 days", value: 30, fill: "#3b82f6"},
    {name: "7-14 days", value: 15, fill: "#f59e0b"},
    {name: "14+ days", value: 10, fill: "#ef4444"}
]

export default function AnalyticsPage() {

    const {resolvedTheme} = useTheme()

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Status Distribution - Modernized */}
                <div className="grid gap-6 grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary"/>
                                Top Companies
                            </CardTitle>
                            <CardDescription>Companies with the highest number of applications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topCompanies.map((company, index) => (
                                    <div key={company.company}
                                         className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-semibold group-hover:text-primary transition-colors">
                                                    {company.company}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3"/>
                                                        {company.applications} applications
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <UserCheck className="h-3 w-3"/>
                                                        {company.interviews} interviews
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary"/>
                                Status Visualization
                            </CardTitle>
                            <CardDescription>Interactive distribution chart</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        // paddingAngle={2}
                                        label={({name, value}) => `${name}: ${value}`}
                                    >
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className={` ${resolvedTheme === "dark" ? "fill-white" : "fill-black"} text-3xl font-bold`}
                                                            >
                                                                {statusData.reduce((tot, curVal) => tot + curVal.count, 0)}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className={` ${resolvedTheme === "dark" ? "fill-white" : "fill-black"}`}
                                                            >
                                                                Vacancies
                                                            </tspan>
                                                        </text>
                                                    )
                                                }
                                            }}
                                        />
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer"/>
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trends - Improved */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary"/>
                            Activity Dynamics
                        </CardTitle>
                        <CardDescription>Trends in applications, interviews, and offers by month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full h-[300px]">
                            <AreaChart data={monthlyApplications}>
                                <defs>
                                    <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--status-applied)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--status-applied)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--status-interview)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--status-interview)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--status-offer)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#var(--status-offer)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30"/>
                                <XAxis dataKey="month" className="text-xs"/>
                                <YAxis className="text-xs"/>
                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                <Area type="monotone" dataKey="applied" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApplied)" strokeWidth={2}/>
                                <Area type="monotone" dataKey="interviews" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorInterviews)" strokeWidth={2}/>
                                <Area type="monotone" dataKey="offers" stroke="#10b981" fillOpacity={1} fill="url(#colorOffers)" strokeWidth={2}/>
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Salary Distribution - Enhanced */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-amber-500"/>
                                Salary Distribution
                            </CardTitle>
                            <CardDescription>Salary ranges in your applications (thousands USD)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="w-full h-[300px]">
                                <BarChart data={salaryData}>
                                    <defs>
                                        <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30"/>
                                    <XAxis dataKey="range" className="text-xs"/>
                                    <YAxis className="text-xs"/>
                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                    <Bar dataKey="count" fill="url(#colorSalary)" radius={[8, 8, 0, 0]}/>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Remote Work Distribution - Enhanced */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary"/>
                                Work Format
                            </CardTitle>
                            <CardDescription>Distribution by employment type</CardDescription>
                        </CardHeader>
                        <CardContent className={`h-full`}>
                            <div className="flex flex-col justify-around h-full">
                                {remoteData.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <div key={item.type} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                        <Icon className="h-4 w-4 text-primary"/>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{item.label}</div>
                                                        <div className="text-sm text-muted-foreground">{item.count} positions</div>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="font-bold">
                                                    {item.percentage}%
                                                </Badge>
                                            </div>
                                            <Progress value={item.percentage} className="h-2"/>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}