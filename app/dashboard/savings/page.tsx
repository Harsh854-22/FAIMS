import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowLeft, Plus, Target, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"

export default async function SavingsPlansPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's savings plans
  const { data: savingsPlans } = await supabase
    .from("savings_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Savings Plans</h1>
              <p className="text-sm text-muted-foreground">Create and manage your savings goals</p>
            </div>
          </div>
          <Link href="/dashboard/savings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {savingsPlans && savingsPlans.length > 0 ? (
          <div className="grid gap-6">
            {savingsPlans.map((plan) => {
              const progress =
                plan.target_amount > 0 ? (Number(plan.current_amount) / Number(plan.target_amount)) * 100 : 0
              const isCompleted = progress >= 100

              return (
                <Card key={plan.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{plan.title}</CardTitle>
                          <Badge variant={isCompleted ? "default" : plan.status === "active" ? "secondary" : "outline"}>
                            {isCompleted ? "Completed" : plan.status}
                          </Badge>
                          {plan.priority && (
                            <Badge
                              variant="outline"
                              className={
                                plan.priority === "high"
                                  ? "border-red-500 text-red-500"
                                  : plan.priority === "medium"
                                    ? "border-yellow-500 text-yellow-500"
                                    : "border-green-500 text-green-500"
                              }
                            >
                              {plan.priority} priority
                            </Badge>
                          )}
                        </div>
                        {plan.description && <CardDescription className="mb-4">{plan.description}</CardDescription>}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Target:</span>
                            <span className="font-medium">${Number(plan.target_amount).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Current:</span>
                            <span className="font-medium">${Number(plan.current_amount).toLocaleString()}</span>
                          </div>
                          {plan.target_date && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Due:</span>
                              <span className="font-medium">{new Date(plan.target_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/dashboard/savings/${plan.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Savings Plans Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first savings plan to start tracking your financial goals with detailed breakdowns and
              progress monitoring.
            </p>
            <Link href="/dashboard/savings/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Plan
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
