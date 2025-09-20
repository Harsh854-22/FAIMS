"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingCart, CheckCircle } from "lucide-react"

interface PurchaseTemplateButtonProps {
  templateId: string
  price: number
}

export function PurchaseTemplateButton({ templateId, price }: PurchaseTemplateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // In a real app, this would integrate with a payment processor
      // For demo purposes, we'll simulate a successful purchase
      const { error } = await supabase.from("template_purchases").insert({
        buyer_id: user.id,
        template_id: templateId,
        purchase_price: price,
      })

      if (error) throw error

      setIsPurchased(true)
      // Refresh the page to show the purchased state
      router.refresh()
    } catch (error) {
      console.error("Error purchasing template:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPurchased) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-primary">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Purchase Successful!</span>
        </div>
        <Button className="w-full" onClick={() => router.push("/dashboard/savings/new")}>
          Apply Template
        </Button>
      </div>
    )
  }

  return (
    <Button className="w-full" onClick={handlePurchase} disabled={isLoading}>
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isLoading ? "Processing..." : "Purchase Template"}
    </Button>
  )
}
