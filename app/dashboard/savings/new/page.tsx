"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, Target } from "lucide-react"

interface SavingsPlanItem {
  id: string
  title: string
  amount: string
  notes: string
  dueDate: string
}

export default function NewSavingsPlanPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    targetDate: "",
    category: "",
    priority: "medium",
  })

  const [items, setItems] = useState<SavingsPlanItem[]>([
    {
      id: "1",
      title: "",
      amount: "",
      notes: "",
      dueDate: "",
    },
  ])

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

  const addItem = () => {
    const newItem: SavingsPlanItem = {
      id: Date.now().toString(),
      title: "",
      amount: "",
      notes: "",
      dueDate: "",
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof SavingsPlanItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Create the savings plan
      const { data: plan, error: planError } = await supabase
        .from("savings_plans")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          target_amount: Number.parseFloat(formData.targetAmount),
          target_date: formData.targetDate || null,
          category: formData.category,
          priority: formData.priority,
        })
        .select()
        .single()

      if (planError) throw planError

      // Create the plan items
      const validItems = items.filter((item) => item.title.trim() && item.amount.trim())
      if (validItems.length > 0) {
        const { error: itemsError } = await supabase.from("savings_plan_items").insert(
          validItems.map((item) => ({
            plan_id: plan.id,
            title: item.title,
            amount: Number.parseFloat(item.amount),
            notes: item.notes,
            due_date: item.dueDate || null,
          })),
        )

        if (itemsError) throw itemsError
      }

      router.push("/dashboard/savings")
    } catch (error) {
      console.error("Error creating savings plan:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/savings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Plans
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Create Savings Plan</h1>
              <p className="text-sm text-muted-foreground">Build your detailed savings strategy</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Plan Details</span>
              </CardTitle>
              <CardDescription>Set up the basic information for your savings plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Emergency Fund, Vacation to Europe"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ($) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="10000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your savings goal and why it's important to you..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Emergency, Travel, Home"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Savings Breakdown</CardTitle>
                  <CardDescription>Break down your savings plan into specific items or milestones</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Item {index + 1}</Badge>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Item Title</Label>
                        <Input
                          placeholder="e.g., First $1000, Monthly contribution"
                          value={item.title}
                          onChange={(e) => updateItem(item.id, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={item.amount}
                          onChange={(e) => updateItem(item.id, "amount", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                          placeholder="Additional details or reminders"
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => updateItem(item.id, "dueDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/dashboard/savings">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || !formData.title || !formData.targetAmount}>
              {isLoading ? "Creating..." : "Create Savings Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
