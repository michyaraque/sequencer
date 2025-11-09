"use client"
import { Handle, Position } from "@xyflow/react"
import { cn } from "@/lib/utils"

const colorStyles = {
  blue: {
    background: "bg-blue-50",
    border: "border-blue-300",
    selectedBorder: "border-blue-500",
    headerBg: "bg-blue-700/40",
    iconBg: "bg-blue-700/40",
    hoverBorder: "hover:border-blue-400"
  },
  green: {
    background: "bg-green-50",
    border: "border-green-300",
    selectedBorder: "border-green-500",
    headerBg: "bg-green-700/40",
    iconBg: "bg-green-700/40",
    hoverBorder: "hover:border-green-400",
  },
  red: {
    background: "bg-red-50",
    border: "border-red-300",
    selectedBorder: "border-red-500",
    headerBg: "bg-red-700/40",
    iconBg: "bg-red-700/40",
    hoverBorder: "hover:border-red-400",
  },
  purple: {
    background: "bg-purple-50",
    border: "border-purple-300",
    selectedBorder: "border-purple-500",
    headerBg: "bg-purple-700/40",
    iconBg: "bg-purple-700/40",
    hoverBorder: "hover:border-purple-400",
  },
  violet: {
    background: "bg-violet-50",
    border: "border-violet-300",
    selectedBorder: "border-violet-500",
    headerBg: "bg-violet-700/40",
    iconBg: "bg-violet-700/40",
    hoverBorder: "hover:border-violet-400",
  },
  teal: {
    background: "bg-teal-50",
    border: "border-teal-300",
    selectedBorder: "border-teal-500",
    headerBg: "bg-teal-700/40",
    iconBg: "bg-teal-700/40",
    hoverBorder: "hover:border-teal-400",
  },
  cyan: {
    background: "bg-cyan-50",
    border: "border-cyan-300",
    selectedBorder: "border-cyan-500",
    headerBg: "bg-cyan-700/40",
    iconBg: "bg-cyan-700/40",
    hoverBorder: "hover:border-cyan-400",
  },
  sky: {
    background: "bg-sky-50",
    border: "border-sky-300",
    selectedBorder: "border-sky-500",
    headerBg: "bg-sky-700/40",
    iconBg: "bg-sky-700/40",
    hoverBorder: "hover:border-sky-400",
  },
  orange: {
    background: "bg-orange-50",
    border: "border-orange-300",
    selectedBorder: "border-orange-500",
    headerBg: "bg-orange-700/40",
    iconBg: "bg-orange-700/40",
    hoverBorder: "hover:border-orange-400"
  }
} as const

type ColorKey = keyof typeof colorStyles

type NodeContainerProps = {
  selected: boolean
  color: ColorKey
  icon: React.ReactNode
  label?: string
  subtitle?: string
  children: React.ReactNode
  minW?: string
  maxW?: string
  showSourceHandle?: boolean
  showTargetHandle?: boolean
  showTopBorder?: boolean
}

export function NodeContainer({
  selected,
  color,
  icon,
  label,
  subtitle,
  children,
  minW = "min-w-[220px]",
  maxW = "max-w-[320px]",
  showSourceHandle = true,
  showTargetHandle = true,
  showTopBorder = true
}: NodeContainerProps) {
  const styles = colorStyles[color]

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 transition-all",
        minW,
        maxW,
        styles.background,
        selected
          ? cn(styles.selectedBorder, "shadow-xl")
          : cn(styles.border, "shadow-md hover:shadow-lg", styles.hoverBorder)
      )}
    >
      {showSourceHandle && (
        <Handle type="target"
          position={Position.Left}
          className={cn(
            "w-4! h-8! bg-neutral-50! border-2! border-neutral-300! rounded-xs!",
            "hover:scale-110 transform-gpu transition-all"
          )} />
      )}

      <div className="space-y-2">
        <div className={cn(
          "flex items-center justify-between gap-2 py-3 px-4 rounded-md",
          styles.headerBg
        )}>
          <div className={cn(
            "text-white p-3 rounded text-xs font-bold font-mono shrink-0",
            styles.iconBg
          )}>
            {icon}
          </div>

          {label && (
            <div className="text-xs text-white truncate flex-1 flex flex-col">
              <span className="font-medium text-lg">{label}</span>
              {subtitle && <span className="text-white/70">{subtitle}</span>}
            </div>
          )}
        </div>

        <div className={cn(
          "text-xs space-y-1.5 text-neutral-700 border-neutral-200",
          showTopBorder && "border-t pt-2"
        )}>
          {children}
        </div>
      </div>

      {showTargetHandle && (
        <Handle type="source"
          position={Position.Right}
          className={cn(
            "w-4! h-8! bg-neutral-50! border-2! border-neutral-300! rounded-xs!",
            "hover:scale-110 transform-gpu transition-all"
          )}
        />
      )}
    </div>
  )
}