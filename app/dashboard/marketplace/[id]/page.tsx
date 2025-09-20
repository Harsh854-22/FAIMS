import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Star, Users, DollarSign, Target, CheckCircle, Calendar } from "lucide-react"
import { PurchaseTemplateButton } from "@/components/purchase-template-button"

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch template details with items and ratings
  const { data: template } = await supabase
    .from("savings_plans")
    .select(
      `
      *,
      profiles!created_by(full_name),
      savings_plan_items(*),
      template_ratings(rating, review, profiles(full_name))
    `,
    )
    .eq("id", id)
    .eq("is_template", true)
    .single()

  if (!template) {
    redirect("/dashboard/marketplace")
  }

  // Check if user already purchased this template
  const { data: purchase } = await supabase
    .from("template_purchases")
    .select("*")
    .eq("buyer_id", user.id)
    .eq("template_id", template.id)
    .single()

  // Calculate average rating
  const ratings = template.template_ratings || []
  const avgRating = ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/marketplace">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Template Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant="secondary">{template.category}</Badge>
                    <CardTitle className="text-2xl">{template.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="font-medium">{Math.round(avgRating * 10) / 10 || "New"}</span>
                        <span>({ratings.length} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>By {template.profiles?.full_name || "Expert"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">${Number(template.target_amount).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{template.description}</CardDescription>
              </CardContent>
            </Card>

            {/* Template Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
                <CardDescription>Detailed breakdown of this savings plan template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {template.savings_plan_items?.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.notes}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-medium">${Number(item.amount).toLocaleString()}</span>
                          </div>
                          {item.due_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {new Date(item.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {ratings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>What others are saying about this template</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ratings.map((rating: any, index: number) => (
                      <div key={index}>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">{rating.profiles?.full_name || "Anonymous"}</span>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < rating.rating ? "fill-current text-yellow-500" : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{rating.review}</p>
                          </div>
                        </div>
                        {index < ratings.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <span className="text-3xl font-bold text-primary">
                      ${Number(template.template_price).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchase ? (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Already Purchased</span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/savings/new">Apply Template</Link>
                    </Button>
                  </div>
                ) : (
                  <PurchaseTemplateButton templateId={template.id} price={Number(template.template_price)} />
                )}

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Instant download</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>One-click application</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Expert-created content</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Amount</span>
                  <span className="font-medium">${Number(template.target_amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items Included</span>
                  <span className="font-medium">{template.savings_plan_items?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priority Level</span>
                  <Badge
                    variant="outline"
                    className={
                      template.priority === "high"
                        ? "border-red-500 text-red-500"
                        : template.priority === "medium"
                          ? "border-yellow-500 text-yellow-500"
                          : "border-green-500 text-green-500"
                    }
                  >
                    {template.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
