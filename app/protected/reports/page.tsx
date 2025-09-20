import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get current month data
  const currentMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

  // Fetch transactions for current and last month
  const { data: currentMonthTransactions } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (name, color)
    `)
    .gte("date", currentMonth + "-01")
    .lt("date", new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10))

  const { data: lastMonthTransactions } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", lastMonth + "-01")
    .lt("date", currentMonth + "-01")

  // Calculate metrics
  const currentIncome =
    currentMonthTransactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0
  const currentExpenses =
    currentMonthTransactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0
  const lastIncome =
    lastMonthTransactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0
  const lastExpenses =
    lastMonthTransactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0

  const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0
  const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0
  const netIncome = currentIncome - currentExpenses

  // Category breakdown
  const categoryBreakdown = currentMonthTransactions?.reduce(
    (acc, transaction) => {
      if (transaction.type === "expense" && transaction.categories) {
        const categoryName = transaction.categories.name
        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            amount: 0,
            color: transaction.categories.color,
            count: 0,
          }
        }
        acc[categoryName].amount += transaction.amount
        acc[categoryName].count += 1
      }
      return acc
    },
    {} as Record<string, { name: string; amount: number; color: string; count: number }>,
  )

  const topCategories = Object.values(categoryBreakdown || {})
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Insights into your financial patterns and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${currentIncome.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {incomeChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              <span className={incomeChange >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(incomeChange).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${currentExpenses.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {expenseChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-red-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              )}
              <span className={expenseChange >= 0 ? "text-red-600" : "text-green-600"}>
                {Math.abs(expenseChange).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{netIncome >= 0 ? "Surplus" : "Deficit"} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentIncome > 0 ? ((netIncome / currentIncome) * 100).toFixed(1) : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Of income saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No expense data for this month</p>
              ) : (
                topCategories.map((category, index) => {
                  const percentage = currentExpenses > 0 ? (category.amount / currentExpenses) * 100 : 0
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${category.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{category.count} transactions</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total expenses</div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentMonthTransactions?.filter((t) => t.type === "income").length || 0}
                  </div>
                  <div className="text-sm text-green-600">Income Transactions</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {currentMonthTransactions?.filter((t) => t.type === "expense").length || 0}
                  </div>
                  <div className="text-sm text-red-600">Expense Transactions</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Daily Spending</span>
                  <span className="font-semibold">${(currentExpenses / new Date().getDate()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Largest Expense</span>
                  <span className="font-semibold">
                    $
                    {Math.max(
                      ...(currentMonthTransactions?.filter((t) => t.type === "expense").map((t) => t.amount) || [0]),
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Most Active Category</span>
                  <Badge variant="secondary">{topCategories[0]?.name || "None"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
