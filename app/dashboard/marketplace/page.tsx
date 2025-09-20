import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Search, Star, Users, DollarSign, Target, ShoppingCart } from "lucide-react"

export default async function MarketplacePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all template savings plans with ratings
  const { data: templates } = await supabase
    .from("savings_plans")
    .select(
      `
      *,
      profiles!created_by(full_name),
      template_ratings(rating, review)
    `,
    )
    .eq("is_template", true)
    .order("created_at", { ascending: false })

  // Calculate average ratings
  const templatesWithRatings = templates?.map((template) => {
    const ratings = template.template_ratings || []
    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length : 0
    return {
      ...template,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
    }
  })

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
              <h1 className="text-xl font-bold">Template Marketplace</h1>
              <p className="text-sm text-muted-foreground">Discover proven financial templates</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search templates..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                All Categories
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                Emergency
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                Travel
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                Home
              </Badge>
            </div>
          </div>
        </div>

        {/* Featured Templates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Featured Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesWithRatings?.slice(0, 3).map((template) => (
              <Card key={template.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="mb-2">
                      {template.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span className="font-medium">{template.avgRating || "New"}</span>
                      <span className="text-muted-foreground">({template.reviewCount})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-medium">${Number(template.target_amount).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">By Expert</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">
                          ${Number(template.template_price).toFixed(2)}
                        </span>
                      </div>
                      <Link href={`/dashboard/marketplace/${template.id}`}>
                        <Button>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Templates */}
        <div>
          <h2 className="text-2xl font-bold mb-4">All Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesWithRatings?.map((template) => (
              <Card key={template.id} className="border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="mb-2">
                      {template.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span className="font-medium">{template.avgRating || "New"}</span>
                      <span className="text-muted-foreground">({template.reviewCount})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">${Number(template.target_amount).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">${Number(template.template_price).toFixed(2)}</span>
                      </div>
                    </div>

                    <Link href={`/dashboard/marketplace/${template.id}`}>
                      <Button className="w-full bg-transparent" variant="outline">
                        View Template
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {templatesWithRatings?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Templates Available</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Templates are being added to the marketplace. Check back soon for expert-created financial plans.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
