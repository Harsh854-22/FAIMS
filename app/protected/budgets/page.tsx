import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function BudgetsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch budgets with spending data
  const { data: budgets } = await supabase
    .from("budgets")
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .order("created_at", { ascending: false })

  // Calculate spending for each budget
  const budgetsWithSpending = await Promise.all(
    (budgets || []).map(async (budget) => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("category_id", budget.category_id)
        .eq("type", "expense")
        .gte("date", budget.start_date)
        .lte("date", budget.end_date)

      const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const percentage = (spent / budget.amount) * 100

      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        status: percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "good",
      }
    }),
  )

  const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)
  const overBudgetCount = budgetsWithSpending.filter((b) => b.status === "over").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Track your spending against your budget goals</p>
        </div>
        <Link href="/protected/budgets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : "No budget set"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overBudgetCount}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <div className="grid gap-6">
        {budgetsWithSpending.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first budget to start tracking your spending
              </p>
              <Link href="/protected/budgets/new">
                <Button>Create Budget</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          budgetsWithSpending.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.categories?.color || "#6b7280" }}
                    />
                    <div>
                      <CardTitle className="text-lg">{budget.categories?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(budget.start_date).toLocaleDateString()} -{" "}
                        {new Date(budget.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      budget.status === "over" ? "destructive" : budget.status === "warning" ? "secondary" : "default"
                    }
                  >
                    {budget.status === "over" ? "Over Budget" : budget.status === "warning" ? "Near Limit" : "On Track"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Spent: ${budget.spent.toFixed(2)}</span>
                    <span>Budget: ${budget.amount.toFixed(2)}</span>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className={`h-2 ${
                      budget.status === "over"
                        ? "[&>div]:bg-red-500"
                        : budget.status === "warning"
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-green-500"
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{budget.percentage.toFixed(1)}% used</span>
                    <span>${(budget.amount - budget.spent).toFixed(2)} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
