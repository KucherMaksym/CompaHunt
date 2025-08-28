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
import {useTheme} from "next-themes"
import {useQuery} from "@tanstack/react-query"
import {analyticsApi} from "@/lib/api/analytics"


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
    
    const {data: analyticsData, isLoading, error} = useQuery({
        queryKey: ['analytics'],
        queryFn: analyticsApi.getAnalyticsData,
    })

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-y-2 border-primary mb-6"></div>
                    <p className="text-muted-foreground text-lg">Loading your analytics...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Unable to load analytics</h2>
                        <p className="text-muted-foreground">Please try refreshing the page</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!analyticsData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
                        <p className="text-muted-foreground">Start applying to jobs to see your analytics</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Transform data for charts
    const pieChartData = analyticsData.statusDistribution.map(item => ({
        name: item.label,
        value: item.count,
        fill: item.status === "APPLIED" ? "var(--status-applied)" :
            item.status === "WISHLIST" ? "var(--status-viewed)" :
            item.status === "PHONE_SCREEN" ? "var(--status-phone-screen)" :
            item.status === "INTERVIEW" ? "var(--status-interview)" :
            item.status === "OFFER" ? "var(--status-offer)" :
            item.status === "REJECTED" ? "var(--status-rejected)" :
            "hsl(var(--muted))"
    }))

    const totalVacancies = analyticsData.statusDistribution.reduce((sum, item) => sum + item.count, 0)

    // Map remote work data with icons
    const remoteDataWithIcons = analyticsData.remoteWorkDistribution.map(item => ({
        ...item,
        icon: item.type === "Remote" ? Globe : item.type === "Hybrid" ? Shuffle : Building2
    }))

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
                                {analyticsData.topCompanies.map((company, index) => (
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
                                                                {totalVacancies}
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
                            <AreaChart data={analyticsData.monthlyTrends}>
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
                                <BarChart data={analyticsData.salaryDistribution}>
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
                                {remoteDataWithIcons.map((item) => {
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