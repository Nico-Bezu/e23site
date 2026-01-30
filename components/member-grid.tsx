import { Card, CardContent } from "@/components/ui/card"

// Suite members - can be updated to fetch from Redis later
const MEMBERS = [
  { id: 1, name: "Alex", oneLiner: "The night owl" },
  { id: 2, name: "Jordan", oneLiner: "Always down" },
  { id: 3, name: "Sam", oneLiner: "Chef mode" },
  { id: 4, name: "Casey", oneLiner: "Music curator" },
  { id: 5, name: "Morgan", oneLiner: "The planner" },
  { id: 6, name: "Riley", oneLiner: "Game master" },
  { id: 7, name: "Quinn", oneLiner: "Chill vibes" },
  { id: 8, name: "Avery", oneLiner: "Late night crew" },
]

export function MemberGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {MEMBERS.map((member, i) => (
        <Card
          key={member.id}
          className="group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
        >
          <CardContent className="p-4 text-center">
            {/* Avatar */}
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-primary/70">
                {member.name[0]}
              </span>
            </div>

            {/* Name */}
            <p className="font-medium transition-colors group-hover:text-primary">
              {member.name}
            </p>

            {/* One-liner */}
            <p className="text-sm text-muted-foreground mt-1">
              {member.oneLiner}
            </p>

            {/* Hover effect background */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
