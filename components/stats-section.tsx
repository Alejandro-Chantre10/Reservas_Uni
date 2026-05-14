import { Card, CardContent } from "@/components/ui/card"
import { Monitor, FlaskConical, Atom, Cpu } from "lucide-react"

const stats = [
  {
    label: "Labs de Computacion",
    value: "8+",
    icon: Monitor,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    label: "Labs de Quimica",
    value: "6+",
    icon: FlaskConical,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    label: "Labs de Fisica",
    value: "5+",
    icon: Atom,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    label: "Labs de Electronica",
    value: "4+",
    icon: Cpu,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

export function StatsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
