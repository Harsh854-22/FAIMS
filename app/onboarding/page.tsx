"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { PiggyBank, ArrowLeft, ArrowRight, DollarSign, Target, TrendingUp, Calendar, User } from "lucide-react"

interface OnboardingData {
  monthlyIncome: string
  monthlySpending: string
  currentSavings: string
  monthlyEmi: string
  financialGoals: string[]
  riskTolerance: string
  investmentExperience: string
  fiveYearPlan: string
}

const FINANCIAL_GOALS = [
  "Emergency Fund",
  "Home Purchase",
  "Car Purchase",
  "Education",
  "Retirement",
  "Travel",
  "Investment",
  "Debt Payoff",
  "Wedding",
  "Business",
]

const RISK_LEVELS = [
  { value: "low", label: "Conservative", description: "I prefer safe, stable returns" },
  { value: "medium", label: "Moderate", description: "I'm comfortable with some risk for better returns" },
  { value: "high", label: "Aggressive", description: "I'm willing to take high risks for high returns" },
]

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to investing and financial planning" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with basic investments" },
  { value: "advanced", label: "Advanced", description: "Experienced with various investment strategies" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const [data, setData] = useState<OnboardingData>({
    monthlyIncome: "",
    monthlySpending: "",
    currentSavings: "",
    monthlyEmi: "",
    financialGoals: [],
    riskTolerance: "",
    investmentExperience: "",
    fiveYearPlan: "",
  })

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [router])

  const handleGoalToggle = (goal: string) => {
    setData((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal],
    }))
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("financial_onboarding").insert({
        user_id: user.id,
        monthly_income: Number.parseFloat(data.monthlyIncome) || 0,
        monthly_spending: Number.parseFloat(data.monthlySpending) || 0,
        current_savings: Number.parseFloat(data.currentSavings) || 0,
        monthly_emi: Number.parseFloat(data.monthlyEmi) || 0,
        financial_goals: data.financialGoals,
        risk_tolerance: data.riskTolerance,
        investment_experience: data.investmentExperience,
        five_year_plan: data.fiveYearPlan,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving onboarding data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.monthlyIncome && data.monthlySpending
      case 2:
        return data.currentSavings && data.monthlyEmi
      case 3:
        return data.financialGoals.length > 0
      case 4:
        return data.riskTolerance && data.investmentExperience
      case 5:
        return data.fiveYearPlan.trim().length > 0
      default:
        return false
    }
  }

  const progress = (currentStep / 5) * 100

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MoneyWise</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Let&apos;s Get to Know You</h1>
          <p className="text-muted-foreground">Answer 5 quick questions to personalize your financial journey</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 5</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center space-x-3">
              {currentStep === 1 && <DollarSign className="w-6 h-6 text-primary" />}
              {currentStep === 2 && <TrendingUp className="w-6 h-6 text-primary" />}
              {currentStep === 3 && <Target className="w-6 h-6 text-primary" />}
              {currentStep === 4 && <User className="w-6 h-6 text-primary" />}
              {currentStep === 5 && <Calendar className="w-6 h-6 text-primary" />}
              <div>
                <CardTitle>
                  {currentStep === 1 && "Monthly Income & Spending"}
                  {currentStep === 2 && "Current Financial Position"}
                  {currentStep === 3 && "Financial Goals"}
                  {currentStep === 4 && "Investment Profile"}
                  {currentStep === 5 && "Future Vision"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Tell us about your monthly cash flow"}
                  {currentStep === 2 && "What's your current financial situation?"}
                  {currentStep === 3 && "What are you working towards?"}
                  {currentStep === 4 && "Help us understand your investment preferences"}
                  {currentStep === 5 && "Where do you see yourself in 5 years?"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Income & Spending */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="5000"
                      value={data.monthlyIncome}
                      onChange={(e) => setData((prev) => ({ ...prev, monthlyIncome: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlySpending">Monthly Spending ($)</Label>
                    <Input
                      id="monthlySpending"
                      type="number"
                      placeholder="3000"
                      value={data.monthlySpending}
                      onChange={(e) => setData((prev) => ({ ...prev, monthlySpending: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary">
                    💡 Include all sources of income and typical monthly expenses like rent, groceries, and utilities.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Current Position */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentSavings">Current Savings ($)</Label>
                    <Input
                      id="currentSavings"
                      type="number"
                      placeholder="10000"
                      value={data.currentSavings}
                      onChange={(e) => setData((prev) => ({ ...prev, currentSavings: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyEmi">Monthly EMI/Loans ($)</Label>
                    <Input
                      id="monthlyEmi"
                      type="number"
                      placeholder="500"
                      value={data.monthlyEmi}
                      onChange={(e) => setData((prev) => ({ ...prev, monthlyEmi: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <p className="text-sm text-secondary">
                    💡 Include all savings accounts, investments, and any loan payments (car, home, personal, etc.).
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Financial Goals */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Select your financial goals (choose multiple)</Label>
                  <p className="text-sm text-muted-foreground mb-4">What are you working towards?</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FINANCIAL_GOALS.map((goal) => (
                    <Badge
                      key={goal}
                      variant={data.financialGoals.includes(goal) ? "default" : "outline"}
                      className="p-3 cursor-pointer hover:bg-primary/10 transition-colors justify-center"
                      onClick={() => handleGoalToggle(goal)}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
                {data.financialGoals.length > 0 && (
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <p className="text-sm text-accent">
                      Great! You&apos;ve selected {data.financialGoals.length} goal
                      {data.financialGoals.length > 1 ? "s" : ""}. We&apos;ll help you create plans for each one.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Investment Profile */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Risk Tolerance</Label>
                  <p className="text-sm text-muted-foreground mb-4">How comfortable are you with investment risk?</p>
                  <div className="space-y-3">
                    {RISK_LEVELS.map((level) => (
                      <div
                        key={level.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          data.riskTolerance === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setData((prev) => ({ ...prev, riskTolerance: level.value }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{level.label}</p>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              data.riskTolerance === level.value
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Investment Experience</Label>
                  <p className="text-sm text-muted-foreground mb-4">What&apos;s your experience level?</p>
                  <div className="space-y-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <div
                        key={level.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          data.investmentExperience === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setData((prev) => ({ ...prev, investmentExperience: level.value }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{level.label}</p>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              data.investmentExperience === level.value
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Future Vision */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fiveYearPlan">Where do you see yourself financially in 5 years?</Label>
                  <Textarea
                    id="fiveYearPlan"
                    placeholder="Describe your financial aspirations, lifestyle goals, or major milestones you want to achieve..."
                    value={data.fiveYearPlan}
                    onChange={(e) => setData((prev) => ({ ...prev, fiveYearPlan: e.target.value }))}
                    className="min-h-32 resize-none"
                  />
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary">
                    💡 Think about your dream lifestyle, career goals, family plans, or financial independence targets.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className="flex items-center space-x-2"
            >
              <span>{isLoading ? "Setting up..." : "Complete Setup"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
