"use client"

import { usePersona } from "@/hooks/usePersona"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PersonaDisplay() {
  const { selectedPersona } = usePersona()

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-lg">
          {/* <span className="text-2xl">{selectedPersona.avatar}</span> */}
          <span>{selectedPersona.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <p className="text-sm text-muted-foreground mb-3">
          {selectedPersona.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {selectedPersona.characteristics.map((characteristic, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {characteristic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 