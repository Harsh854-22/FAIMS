import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Wallet, PiggyBank, Building } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch accounts
  const { data: accounts } = await supabase.from("accounts").select("*").order("created_at", { ascending: false })

  // Calculate total balance
  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Wallet className="h-5 w-5" />
      case "savings":
        return <PiggyBank className="h-5 w-5" />
      case "credit":
        return <CreditCard className="h-5 w-5" />
      case "investment":
        return <Building className="h-5 w-5" />
      default:
        return <Wallet className="h-5 w-5" />
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case "checking":
        return "text-blue-600"
      case "savings":
        return "text-green-600"
      case "credit":
        return "text-red-600"
      case "investment":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts and balances</p>
        </div>
        <Link href="/protected/accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </Link>
      </div>

      {/* Total Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">${totalBalance.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Across all accounts</p>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <div className="grid gap-6">
        {accounts?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first account to start tracking your finances
              </p>
              <Link href="/protected/accounts/new">
                <Button>Add Account</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts?.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${getAccountColor(account.type)}`}>{getAccountIcon(account.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <Badge variant="secondary" className="capitalize">
                          {account.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${account.balance.toFixed(2)}
                    </div>
                    {account.description && <p className="text-sm text-muted-foreground">{account.description}</p>}
                    <div className="text-xs text-muted-foreground">
                      Added {new Date(account.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
