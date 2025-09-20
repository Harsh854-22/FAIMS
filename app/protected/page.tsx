import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, TrendingUp, TrendingDown, DollarSign, Target, CreditCard, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's financial data
  const [accountsResult, transactionsResult, goalsResult, budgetsResult] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", data.user.id).eq("is_active", true),
    supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", data.user.id)
      .order("date", { ascending: false })
      .limit(5),
    supabase.from("financial_goals").select("*").eq("user_id", data.user.id).eq("is_achieved", false).limit(3),
    supabase.from("budgets").select("*, categories(name, color)").eq("user_id", data.user.id).eq("is_active", true),
  ])

  const accounts = accountsResult.data || []
  const recentTransactions = transactionsResult.data || []
  const goals = goalsResult.data || []
  const budgets = budgetsResult.data || []

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
  const totalIncome = recentTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = recentTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MoneyWise</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/protected" className="text-foreground font-medium">
              Dashboard
            </Link>
            <Link
              href="/protected/transactions"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Transactions
            </Link>
            <Link href="/protected/budgets" className="text-muted-foreground hover:text-foreground transition-colors">
              Budgets
            </Link>
            <Link href="/protected/goals" className="text-muted-foreground hover:text-foreground transition-colors">
              Goals
            </Link>
            <Link href="/protected/accounts" className="text-muted-foreground hover:text-foreground transition-colors">
              Accounts
            </Link>
            <Link href="/protected/reports" className="text-muted-foreground hover:text-foreground transition-colors">
              Reports
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/protected/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's your financial overview for today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {accounts.length} accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+${totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From recent transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From recent transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">Goals in progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Link href="/protected/transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions yet</p>
                  <Link href="/protected/transactions">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.categories?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </div>
              <Link href="/protected/goals">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No goals set yet</p>
                  <Link href="/protected/goals">
                    <Button>
                      <Target className="w-4 h-4 mr-2" />
                      Set Goal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{goal.name}</p>
                          <Badge variant="secondary">{Math.round(progress)}%</Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${Number(goal.current_amount).toLocaleString()}</span>
                          <span>${Number(goal.target_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/protected/transactions">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">Add Transaction</span>
                </Button>
              </Link>
              <Link href="/protected/accounts">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm">Manage Accounts</span>
                </Button>
              </Link>
              <Link href="/protected/budgets">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Target className="w-5 h-5" />
                  <span className="text-sm">Set Budget</span>
                </Button>
              </Link>
              <Link href="/protected/goals">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Create Goal</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
