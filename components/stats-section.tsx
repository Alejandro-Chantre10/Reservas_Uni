import { Card, CardContent } from "@/components/ui/card"
import { Microscope, Camera, Laptop, Trophy } from "lucide-react"

const stats = [
  {
    label: "Equipos de Laboratorio",
    value: "45+",
    icon: Microscope,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    label: "Equipos Audiovisuales",
    value: "30+",
    icon: Camera,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    label: "Equipos Tecnologicos",
    value: "50+",
    icon: Laptop,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Equipos Deportivos",
    value: "100+",
    icon: Trophy,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
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
