import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  PiggyBank,
  Target,
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  Plus,
  ArrowRight,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile and onboarding data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: onboarding } = await supabase.from("financial_onboarding").select("*").eq("user_id", user.id).single()

  // Fetch summary data for dashboard cards
  const { data: savingsPlans } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")

  const { data: financialGoals } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")

  const { data: bills } = await supabase.from("bills").select("*").eq("user_id", user.id).eq("status", "pending")

  // Calculate totals
  const totalSavingsTarget = savingsPlans?.reduce((sum, plan) => sum + Number(plan.target_amount), 0) || 0
  const totalSavingsCurrent = savingsPlans?.reduce((sum, plan) => sum + Number(plan.current_amount), 0) || 0
  const totalGoalsTarget = financialGoals?.reduce((sum, goal) => sum + Number(goal.target_amount), 0) || 0
  const totalGoalsCurrent = financialGoals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0
  const pendingBills = bills?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MoneyWise</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground">
                Welcome back, {profile?.full_name || user.email?.split("@")[0]}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/account">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Account
              </Button>
            </Link>
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/")
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress, manage your money, and achieve your financial goals.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${onboarding?.monthly_income?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">From onboarding</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSavingsCurrent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">of ${totalSavingsTarget.toLocaleString()} target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalGoalsCurrent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">of ${totalGoalsTarget.toLocaleString()} target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingBills.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{bills?.length || 0} bills due</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Savings Planner */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Savings Planner</CardTitle>
                    <CardDescription>Create and manage your savings plans</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{savingsPlans?.length || 0} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Progress</span>
                  <span className="font-medium">
                    {totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0}%
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link href="/dashboard/savings" className="flex-1">
                    <Button className="w-full">
                      View Plans
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/savings/new">
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Marketplace */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>Template Marketplace</CardTitle>
                    <CardDescription>Discover and buy proven financial templates</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Transform your financial plans with expert-created templates
                </div>
                <Link href="/dashboard/marketplace">
                  <Button className="w-full">
                    Browse Templates
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Financial Goals</CardTitle>
                    <CardDescription>Track goals and make deposits</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{financialGoals?.length || 0} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Progress</span>
                  <span className="font-medium">
                    {totalGoalsTarget > 0 ? Math.round((totalGoalsCurrent / totalGoalsTarget) * 100) : 0}%
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link href="/dashboard/goals" className="flex-1">
                    <Button className="w-full">
                      View Goals
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/goals/new">
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Management */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Bill Management</CardTitle>
                    <CardDescription>Track bills, EMIs, and payments</CardDescription>
                  </div>
                </div>
                <Badge variant={bills?.length ? "destructive" : "secondary"}>{bills?.length || 0} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {bills?.length ? `$${pendingBills.toLocaleString()} in pending bills` : "All bills are up to date"}
                </div>
                <div className="flex space-x-2">
                  <Link href="/dashboard/bills" className="flex-1">
                    <Button className="w-full">
                      Manage Bills
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/bills/new">
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest financial activities and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Welcome to MoneyWise!</p>
                    <p className="text-xs text-muted-foreground">You completed your financial onboarding</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                {savingsPlans?.length === 0 && financialGoals?.length === 0 && bills?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">Ready to start your financial journey?</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Link href="/dashboard/savings/new">
                        <Button size="sm">Create Savings Plan</Button>
                      </Link>
                      <Link href="/dashboard/goals/new">
                        <Button size="sm" variant="outline">
                          Set Financial Goal
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
