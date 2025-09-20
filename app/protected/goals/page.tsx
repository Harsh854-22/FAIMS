import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function GoalsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch goals
  const { data: goals } = await supabase.from("goals").select("*").order("created_at", { ascending: false })

  const totalGoals = goals?.length || 0
  const completedGoals = goals?.filter((g) => g.current_amount >= g.target_amount).length || 0
  const totalTargetAmount = goals?.reduce((sum, g) => sum + g.target_amount, 0) || 0
  const totalCurrentAmount = goals?.reduce((sum, g) => sum + g.current_amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial milestones</p>
        </div>
        <Link href="/protected/goals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTargetAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalCurrentAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-6">
        {goals?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first financial goal to start saving with purpose
              </p>
              <Link href="/protected/goals/new">
                <Button>Create Goal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          goals?.map((goal) => {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            const isCompleted = goal.current_amount >= goal.target_amount
            const daysLeft = Math.ceil(
              (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{goal.name}</CardTitle>
                      <p className="text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant={isCompleted ? "default" : daysLeft < 30 ? "destructive" : "secondary"}>
                      {isCompleted ? "Completed" : daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: ${goal.current_amount.toFixed(2)}</span>
                      <span>Target: ${goal.target_amount.toFixed(2)}</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-3 ${isCompleted ? "[&>div]:bg-green-500" : "[&>div]:bg-blue-500"}`}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% complete</span>
                      <span>${(goal.target_amount - goal.current_amount).toFixed(2)} remaining</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span className="capitalize">{goal.category}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
